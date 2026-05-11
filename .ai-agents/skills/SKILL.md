# PDF Utilities Extension - Skills Hub

**Progressive Disclosure**: Start here for quick orientation, then load specific files as needed.

See [QUICK-REFERENCE.md](../QUICK-REFERENCE.md) for the condensed cheat sheet and [AGENTS.md](../../AGENTS.md) for the full project overview.

## Entry Points by Task

| Task | File to Load |
|---|---|
| Add or modify a PDF tool | `skills/PATTERNS-REFERENCE.md` |
| Change an interface or schema | `skills/CONTRACT-REFERENCE.md` |
| Update documentation | `skills/DOCUMENTATION-WORKFLOW.md` |
| Multi-step work session | `skills/SESSION-WORKFLOW.md` |


---

## Quick Start Code

### Essential Pattern (Copy-Paste Ready)

```typescript
// 1. Identify context (ALWAYS use relative paths!)
const context = await identify_context({ 
  file_path: "./src/index.ts"  // ✅ Relative path
});

// 2. Check for active session
const currentFocus = await get_current_focus();

// 3. Start session or load guidelines
if (!currentFocus) {
  await start_session({
    context: context.context,
    current_focus: "Implementing new PDF tool",
    objectives: [
      "Add tool to PDFTools class",
      "Add TypeScript interfaces"
    ]
  });
} else {
  const guidelines = await get_merged_guidelines({ context: context.context });
  // Review guidelines before proceeding
}

// 4. Do your work
// ... implementation ...

// 5. Save progress
await create_checkpoint({
  summary: "Completed watermark tool implementation",
  next_focus: "Add tests and update documentation"
});

// 6. Complete when done
await complete_session();
```


## Workflow Files (Load As Needed)

### Session Management
**File**: `./SESSION-WORKFLOW.md`  
**When**: Starting new work, managing focus, handling interruptions  
**Topics**: Session lifecycle, checkpoint patterns, focus updates

### Contract Validation
**File**: `./CONTRACT-REFERENCE.md`  
**When**: Changing interfaces or adding features  
**Topics**: Critical interfaces, tool schemas, breaking change detection

### Documentation
**File**: `./DOCUMENTATION-WORKFLOW.md`  
**When**: Adding features, making architectural decisions, updating docs  
**Topics**: When to document, ADR patterns, changelog updates

### Code Patterns
**File**: `./PATTERNS-REFERENCE.md`  
**When**: Implementing new features, refactoring, unsure of conventions  
**Topics**: MCP patterns, error handling, TypeScript conventions, VS Code integration
