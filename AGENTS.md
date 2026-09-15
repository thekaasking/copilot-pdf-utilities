# PDF Utilities Extension - AI Agent Guide

**Version**: 2.0.0  
**Last Updated**: 11-05-2026
**Project Type**: VS Code Extension with Language Model Tools

---

## Project Overview

PDF Utilities is a VS Code extension that registers 7 PDF manipulation tools via the VS Code Language Model Tools API (`vscode.lm.registerTool`). These tools are natively available to GitHub Copilot and any other LLM inside VS Code agent mode — no MCP server or network process required.

### Core Capabilities

* Read & extract text from PDFs (with page range support)
* Get PDF metadata (pages, title, author, size, dates)
* Create PDFs from text with formatting options
* Merge multiple PDFs into one
* Split PDFs by page range
* Update PDF metadata
* Extract individual pages to separate files

---

## 🏗️ Architecture

### Directory Structure

```
copilot-pdf-utilities/            ← repo root 
├── extension/                ← VS Code extension source (primary working directory)
│   ├── src/
│   │   ├── extension.ts     ← Extension activation, registers tools + @pdf chat participant
│   │   ├── tools.ts         ← 7 LanguageModelTool classes + registerPdfTools()
│   │   ├── pdf-tools.ts     ← PDF business logic (pdf-lib + pdf-parse)
│   │   └── tokenizer.ts     ← Lightweight word count + token estimation utilities
│   ├── tests/
│   │   ├── pdf-tools.test.ts ← Jest unit tests (27 tests, all passing)
│   │   └── tokenizer.test.ts ← Jest unit tests for tokenizer + pagination (26 tests)
│   ├── resources/
│   │   └── instructions/
│   │       └── pdf-utilities.instructions.md ← Copilot chat instructions
│   ├── dist/                ← Compiled output (gitignored)
│   ├── package.json         ← Extension manifest (contributes.languageModelTools)
│   ├── tsconfig.json        ← TypeScript config (module: nodenext)
│   ├── tsconfig.test.json   ← TypeScript config for Jest (module: commonjs)
│   └── jest.config.js       ← Jest configuration
├── README.md                ← Project readme
├── assets/BUILD_PUBLISH_GUIDE.md   ← Build and publish instructions
└── docs/                    ← Reference documentation
```

### Component Responsibilities

**Extension Entry (`extension/src/extension.ts`)**:

* Activates on VS Code startup
* Calls `registerPdfTools(context)` to register 7 LM tools
* Registers `@pdf` chat participant
* Registers commands: `pdfUtilities.viewDocs`, `pdfUtilities.showTools`

**LM Tool Classes (`extension/src/tools.ts`)**:

* 7 classes implementing `vscode.LanguageModelTool<T>`: `ReadPdfTool`, `GetPdfInfoTool`, `CreatePdfTool`, `MergePdfsTool`, `SplitPdfTool`, `UpdatePdfMetadataTool`, `ExtractPagesTool`
* Each implements `invoke()` and `prepareInvocation()`
* Tool names registered: `pdf-utilities_read_pdf`, `pdf-utilities_get_pdf_info`, etc.
* User-facing `#` references: `#pdf_read`, `#pdf_info`, `#pdf_create`, `#pdf_merge`, `#pdf_split`, `#pdf_metadata`, `#pdf_extract`

**PDF Business Logic (`extension/src/pdf-tools.ts`)**:

* `PDFTools` class with all PDF operations
* Uses `pdf-lib` for creation/modification (with `useObjectStreams: false` for compatibility)
* Uses `pdf-parse` for text extraction only
* Uses `pdf-lib`'s `PDFDocument.load()` for metadata reading (more reliable than pdf-parse for this)
* `readPDF` supports optional `maxWords` / `maxTokens` pagination (truncates text, reports full counts)
* `getPDFInfo` returns `wordCount` and `approxTokenCount` alongside other metadata

**Tokenizer (`extension/src/tokenizer.ts`)**:

* Lightweight, zero-dependency token/word estimation
* `countWords(text)`: whitespace-based word count
* `estimateTokens(text)`: approximate LLM token count using `ceil(chars / 4)` heuristic (~±10% for English, compatible with GPT/Claude BPE)
* `truncateByWords(text, max)` / `truncateByTokens(text, max)`: pagination helpers that cut at word boundaries

---

## 🛠️ Development Environment

### Prerequisites

```bash
node >= 20.0.0
npm >= 9.0.0
VS Code >= 1.100.0
```

### Setup

```bash
cd extension
npm install
npm run compile
```

### Build Commands

```bash
cd extension
npm run compile   # Build TypeScript → dist/
npm run watch     # Watch mode
npm test          # Run Jest unit tests (27 tests)
npm run package   # Create .vsix
npm run publish   # Publish to VS Code Marketplace
```

### Debugging

Press `F5` in VS Code — the "Launch PDF Utilities Extension" config starts an extension development host with the extension loaded.

---

## 📝 Code Conventions

### TypeScript Standards

* **Strict Mode**: Enabled (`"strict": true`)
* **Module System**: `nodenext` (extension), `commonjs` (Jest via `tsconfig.test.json`)
* **Target**: ES2022
* **Null Safety**: Always check `existsSync()` before file operations

### Naming Conventions

```typescript
// Classes: PascalCase
class PDFTools {}

// LM Tool Names: snake_case with extension prefix (VS Code convention)
'pdf-utilities_read_pdf'

// User-facing tool references (in Copilot chat)
#pdf_read, #pdf_info, #pdf_create

// Methods: camelCase
async readPDF(filePath: string): Promise<PDFTextContent>
```

### Error Patterns

```typescript
// ✅ Check file existence before operations
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}

// ✅ LM Tool invoke() wraps errors as LanguageModelToolResult
async invoke(options, token) {
  try {
    const result = await this.pdfTools.readPDF(args.filePath);
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  } catch (error) {
    throw new Error(`pdf-utilities_read_pdf failed: ${(error as Error).message}`);
  }
}
```

---

## 🔧 Key Technical Patterns

### 1. Registering an LM Tool

```typescript
// In tools.ts — one class per tool
class ReadPdfTool implements vscode.LanguageModelTool<{ filePath: string; pageRange?: string }> {
  async invoke(options, _token) {
    const args = options.input;
    // validate + execute ...
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }

  async prepareInvocation(options, _token) {
    return {
      invocationMessage: `Reading PDF: ${options.input.filePath}`
    };
  }
}

// In extension.ts (via registerPdfTools)
context.subscriptions.push(
  vscode.lm.registerTool('pdf-utilities_read_pdf', new ReadPdfTool())
);
```

### 2. package.json Tool Contribution

```json
"contributes": {
  "languageModelTools": [
    {
      "name": "pdf-utilities_read_pdf",
      "displayName": "Read PDF",
      "modelDescription": "Extracts text content from a PDF file",
      "canBeReferencedInPrompt": true,
      "toolReferenceName": "pdf_read",
      "inputSchema": {
        "type": "object",
        "properties": {
          "filePath": { "type": "string", "description": "Absolute path to the PDF file" },
          "pageRange": { "type": "string", "description": "Page range e.g. '1-3,5'" }
        },
        "required": ["filePath"]
      }
    }
  ]
}
```

### 3. Writing Tests

```typescript
// Tests mock pdf-parse to avoid compatibility issues with pdf-lib-generated PDFs
jest.mock('pdf-parse', () =>
  jest.fn((_buffer: Buffer) =>
    Promise.resolve({ numpages: 1, text: 'Hello PDF world', info: {} })
  )
);

// Use os.tmpdir() for all test file I/O
const out = path.join(os.tmpdir(), `test-${Date.now()}.pdf`);
```

---

## ⚠️ Critical Notes

1. **Module compatibility**: `tsconfig.json` uses `module: nodenext`. Jest requires `tsconfig.test.json` with `module: commonjs` — do not merge them.
2. **pdf-parse compatibility**: `pdf-parse` uses pdfjs v1.10 (2017) and cannot parse some pdf-lib-generated PDFs. Always save with `{ useObjectStreams: false }`. Mock pdf-parse in unit tests.
3. **getPDFInfo uses pdf-lib**: Metadata is read via `PDFDocument.load()` (not pdf-parse) for reliability.
4. **VS Code API version**: Requires `^1.100.0` — `vscode.lm.registerTool` is not available in older versions.
5. **Never commit `.env`** with tokens or secrets.

---

## 🔗 Links

* **Repository**: <https://github.com/thekaasking/copilot-pdf-utilities>
* **Marketplace**: <https://marketplace.visualstudio.com/items?itemName=thekaasking.pdf-utilities>
* **Issues**: <https://github.com/thekaasking/copilot-pdf-utilities/issues>
