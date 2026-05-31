# PDF Utilities for GitHub Copilot

AI-powered PDF tools built directly into GitHub Copilot agent mode — no MCP server, no subprocess, works everywhere.

## Features

* **Read PDFs** — Extract text content (full file or specific page ranges, with optional word/token pagination)
* **Get PDF Info** — Retrieve metadata: page count, title, author, file size, dates, word count, token estimate
* **Create PDFs** — Generate a new PDF from plain text with custom formatting
* **Merge PDFs** — Combine multiple PDF files into one
* **Split PDFs** — Extract a page range to a new file
* **Update Metadata** — Modify title, author, subject, keywords
* **Extract Pages** — Save individual pages as separate PDF files

All 7 tools are available in Copilot agent mode and can be referenced with `#`.

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for **PDF Utilities**
4. Click **Install**

Requirements: VS Code 1.100+ and GitHub Copilot.

## Usage

### Agent mode (recommended)

Ask Copilot in agent mode — tools are invoked automatically:

```
Read /home/user/report.pdf and summarise it
Create a PDF at /tmp/notes.pdf from the following text: ...
Merge /tmp/a.pdf and /tmp/b.pdf into /tmp/combined.pdf
Extract pages 1-5 from /tmp/long.pdf and save to /tmp/short.pdf
```

### Manual tool references

You can reference tools explicitly with `#`:

```
#pdf_read  #pdf_info  #pdf_create  #pdf_merge
#pdf_split  #pdf_metadata  #pdf_extract
```

### @pdf Chat Participant

Attach a PDF file in chat and ask questions about it:

1. Click the **📎 attach** button
2. Select a PDF file
3. Type `@pdf What does this document say?`

## Available Tools

| Reference | Tool Name | Description |
|---|---|---|
| `#pdf_read` | Read PDF | Extract text, optionally with page range and maxWords/maxTokens pagination |
| `#pdf_info` | Get PDF Info | Metadata (pages, title, author, size, word count, token estimate) |
| `#pdf_create` | Create PDF | New PDF from text content |
| `#pdf_merge` | Merge PDFs | Combine multiple PDFs into one |
| `#pdf_split` | Split PDF | Extract page range to new file |
| `#pdf_metadata` | Update Metadata | Set title, author, subject, keywords |
| `#pdf_extract` | Extract Pages | Save individual pages as files |

> Note: File paths must be **absolute** (e.g. `C:\Users\me\file.pdf` or `/home/me/file.pdf`).

## Configuration

`Ctrl+,` → search for **PDF Utilities**

| Setting | Default | Description |
|---|---|---|
| `pdfUtilities.logLevel` | `info` | Log verbosity: error / warn / info / debug |
| `pdfUtilities.maxPdfSize` | `50` | Maximum PDF file size in MB |

## Commands

Open the Command Palette (`Ctrl+Shift+P`) and type **PDF Utilities**:

* **PDF Utilities: Show Available PDF Tools** — list tool reference names
* **PDF Utilities: Open PDF Utilities Documentation** — open online docs

## Troubleshooting

**Tools not appearing in agent mode**

* Confirm the extension is enabled in the Extensions panel.
* Check the Output panel (`View › Output › PDF Utilities`) for activation messages.
* Reload VS Code if tools appeared previously but are now missing.

**"File not found" errors**

* Use absolute paths (not relative paths like `./file.pdf`).
* Verify the file exists and you have read permission.

**"Invalid page number" errors**

* Pages are 1-based. First page = `1`.
* Range format: `1-5` or `1,3,5-10`.

**Large PDFs are slow**

* Increase `pdfUtilities.maxPdfSize` if needed.
* Consider splitting or extracting only the pages you need.

## License

MIT — see [LICENSE](LICENSE)

## Links

* [GitHub Repository](https://github.com/thekaasking/copilot-pdf-utilities)
* [Report Issues](https://github.com/thekaasking/copilot-pdf-utilities/issues)
* [pdf-lib](https://pdf-lib.js.org/) · [pdf-parse](https://www.npmjs.com/package/pdf-parse)

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for "PDF Utilities"
4. Click Install

### From VSIX File

1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Press Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows/Linux)
4. Type "Install from VSIX"
5. Select the downloaded file

## Usage

Once installed, you can use PDF operations directly in GitHub Copilot Chat:

### Reading PDFs

```
You: "Read the PDF at /Users/name/Documents/report.pdf"
You: "What does contract.pdf say?"
You: "Extract text from pages 1-5 of document.pdf"
```

### Creating PDFs

```
You: "Create a PDF with this content: [your text]"
You: "Make a PDF from my meeting notes and save it as notes.pdf"
You: "Generate a PDF report with title 'Q1 Results'"
```

### Merging PDFs

```
You: "Merge report1.pdf and report2.pdf into final.pdf"
You: "Combine all PDFs in my Documents folder"
```

### Splitting PDFs

```
You: "Extract pages 1-10 from document.pdf"
You: "Split the first 5 pages into a separate file"
You: "Get pages 2, 4, and 6-10 from the report"
```

### Updating Metadata

```
You: "Change the PDF title to 'Annual Report 2024'"
You: "Update the author of contract.pdf to 'John Doe'"
```

### Extracting Pages

```
You: "Extract pages 1, 3, and 5 into separate files"
You: "Create individual PDFs for each page"
```
