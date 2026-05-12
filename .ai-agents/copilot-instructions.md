# GitHub Copilot Instructions - PDF Utilities Extension

**Purpose**: Custom instructions for GitHub Copilot when working on this project.

## Primary Reference

Always start with [AGENTS.md](../AGENTS.md) for the full project context.

## Critical Rules

### 1. Working Directory

All implementation work lives in `./extension/`. Treat root-level `src/`, `dist/`, and `tsconfig.json` as out of scope.

### 2. Module System

`extension/tsconfig.json` uses `module: nodenext`. Jest tests use `extension/tsconfig.test.json` with `module: commonjs`. Keep them separate.

### 3. PDF Library Usage

* Use `pdf-lib` for creating and modifying PDFs, and for reading metadata with `PDFDocument.load()`.
* Use `pdf-parse` only for text extraction in `readPDF`.
* Save `pdf-lib` documents with `{ useObjectStreams: false }` when compatibility with `pdf-parse` matters.
* Mock `pdf-parse` in unit tests.

### 4. File Existence Checks

Always call `existsSync()` before reading, modifying, or writing a PDF file.

### 5. VS Code API Version

`vscode.lm.registerTool` requires VS Code `^1.100.0`. Do not lower the engine requirement.

### 6. Tool Registration Pattern

Use `vscode.LanguageModelTool<T>` in `extension/src/tools.ts`, validate `options.input` early, call `PDFTools`, and return a `vscode.LanguageModelToolResult` with a JSON text part. Use the VS Code Language Model Tools API only.

```typescript
class MyTool implements vscode.LanguageModelTool<{ filePath: string }> {
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
  vscode.lm.registerTool('pdf-utilities_my_tool', new MyTool())
);
```

## Key Files

| File | Purpose |
|---|---|
| `extension/src/extension.ts` | Extension entry, registers tools, chat participant, and commands |
| `extension/src/tools.ts` | The 7 LanguageModelTool implementations |
| `extension/src/pdf-tools.ts` | PDF business logic (`PDFTools`) |
| `extension/package.json` | Extension manifest and tool contributions |
| `extension/tests/pdf-tools.test.ts` | Jest coverage for public PDF behavior |

## Tool List

1. `#pdf_read` / `pdf-utilities_read_pdf`
2. `#pdf_info` / `pdf-utilities_get_pdf_info`
3. `#pdf_create` / `pdf-utilities_create_pdf`
4. `#pdf_merge` / `pdf-utilities_merge_pdfs`
5. `#pdf_split` / `pdf-utilities_split_pdf`
6. `#pdf_metadata` / `pdf-utilities_update_metadata`
7. `#pdf_extract` / `pdf-utilities_extract_pages`

## Build & Test Commands

```bash
cd ./extension
npm run compile
npm test
npm run package
```

## Documentation Rules

Document user-facing changes when you add or alter a tool, change a public `PDFTools` method, or change anything that affects the README, AGENTS, or extension manifest.

## Contract Validation

Before changing public interfaces, read `skills/CONTRACT-REFERENCE.md` and update tests together with the implementation.