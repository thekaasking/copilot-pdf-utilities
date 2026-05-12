# Documentation Workflow - PDF Utilities Extension

**Purpose**: When and how to document decisions, features, and architecture changes.

---

## When to Document

| Change type | Files to update |
|---|---|
| New tool added | `extension/src/tools.ts`, `extension/src/pdf-tools.ts`, `extension/package.json`, `extension/tests/pdf-tools.test.ts`, `extension/README.md`, root `README.md`, `AGENTS.md` |
| PDFTools API change | `extension/src/pdf-tools.ts`, tests, `skills/CONTRACT-REFERENCE.md`, and any docs that describe the contract |
| Architectural decision | `IMPLEMENTATION_PLAN.md` and any relevant README or AGENTS note |
| Marketplace release | `extension/package.json`, and `extension/CHANGELOG.md` if the project uses one |

## Documentation Quick Rules

1. Keep `AGENTS.md` current with the real architecture and tool names.
2. Update the README files when a change affects users, tool behavior, or how the extension is used.
3. Treat `extension/tests/pdf-tools.test.ts` as living documentation for public behavior.
4. Keep the guidance centered on the VS Code Language Model Tools API and the `extension/` workspace.

## Adding a New PDF Tool - Documentation Checklist

- [ ] Add the class to `extension/src/tools.ts`
- [ ] Add the business logic to `extension/src/pdf-tools.ts`
- [ ] Add the contribution to `extension/package.json` (`contributes.languageModelTools`)
- [ ] Add unit tests to `extension/tests/pdf-tools.test.ts`
- [ ] Update the tool table in `extension/README.md`
- [ ] Update the tool table in root `README.md`
- [ ] Update `AGENTS.md` tool list
- [ ] Add a changelog entry if the project tracks one

---

## Documentation Types

### 1. Architectural Decision Records (ADR)

**When**: Making significant architectural decisions  
**Action**: Record the decision in `IMPLEMENTATION_PLAN.md` or the repo's decision log if one exists

**Format**: Decision, rationale, consequences

### 2. Feature Documentation

**When**: Adding new capabilities  
**Action**: Update the README files, `AGENTS.md`, and any extension manifest or instructions that describe the feature

**Format**: Description, usage, examples

### 3. Code Comments

**When**: Complex logic, non-obvious behavior  
**Action**: Direct code editing  
**Format**: JSDoc or short inline comments only when necessary

### 4. User Documentation

**When**: Public API changes or new features  
**Files**: `README.md`, `extension/README.md`, `AGENTS.md`, `extension/package.json`, and changelog files if present  
**Action**: File editing

---

## When to Document

### Quick Check

Ask whether the change affects user behavior, a public API, the extension manifest, or the instructions that guide future work.