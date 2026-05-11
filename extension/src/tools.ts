import * as vscode from 'vscode';
import { PDFTools } from './pdf-tools';

const pdfTools = new PDFTools();

// ── Interfaces ────────────────────────────────────────────────────────────────

interface IReadPdfParams {
  filePath: string;
  pageRange?: string;
}

interface IGetPdfInfoParams {
  filePath: string;
}

interface ICreatePdfParams {
  content: string;
  outputPath: string;
  title?: string;
  author?: string;
  subject?: string;
  fontSize?: number;
  pageSize?: string;
}

interface IMergePdfsParams {
  filePaths: string[];
  outputPath: string;
}

interface ISplitPdfParams {
  filePath: string;
  pageRange: string;
  outputPath: string;
}

interface IUpdatePdfMetadataParams {
  filePath: string;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  outputPath?: string;
}

interface IExtractPagesParams {
  filePath: string;
  pages: number[];
  outputDir: string;
  prefix?: string;
}

// ── Tool: read_pdf ─────────────────────────────────────────────────────────────

export class ReadPdfTool implements vscode.LanguageModelTool<IReadPdfParams> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IReadPdfParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { filePath, pageRange } = options.input;
    const result = await pdfTools.readPDF(filePath, pageRange);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IReadPdfParams>,
    _token: vscode.CancellationToken
  ) {
    return {
      invocationMessage: `Reading PDF: ${options.input.filePath}`,
      confirmationMessages: {
        title: 'Read PDF',
        message: new vscode.MarkdownString(
          `Extract text from \`${options.input.filePath}\`${options.input.pageRange ? ` (pages ${options.input.pageRange})` : ''}?`
        )
      }
    };
  }
}

// ── Tool: get_pdf_info ─────────────────────────────────────────────────────────

export class GetPdfInfoTool implements vscode.LanguageModelTool<IGetPdfInfoParams> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IGetPdfInfoParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const result = await pdfTools.getPDFInfo(options.input.filePath);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IGetPdfInfoParams>,
    _token: vscode.CancellationToken
  ) {
    return {
      invocationMessage: `Getting info for: ${options.input.filePath}`
    };
  }
}

// ── Tool: create_pdf ───────────────────────────────────────────────────────────

export class CreatePdfTool implements vscode.LanguageModelTool<ICreatePdfParams> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<ICreatePdfParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { content, outputPath, title, author, subject, fontSize, pageSize } = options.input;
    const result = await pdfTools.createPDF(content, outputPath, {
      title, author, subject, fontSize,
      pageSize: pageSize as import('./pdf-tools').CreatePDFOptions['pageSize']
    });
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<ICreatePdfParams>,
    _token: vscode.CancellationToken
  ) {
    return {
      invocationMessage: `Creating PDF at: ${options.input.outputPath}`,
      confirmationMessages: {
        title: 'Create PDF',
        message: new vscode.MarkdownString(
          `Create a new PDF at \`${options.input.outputPath}\`?`
        )
      }
    };
  }
}

// ── Tool: merge_pdfs ───────────────────────────────────────────────────────────

export class MergePdfsTool implements vscode.LanguageModelTool<IMergePdfsParams> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IMergePdfsParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { filePaths, outputPath } = options.input;
    const result = await pdfTools.mergePDFs(filePaths, outputPath);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IMergePdfsParams>,
    _token: vscode.CancellationToken
  ) {
    const count = options.input.filePaths.length;
    return {
      invocationMessage: `Merging ${count} PDFs into: ${options.input.outputPath}`,
      confirmationMessages: {
        title: 'Merge PDFs',
        message: new vscode.MarkdownString(
          `Merge ${count} PDF file(s) into \`${options.input.outputPath}\`?`
        )
      }
    };
  }
}

// ── Tool: split_pdf ────────────────────────────────────────────────────────────

export class SplitPdfTool implements vscode.LanguageModelTool<ISplitPdfParams> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<ISplitPdfParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { filePath, pageRange, outputPath } = options.input;
    const result = await pdfTools.splitPDF(filePath, pageRange, outputPath);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<ISplitPdfParams>,
    _token: vscode.CancellationToken
  ) {
    return {
      invocationMessage: `Splitting PDF pages ${options.input.pageRange} to: ${options.input.outputPath}`,
      confirmationMessages: {
        title: 'Split PDF',
        message: new vscode.MarkdownString(
          `Extract pages \`${options.input.pageRange}\` from \`${options.input.filePath}\` into \`${options.input.outputPath}\`?`
        )
      }
    };
  }
}

// ── Tool: update_pdf_metadata ──────────────────────────────────────────────────

export class UpdatePdfMetadataTool implements vscode.LanguageModelTool<IUpdatePdfMetadataParams> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IUpdatePdfMetadataParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { filePath, title, author, subject, keywords, outputPath } = options.input;
    const result = await pdfTools.updatePDFMetadata(
      filePath,
      { title, author, subject, keywords },
      outputPath
    );
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IUpdatePdfMetadataParams>,
    _token: vscode.CancellationToken
  ) {
    return {
      invocationMessage: `Updating metadata for: ${options.input.filePath}`,
      confirmationMessages: {
        title: 'Update PDF Metadata',
        message: new vscode.MarkdownString(
          `Update metadata of \`${options.input.filePath}\`?`
        )
      }
    };
  }
}

// ── Tool: extract_pages ────────────────────────────────────────────────────────

export class ExtractPagesTool implements vscode.LanguageModelTool<IExtractPagesParams> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IExtractPagesParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { filePath, pages, outputDir, prefix } = options.input;
    const result = await pdfTools.extractPages(filePath, pages, outputDir, prefix);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IExtractPagesParams>,
    _token: vscode.CancellationToken
  ) {
    return {
      invocationMessage: `Extracting pages ${options.input.pages.join(', ')} to: ${options.input.outputDir}`,
      confirmationMessages: {
        title: 'Extract PDF Pages',
        message: new vscode.MarkdownString(
          `Extract pages [${options.input.pages.join(', ')}] from \`${options.input.filePath}\` into \`${options.input.outputDir}\`?`
        )
      }
    };
  }
}

// ── Registration helper ────────────────────────────────────────────────────────

export function registerPdfTools(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.lm.registerTool('pdf-utilities_read_pdf', new ReadPdfTool()),
    vscode.lm.registerTool('pdf-utilities_get_pdf_info', new GetPdfInfoTool()),
    vscode.lm.registerTool('pdf-utilities_create_pdf', new CreatePdfTool()),
    vscode.lm.registerTool('pdf-utilities_merge_pdfs', new MergePdfsTool()),
    vscode.lm.registerTool('pdf-utilities_split_pdf', new SplitPdfTool()),
    vscode.lm.registerTool('pdf-utilities_update_metadata', new UpdatePdfMetadataTool()),
    vscode.lm.registerTool('pdf-utilities_extract_pages', new ExtractPagesTool())
  );
}
