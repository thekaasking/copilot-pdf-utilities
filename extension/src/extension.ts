import * as vscode from 'vscode';
import * as path from 'path';
import { registerPdfTools } from './tools';

let outputChannel: vscode.OutputChannel;

function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    outputChannel.appendLine(`[${timestamp}] ${prefix} ${message}`);
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

async function extractPDFTextFromBuffer(buffer: Buffer): Promise<{ text: string; numPages: number }> {
    const data = await pdfParse(buffer);
    return { text: data.text || '', numPages: data.numpages || 0 };
}

function registerChatParticipant(context: vscode.ExtensionContext): void {
    try {
        if (typeof vscode.chat?.createChatParticipant !== 'function') {
            log('Chat Participant API not available', 'warn');
            return;
        }

        const participant = vscode.chat.createChatParticipant(
            'pdf-utilities.pdf',
            async (request, chatContext, response, token) => {
                log(`@pdf request: "${request.prompt}"`);

                const pdfUris: vscode.Uri[] = [];
                for (const ref of (request.references ?? [])) {
                    const value = ref.value;
                    if (value instanceof vscode.Uri && value.fsPath.toLowerCase().endsWith('.pdf')) {
                        pdfUris.push(value);
                    } else if (value && typeof value === 'object' && 'uri' in value) {
                        const loc = value as vscode.Location;
                        if (loc.uri.fsPath.toLowerCase().endsWith('.pdf')) {
                            pdfUris.push(loc.uri);
                        }
                    }
                }

                if (pdfUris.length === 0) {
                    response.markdown(
                        '**No PDF file detected.** To use `@pdf`, attach a PDF file to the chat:\n\n' +
                        '1. Click the **📎 attach** button\n' +
                        '2. Select a PDF file\n' +
                        '3. Ask your question\n\n' +
                        '*Example:* `@pdf Summarize this document`\n\n' +
                        '> You can also ask Copilot agent to use `#pdf_read`, `#pdf_info`, etc.'
                    );
                    return;
                }

                const pdfContents: string[] = [];
                let totalPages = 0;

                for (const uri of pdfUris) {
                    const fileName = path.basename(uri.fsPath);
                    try {
                        response.progress(`Reading ${fileName}…`);
                        const fileBytes = await vscode.workspace.fs.readFile(uri);
                        const pdfData = await extractPDFTextFromBuffer(Buffer.from(fileBytes));
                        totalPages += pdfData.numPages;
                        pdfContents.push(
                            `**${fileName}** (${pdfData.numPages} page${pdfData.numPages !== 1 ? 's' : ''})\n\n${pdfData.text}`
                        );
                        log(`Extracted ${pdfData.numPages} pages from ${fileName}`);
                    } catch (err) {
                        const msg = err instanceof Error ? err.message : String(err);
                        log(`Failed to read ${fileName}: ${msg}`, 'error');
                        response.markdown(`⚠️ Could not read **${fileName}**: ${msg}\n\n`);
                    }
                }

                if (pdfContents.length === 0) {
                    response.markdown('Could not extract text from any of the attached PDFs.');
                    return;
                }

                const pdfContext = pdfContents.join('\n\n---\n\n');
                const userQuestion = request.prompt?.trim() || 'Analyze and summarize this PDF document.';

                const messages: vscode.LanguageModelChatMessage[] = [];
                for (const turn of chatContext.history) {
                    if (turn instanceof vscode.ChatRequestTurn) {
                        messages.push(vscode.LanguageModelChatMessage.User(turn.prompt));
                    } else if (turn instanceof vscode.ChatResponseTurn) {
                        const text = turn.response
                            .filter((p): p is vscode.ChatResponseMarkdownPart => p instanceof vscode.ChatResponseMarkdownPart)
                            .map(p => p.value.value)
                            .join('');
                        if (text) { messages.push(vscode.LanguageModelChatMessage.Assistant(text)); }
                    }
                }

                messages.push(vscode.LanguageModelChatMessage.User(
                    `You are a helpful assistant for analysing PDF documents. ` +
                    `The user attached ${pdfUris.length} PDF file(s) (${totalPages} pages total). ` +
                    `Extracted text:\n\n--- PDF CONTENT ---\n${pdfContext}\n--- END ---\n\n` +
                    `User question: ${userQuestion}`
                ));

                try {
                    let models = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
                    if (!models?.length) {
                        models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
                    }
                    const model = models?.[0];
                    if (!model) {
                        response.markdown('⚠️ No language model available. Make sure GitHub Copilot is active.');
                        return;
                    }
                    log(`Using model: ${model.name}`);
                    const chatResponse = await model.sendRequest(messages, {}, token);
                    for await (const fragment of chatResponse.text) {
                        response.markdown(fragment);
                    }
                } catch (err) {
                    if (err instanceof vscode.CancellationError) { return; }
                    const msg = err instanceof Error ? err.message : String(err);
                    log(`Language model error: ${msg}`, 'error');
                    response.markdown(`⚠️ Language model error: ${msg}`);
                }
            }
        );

        participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
        context.subscriptions.push(participant);
        log('@pdf Chat Participant registered');
    } catch (err) {
        log(`Failed to register Chat Participant: ${err}`, 'warn');
    }
}

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('PDF Utilities', { log: true });
    context.subscriptions.push(outputChannel);
    log('PDF Utilities activating…');

    registerPdfTools(context);
    log('PDF Language Model Tools registered');

    registerChatParticipant(context);

    context.subscriptions.push(
        vscode.commands.registerCommand('pdfUtilities.viewDocs', () => {
            vscode.env.openExternal(
                vscode.Uri.parse('https://github.com/thekaasking/copilot-pdf-utilities#readme')
            );
        }),
        vscode.commands.registerCommand('pdfUtilities.showTools', () => {
            vscode.window.showInformationMessage(
                'PDF tools: #pdf_read, #pdf_info, #pdf_create, #pdf_merge, #pdf_split, #pdf_metadata, #pdf_extract, #read_docx'
            );
        })
    );

    const shown = context.globalState.get<boolean>('hasShownWelcome', false);
    if (!shown) {
        vscode.window.showInformationMessage(
            'PDF Utilities is ready! Use @pdf in chat to analyse PDFs, or ask Copilot agent to read/create/merge/split PDFs.',
            'View Docs', 'Got it'
        ).then(sel => {
            if (sel === 'View Docs') { vscode.commands.executeCommand('pdfUtilities.viewDocs'); }
        });
        context.globalState.update('hasShownWelcome', true);
    }

    log('PDF Utilities activated');
}

export function deactivate() {
    log('PDF Utilities deactivated');
}
