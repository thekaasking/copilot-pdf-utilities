PDF Utilities - Test Document

This is a test PDF to verify the \@pdf Chat Participant.

## Architecture

This repository is a VS Code extension that registers PDF tools with the Language Model Tools API.

```text
copilot-pdf-utilities/
├── extension/
│   ├── src/
│   │   ├── extension.ts   # Activates the extension and registers tools
│   │   ├── tools.ts       # LanguageModelTool implementations
│   │   └── pdf-tools.ts   # PDF business logic
│   ├── tests/
│   │   └── pdf-tools.test.ts
│   └── resources/
│       └── instructions/
└── test-document.md       # Source used to generate this PDF fixture
```

The extension exposes 7 PDF tools for reading, creating, merging, splitting,
updating metadata, and extracting pages. It uses `pdf-lib` for PDF creation and
modification, and `pdf-parse` for text extraction.

Page 1 of 3

Section 1: Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Key Features:

  - Read text from PDF files

  - Get PDF metadata

  - Create new PDFs from text

  - Merge multiple PDFs

  - Split PDFs by page range

  - Update PDF metadata

  - Extract individual pages
Section 2: Technical Details

Page 2 of 3

Architecture:





Technologies:

  - TypeScript 5.3 with strict mode

  - pdf-lib for PDF creation and modification

  - pdf-parse for text extraction

Revenue Data (Q1 2026):

  January:  $125,000

  February: $142,500

  March:    $158,300

  Total Q1: $425,800
Section 3: Conclusion

Page 3 of 3

This test PDF demonstrates the \@pdf Chat Participant capability

to extract and analyze text content from PDF documents.

Summary:

  - 7 PDF tools available as Language Model Tools

  - \@pdf enables direct PDF interaction in Copilot Chat

  - No more yellow warnings when attaching PDFs

Contact: github.com/thekaasking/copilot-pdf-utilities