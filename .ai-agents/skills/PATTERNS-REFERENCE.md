# Code Patterns Reference - PDF Utilities Extension

**Purpose**: Common code patterns, conventions, and best practices for this project.

---

## LM Tool Patterns

### Registering a New Tool

```typescript
class MyPdfTool implements vscode.LanguageModelTool<{ filePath: string }> {
  private pdfTools = new PDFTools();

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<{ filePath: string }>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { filePath } = options.input;
    if (!filePath) {
      throw new Error('filePath is required');
    }

    const result = await this.pdfTools.getPDFInfo(filePath);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<{ filePath: string }>,
    _token: vscode.CancellationToken
  ): Promise<{ invocationMessage: string }> {
    return { invocationMessage: `Processing ${options.input.filePath}` };
  }
}

context.subscriptions.push(
  vscode.lm.registerTool('pdf-utilities_my_tool', new MyPdfTool())
);
```

### Tool Contribution Pattern

```json
{
  "name": "pdf-utilities_my_tool",
  "displayName": "My PDF Tool",
  "modelDescription": "Does something with a PDF file",
  "canBeReferencedInPrompt": true,
  "toolReferenceName": "pdf_my_tool",
  "inputSchema": {
    "type": "object",
    "properties": {
      "filePath": { "type": "string", "description": "Absolute path to the PDF file" }
    },
    "required": ["filePath"]
  }
}
```

---

## PDF Operation Patterns

### File Existence Check

```typescript
import { existsSync } from 'fs';

if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}
```

### pdf-lib: Create or Modify PDFs

```typescript
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage(PageSizes.A4);
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Hello', { x: 50, y: 750, size: 12, font, color: rgb(0, 0, 0) });
const bytes = await pdfDoc.save({ useObjectStreams: false });
writeFileSync(outputPath, bytes);
```

### pdf-lib: Read Metadata

```typescript
const pdfDoc = await PDFDocument.load(readFileSync(filePath));
const title = pdfDoc.getTitle();
const author = pdfDoc.getAuthor();
const pages = pdfDoc.getPageCount();
```

### pdf-parse: Extract Text

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
const data = await pdfParse(readFileSync(filePath));
// data.text, data.numpages, data.info
```

---

## Test Patterns

```typescript
// Mock pdf-parse at the top of every test file
jest.mock('pdf-parse', () =>
  jest.fn((_buffer: Buffer) =>
    Promise.resolve({ numpages: 1, text: 'Test content', info: {} })
  )
);

// Use os.tmpdir() for all test file I/O
const out = path.join(os.tmpdir(), `pdf-test-${Date.now()}.pdf`);
try {
  fs.unlinkSync(out);
} catch {
  // ignore
}
```

---

## TypeScript Patterns

### Strict Typing

```typescript
async readPDF(filePath: string, pageRange?: string): Promise<PDFTextContent> {
  // ...
}
```

### Options Pattern

```typescript
async createPDF(
  content: string,
  outputPath: string,
  options: CreatePDFOptions = {}
): Promise<{ success: boolean; path: string; pages: number }> {
  const fontSize = options.fontSize || 12;
  const pageSize = options.pageSize ? PageSizes[options.pageSize] : PageSizes.A4;
  // ...
}
```

---

## VS Code Extension Patterns

### Activation Pattern

```typescript
export function activate(context: vscode.ExtensionContext) {
  registerPdfTools(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('pdfUtilities.viewDocs', () => {
      vscode.env.openExternal(
        vscode.Uri.parse('https://github.com/thekaasking/copilot-pdf-utilities#readme')
      );
    }),
    vscode.commands.registerCommand('pdfUtilities.showTools', () => {
      vscode.window.showInformationMessage(
        'PDF tools: #pdf_read, #pdf_info, #pdf_create, #pdf_merge, #pdf_split, #pdf_metadata, #pdf_extract'
      );
    })
  );
}
```

### Chat Participant Pattern

Keep the `@pdf` participant focused on attached PDFs and use `vscode.lm.selectChatModels()` to call a Copilot model when text extraction has been prepared.

---

## Practical Rules

* Validate inputs early in every tool handler.
* Check files with `existsSync()` before operating on them.
* Use `pdf-lib` for creation, modification, and metadata.
* Use `pdf-parse` only for text extraction.
* Save with `useObjectStreams: false` when the result must remain compatible with `pdf-parse`.
* Keep examples rooted in `extension/` paths and `vscode.lm.registerTool`.