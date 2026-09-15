# PDF Utilities for GitHub Copilot

![PDF Utilities working reading a PDF](assets/read_pdf_tool.png)

A VS Code extension that exposes 8 PDF and Word document tools directly to GitHub Copilot agent mode using the **Language Model Tools API** — no MCP server, no subprocess, works in every organisation.

MCP is blocked by policy in most enterprise environments (`chat.mcp.enabled` locked off, or disabled org-wide in Copilot Business/Enterprise settings), since it means letting arbitrary local processes or network endpoints into the chat context. This extension needs none of that: tools are registered via `vscode.lm.registerTool`, the same native API VS Code uses for its own built-in tools, so it's just an ordinary extension install — no security exception required.

## Architecture

```
pdf-utilities-mcp/
└── extension/              # The VS Code extension (self-contained)
    ├── src/
    │   ├── extension.ts   # Activation: registers tools + @pdf participant
    │   ├── tools.ts       # 8 LanguageModelTool implementations
    │   ├── pdf-tools.ts   # Core PDF logic (pdf-lib + pdf-parse)
    │   ├── docx-tools.ts  # Core Word document logic (mammoth + word-extractor)
    │   └── tokenizer.ts   # Word count + approximate LLM token estimation
    ├── resources/
    │   └── instructions/  # Copilot Chat instructions
    └── package.json       # Extension manifest with languageModelTools contributions
```

## Tools

![PDF Utilities enabled in the GitHub Copilot chat toolbar](assets/tools_enabled.png)

| `#reference` | Description |
| --- | --- |
| `#pdf_read` | Extract text from a PDF (optional page range, maxWords/maxTokens pagination) |
| `#pdf_info` | Get metadata: pages, title, author, file size, word count, token estimate… |
| `#pdf_create` | Create a new PDF from plain text |
| `#pdf_merge` | Merge multiple PDFs into one |
| `#pdf_split` | Extract a page range into a new PDF |
| `#pdf_metadata` | Update title, author, subject, keywords |
| `#pdf_extract` | Save individual pages as separate files |
| `#read_docx` | Extract text from a Word document (`.doc`/`.docx`, maxWords/maxTokens pagination) |

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
The 8 tools will appear in Copilot agent mode immediately.

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

The extension uses `vscode.lm.registerTool` to register each tool at activation time. VS Code's Language Model Tools API makes them available to any LLM request inside agent mode without requiring an MCP server or any network process. PDF processing is handled in-process by [pdf-lib](https://pdf-lib.js.org/) and [pdf-parse](https://www.npmjs.com/package/pdf-parse); Word document processing by [mammoth](https://www.npmjs.com/package/mammoth) (`.docx`) and [word-extractor](https://www.npmjs.com/package/word-extractor) (`.doc`).

## Credits

The PDF tool implementations (pdf-lib and pdf-parse integration, tool logic, and interface design) are based on the original work by [GleidsonFerSanP](https://github.com/GleidsonFerSanP) in [pdf-utilities-mcp](https://github.com/GleidsonFerSanP/pdf-utilities-mcp/tree/main). This project adapts that work from an MCP server to native VS Code Language Model Tools.

## License

MIT — see [LICENSE](LICENSE)
