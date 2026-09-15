# Quick Reference - PDF Utilities Extension

**Purpose**: Condensed cheat sheet for working on this project.

## Every Conversation Workflow

1. Read [AGENTS.md](../AGENTS.md) for full context
2. Identify which file you need (`extension/src/pdf-tools.ts`, `extension/src/tools.ts`, etc.)
3. Run `npm run compile` after changes to check for errors
4. Run `npm test` to verify 64 unit tests still pass
5. Press `F5` to test in the extension host

## Critical Rules

| Rule | Detail |
| --- | --- |
| Module system | `tsconfig.json` = nodenext; `tsconfig.test.json` = commonjs. Never merge. |
| pdf-lib save | Always `pdfDoc.save({ useObjectStreams: false })` |
| Metadata reads | Use `PDFDocument.load()` (pdf-lib), NOT pdf-parse |
| File checks | `existsSync()` before every file operation |
| VS Code version | Engine must stay `^1.100.0` |
| Tests | Mock pdf-parse: `jest.mock('pdf-parse', ...)`. `.docx` tests use the real fixture (no mocking); `.doc` tests mock `word-extractor`. |

### PATH CONVENTION (MOST IMPORTANT!)

```typescript
// ✅ CORRECT - All examples must use relative paths
"./extension/src/pdf-tools.ts"
"./extension/src/tools.ts"
"./extension/package.json"

// ❌ WRONG - Never use absolute paths
"/absolute/path/to/file.ts"
```

* [ ] Validate `options.input` before using it in LM tool handlers
* [ ] Use clear error handling around PDF operations that can fail
* [ ] Check file existence with `existsSync()` before operations
* [ ] Follow strict TypeScript (avoid `any` unless there is a strong reason)

### After Meaningful Progress

* [ ] Update `README.md`, `extension/README.md`, or `AGENTS.md` if user-facing behavior changes
* [ ] Run `npm run compile` and `npm test` before packaging

## Key Files Cheat Sheet

```txt
extension/src/extension.ts     -  Activation, tool+participant registration
extension/src/tools.ts         -  8 LanguageModelTool classes
extension/src/pdf-tools.ts     -  PDFTools class (business logic)
extension/src/docx-tools.ts    -  DocxTools class (Word document business logic)
extension/package.json         -  languageModelTools contributions
extension/tests/pdf-tools.test.ts     -  27 Jest tests (all must pass)
extension/tests/docx-tools.test.ts    -  .docx Jest tests (real fixture)
extension/tests/docx-tools-doc.test.ts -  .doc Jest tests (word-extractor mocked)
extension/tsconfig.json        -  Production TS config (nodenext)
extension/tsconfig.test.json   -  Test TS config (commonjs)
extension/jest.config.js       -  Jest config (points to tsconfig.test.json)
```

## Build Commands

```bash
cd extension
npm run compile   # Build TypeScript
npm test          # Run 64 unit tests
npm run watch     # Watch mode
npm run package   # Create .vsix
npm run publish   # Publish to Marketplace
```

---

## LM Tool Classes (one per tool)

| Class | Tool Name | `#` Reference |
| --- | --- | --- |
| `ReadPdfTool` | `pdf-utilities_read_pdf` | `#pdf_read` |
| `ReadDocxTool` | `pdf-utilities_read_docx` | `#read_docx` |
| `GetPdfInfoTool` | `pdf-utilities_get_pdf_info` | `#pdf_info` |
| `CreatePdfTool` | `pdf-utilities_create_pdf` | `#pdf_create` |
| `MergePdfsTool` | `pdf-utilities_merge_pdfs` | `#pdf_merge` |
| `SplitPdfTool` | `pdf-utilities_split_pdf` | `#pdf_split` |
| `UpdatePdfMetadataTool` | `pdf-utilities_update_metadata` | `#pdf_metadata` |
| `ExtractPagesTool` | `pdf-utilities_extract_pages` | `#pdf_extract` |
