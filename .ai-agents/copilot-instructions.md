# GitHub Copilot Instructions - PDF Utilities Extension

**Purpose**: Custom instructions for GitHub Copilot when working with this project.

---

## 🎯 Primary Reference

**Always start by reading**: [AGENTS.md](../AGENTS.md) for complete project context.

---

## 🚨 Critical Rules

### 1. Working Directory

All extension work is done inside `./extension/`. The root-level `src/`, `dist/`, and `tsconfig.json` are no longer part of the project.

### 2. Module System

`extension/tsconfig.json` uses `module: nodenext`. Jest tests require `extension/tsconfig.test.json` which overrides to `module: commonjs`. **Never merge these two configs.**

### 3. PDF Library Usage

* Use `pdf-lib` for everything that modifies or creates PDFs, and for reading metadata (`PDFDocument.load()`)
* Use `pdf-parse` only for text extraction (`readPDF`)
* Always save pdf-lib documents with `{ useObjectStreams: false }` for pdf-parse compatibility
* Mock pdf-parse in unit tests — it cannot parse pdf-lib-generated PDFs in tests

### 4. File Existence Checks

Always call `existsSync()` before reading or writing a PDF file:
```typescript
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}
```

### 5. VS Code API Version

`vscode.lm.registerTool` requires VS Code `^1.100.0`. Do not lower the engine requirement.

---

## 📦 Tool Registration Quick Pattern

```typescript
// tools.ts
class MyTool implements vscode.LanguageModelTool<{ param: string }> {
  async invoke(options, _token) {
    const { param } = options.input;
    // validate + do work
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(JSON.stringify(result))
    ]);
  }
  async prepareInvocation(options, _token) {
    return { invocationMessage: `Working on ${options.input.param}` };
  }
}

// extension.ts
context.subscriptions.push(
  vscode.lm.registerTool('pdf-utilities_my_tool', new MyTool())
);
```

---

## 🔗 Key Files

| File | Purpose |
|---|---|
| `extension/src/extension.ts` | Extension entry, activates tools and @pdf participant |
| `extension/src/tools.ts` | 7 LM tool classes |
| `extension/src/pdf-tools.ts` | PDF business logic (PDFTools class) |
| `extension/package.json` | Extension manifest and tool contributions |
| `extension/tests/pdf-tools.test.ts` | 27 Jest unit tests |


// 6. Complete when done
await complete_session();
```

---

## 3. Progressive Disclosure

**Don't load everything at once. Load context as needed:**

1. **Start**: Read AGENTS.md (main guide)
2. **Quick ref**: `.ai-agents/QUICK-REFERENCE.md`
3. **Deep dive**: Load specific workflow files only when needed
   - `.ai-agents/skills/SESSION-WORKFLOW.md` - Session management
   - `.ai-agents/skills/CONTRACT-REFERENCE.md` - Before changing interfaces
   - `.ai-agents/skills/DOCUMENTATION-WORKFLOW.md` - When documenting
   - `.ai-agents/skills/PATTERNS-REFERENCE.md` - When coding

---

## 4. Before Any Changes

```typescript
// Always validate args in LM tool invoke() handlers
if (!args || !args.requiredParam) {
  throw new Error('requiredParam is required');
}

// Always check file existence
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}

// Always use try-catch in tool handlers
try {
  const result = await this.pdfTools.method(args);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
} catch (error) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
    isError: true
  };
}
```

---

## 5. Code Conventions

```typescript
// ✅ Use strict TypeScript
export interface MyInterface { /* ... */ }
async function myFunction(): Promise<ReturnType> { /* ... */ }

// ✅ Validate before processing
if (!input || typeof input !== 'string') {
  throw new Error('Invalid input');
}

// ✅ Ensure directories exist before writing
const dir = dirname(outputPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

// ✅ Provide clear error messages
throw new Error(`Failed to merge PDFs: ${error.message}`);


// ❌ Never silently swallow errors
try { await op(); } catch {}  // BAD
```


### 7 PDF Tools
1. `read_pdf` - Extract text from PDF
2. `get_pdf_info` - Get metadata
3. `create_pdf` - Create PDF from text
4. `merge_pdfs` - Combine PDFs
5. `split_pdf` - Extract page range
6. `update_pdf_metadata` - Modify metadata
7. `extract_pages` - Extract individual pages

---

## 7. Build & Test Commands

```bash
# Build extension
cd ./extension && npm run compile

# Run tests
cd ./extension && npm test

# Package extension
cd ./extension && npm run package
```

---

## 8. When to Document

Use `should_document()` to check if change needs documentation.

**Document when**:
- Adding new LM tool ✅
- Making architectural decision ✅
- Changing public API ✅
- Fixing user-facing bug ✅

**Skip when**:
- Internal refactoring only ❌
- Fixing typos ❌
- Updating dependencies (unless breaking) ❌

---

## 9. Contract Validation

**Before changing interfaces**, validate contracts:

```typescript
// Get contracts for context
