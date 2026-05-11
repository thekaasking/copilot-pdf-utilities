# Documentation Workflow - PDF Utilities Extension

**Purpose**: When and how to document decisions, features, and architecture changes.

---

## When to Document

| Change type | Files to update |
|---|---|
| New tool added | `extension/package.json` (schema), `extension/README.md`, root `README.md`, `AGENTS.md`, `CHANGELOG.md` |
| PDFTools API change | `extension/src/pdf-tools.ts`, tests, `skills/CONTRACT-REFERENCE.md` |
| Architectural decision | Add an ADR section to `IMPLEMENTATION_PLAN.md` |
| Marketplace release | `extension/CHANGELOG.md`, bump version in `extension/package.json` |

## Documentation Quick Rules

1. **`extension/CHANGELOG.md`** must be updated before every `npm run publish`
2. **`AGENTS.md`** is the primary AI agent context — keep it current with real architecture
3. **Tests as docs**: the 27 unit tests in `extension/tests/pdf-tools.test.ts` document the expected behavior of every public method
4. **No MCP references** anywhere in this project — it's a standalone VS Code extension

## Adding a New PDF Tool — Documentation Checklist

- [ ] Add the class to `extension/src/tools.ts`
- [ ] Add the business logic to `extension/src/pdf-tools.ts`
- [ ] Add the contribution to `extension/package.json` (`contributes.languageModelTools`)
- [ ] Add unit tests to `extension/tests/pdf-tools.test.ts`
- [ ] Update the tool table in `extension/README.md`
- [ ] Update the tool table in root `README.md`
- [ ] Update `AGENTS.md` tool list
- [ ] Add CHANGELOG entry


---

## 🎯 Documentation Types

### 1. Architectural Decision Records (ADR)

**When**: Making significant architectural decisions  
**Tool**: `add_decision()`

**Format**: Decision, rationale, consequences

### 2. Feature Documentation

**When**: Adding new capabilities  
**Tool**: `register_feature()` , `update_feature()`

**Format**: Description, usage, examples

### 3. Code Comments

**When**: Complex logic, non-obvious behavior  
**Tool**: Direct code editing  
**Format**: JSDoc, inline comments

### 4. User Documentation

**When**: Public API changes, new features  
**Files**: README.md, CHANGELOG.md  
**Tool**: File editing

---

## 📝 When to Document

### Should I Document This?

```typescript
// Use the should_document tool to check
const shouldDoc = await should_document({
