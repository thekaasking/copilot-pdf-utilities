# PDF Utilities for GitHub Copilot

A VS Code extension that exposes 7 PDF manipulation tools directly to GitHub Copilot agent mode using the **Language Model Tools API** — no MCP server, no subprocess, works in every organisation.

## Architecture

```
pdf-utilities-mcp/
└── extension/              # The VS Code extension (self-contained)
    ├── src/
    │   ├── extension.ts   # Activation: registers tools + @pdf participant
    │   ├── tools.ts       # 7 LanguageModelTool implementations
    │   └── pdf-tools.ts   # Core PDF logic (pdf-lib + pdf-parse)
    ├── resources/
    │   └── instructions/  # Copilot Chat instructions
    └── package.json       # Extension manifest with languageModelTools contributions
```

## Tools

| `#reference` | Description |
|---|---|
| `#pdf_read` | Extract text from a PDF (optional page range) |
| `#pdf_info` | Get metadata: pages, title, author, file size… |
| `#pdf_create` | Create a new PDF from plain text |
| `#pdf_merge` | Merge multiple PDFs into one |
| `#pdf_split` | Extract a page range into a new PDF |
| `#pdf_metadata` | Update title, author, subject, keywords |
| `#pdf_extract` | Save individual pages as separate files |

Tools are auto-invoked by Copilot agent mode and can also be referenced manually with `#`.

## Development

### Prerequisites

```
Node.js >= 20
VS Code >= 1.100
GitHub Copilot extension
```

### Setup

```bash
cd extension
npm install
npm run compile
```

### Run / Debug

Press **F5** in VS Code to launch the Extension Development Host.  
The 7 PDF tools will appear in Copilot agent mode immediately.

### Package as VSIX

```bash
cd extension
npm run package   # produces pdf-utilities-2.0.0.vsix
```

### Install locally for testing

```
Extensions panel → ⋯ → Install from VSIX → select the .vsix
```

### Publish to Marketplace

```bash
cd extension
npm run publish
```

## How it works

The extension uses `vscode.lm.registerTool` to register each PDF tool at activation time. VS Code's Language Model Tools API makes them available to any LLM request inside agent mode without requiring an MCP server or any network process. PDF processing is handled in-process by [pdf-lib](https://pdf-lib.js.org/) and [pdf-parse](https://www.npmjs.com/package/pdf-parse).

## Credits

The PDF tool implementations (pdf-lib and pdf-parse integration, tool logic, and interface design) are based on the original work by [GleidsonFerSanP](https://github.com/GleidsonFerSanP) in [pdf-utilities-mcp](https://github.com/GleidsonFerSanP/pdf-utilities-mcp/tree/main). This project adapts that work from an MCP server to native VS Code Language Model Tools.

## License

MIT — see [LICENSE](LICENSE)
