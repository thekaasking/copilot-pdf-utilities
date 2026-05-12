# .ai-agents - AI Agent Context Files

This directory contains context files that help AI agents work effectively with the PDF Utilities VS Code extension.

## Files

| File | Purpose |
|---|---|
| `copilot-instructions.md` | Core rules and patterns for Copilot |
| `QUICK-REFERENCE.md` | Condensed cheat sheet: key files, commands, tool table |
| `skills/PATTERNS-REFERENCE.md` | Code patterns for LM tools and PDF operations |
| `skills/CONTRACT-REFERENCE.md` | Critical interfaces (`PDFTools` class, tool schemas) |
| `skills/SESSION-WORKFLOW.md` | How to manage multi-step work sessions |
| `skills/DOCUMENTATION-WORKFLOW.md` | When and how to update docs |
| `skills/SKILL.md` | Progressive context entry point |

## Quick Start for Agents

1. Read [AGENTS.md](../AGENTS.md) at the project root for the full overview.
2. Load [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) for the cheat sheet.
3. Load skills files as needed for deeper context.

## Structure

```txt
.ai-agents/
├── README.md                     # This file - directory overview
├── QUICK-REFERENCE.md            # <500 token checklist for every conversation
├── copilot-instructions.md       # GitHub Copilot custom instructions
└── skills/
    ├── SKILL.md                  # Main skills hub with quick start
    ├── SESSION-WORKFLOW.md       # Session management patterns
    ├── CONTRACT-REFERENCE.md     # Critical interfaces and validation
    ├── DOCUMENTATION-WORKFLOW.md # When and how to document
    └── PATTERNS-REFERENCE.md     # Code patterns and conventions
```

## How to Use

### For AI Agents

**Every conversation:**

1. **Start**: Read [../AGENTS.md](../AGENTS.md) (main entry point)
2. **Quick context**: Load [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. **Deep dive** (only as needed):
   - [skills/SKILL.md](./skills/SKILL.md) - Comprehensive guide
   - [skills/SESSION-WORKFLOW.md](./skills/SESSION-WORKFLOW.md) - Session management
   - [skills/CONTRACT-REFERENCE.md](./skills/CONTRACT-REFERENCE.md) - Interface validation
   - [skills/DOCUMENTATION-WORKFLOW.md](./skills/DOCUMENTATION-WORKFLOW.md) - Documentation
   - [skills/PATTERNS-REFERENCE.md](./skills/PATTERNS-REFERENCE.md) - Code patterns

### For GitHub Copilot

Load [copilot-instructions.md](./copilot-instructions.md) for project-specific rules.

## Critical Rule

**Keep project file references relative in examples and notes.**

- Good: `./extension/src/pdf-tools.ts`
- Good: `./extension/package.json`
- Bad: `/absolute/path/to/file.ts`
- Bad: `C:\\Dev\\copilot-pdf-utilities\\extension\\src\\tools.ts`

---

## Progressive Disclosure Pattern

**Don't load everything at once!**

- **Level 1**: AGENTS.md (always start here)
- **Level 2**: QUICK-REFERENCE.md (condensed checklist)
- **Level 3**: skills/SKILL.md (comprehensive guide)
- **Level 4**: Specific workflow files (only when needed)

This keeps context window usage efficient while ensuring relevant information is available when needed.

---

## Main Entry Point

**👉 Start here**: [AGENTS.md](../AGENTS.md) (at project root)

That file provides:

- Project overview
- Architecture overview
- Code conventions
- Getting started guide
- Links to all other documentation

## File Purposes

| File | Purpose | When to Load |
|------|---------|--------------|
| **AGENTS.md** | Main guide, project overview | Every conversation (start here) |
| **QUICK-REFERENCE.md** | Condensed checklist (<500 tokens) | Quick orientation |
| **copilot-instructions.md** | Copilot custom instructions | Automatic (Copilot loads it) |
| **skills/SKILL.md** | Comprehensive skills hub | Complex features, deep work |
| **skills/SESSION-WORKFLOW.md** | Session management | Starting work, checkpoints |
| **skills/CONTRACT-REFERENCE.md** | Interface validation | Before changing APIs |
| **skills/DOCUMENTATION-WORKFLOW.md** | Documentation patterns | Adding features, ADRs |
| **skills/PATTERNS-REFERENCE.md** | Code conventions | Implementing features |

