# PDF Utilities Extension - Skills Hub

**Progressive Disclosure**: Start here for quick orientation, then load specific files as needed.

See [QUICK-REFERENCE.md](../QUICK-REFERENCE.md) for the condensed cheat sheet and [AGENTS.md](../../AGENTS.md) for the full project overview.

## Entry Points by Task

| Task | File to Load |
|---|---|
| Add or modify a PDF tool | `skills/PATTERNS-REFERENCE.md` |
| Change an interface or schema | `skills/CONTRACT-REFERENCE.md` |
| Update documentation | `skills/DOCUMENTATION-WORKFLOW.md` |
| Manage a multi-step task | `skills/SESSION-WORKFLOW.md` |

## Quick Start

1. Read [AGENTS.md](../../AGENTS.md) and [QUICK-REFERENCE.md](../QUICK-REFERENCE.md).
2. If you are changing a tool contract or `PDFTools` signature, load [CONTRACT-REFERENCE.md](./CONTRACT-REFERENCE.md).
3. If you are changing implementation details, load [PATTERNS-REFERENCE.md](./PATTERNS-REFERENCE.md).
4. If you are updating docs, load [DOCUMENTATION-WORKFLOW.md](./DOCUMENTATION-WORKFLOW.md).
5. Make the smallest focused change possible.
6. Run the narrowest useful validation after each edit.
7. Update tests and docs together when behavior is user-facing.

## Workflow Files

### Session Management
**File**: `./SESSION-WORKFLOW.md`  
**When**: Starting work, maintaining focus, handling interruptions  
**Topics**: Session lifecycle, checkpoints, next-step tracking

### Contract Validation
**File**: `./CONTRACT-REFERENCE.md`  
**When**: Changing interfaces or adding features  
**Topics**: PDFTools signatures, tool schemas, breaking-change detection

### Documentation
**File**: `./DOCUMENTATION-WORKFLOW.md`  
**When**: Adding features, making architectural decisions, updating docs  
**Topics**: When to document, README updates, changelog guidance

### Code Patterns
**File**: `./PATTERNS-REFERENCE.md`  
**When**: Implementing new features, refactoring, unsure of conventions  
**Topics**: VS Code LM tools, PDF operations, error handling, TypeScript conventions