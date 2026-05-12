---
name: PDFUtilitiesGuidelines
description: Tools for PDF manipulation - read, create, merge, split, and edit PDFs
applyTo: **/*.pdf
---

# PDF Utilities - GitHub Copilot Chat Instructions

This extension provides PDF manipulation tools registered natively in VS Code via the Language Model Tools API. Use these tools when the user asks to work with PDF files.

## When to Use These Tools

Activate PDF utilities tools when the user wants to:
- Read or extract text from PDF files
- Get PDF information (page count, metadata, file size)
- Create new PDF documents from text
- Merge multiple PDF files into one
- Split PDFs or extract specific pages
- Update PDF metadata (title, author, subject, keywords)
- Extract individual pages into separate files

## Available Tools

### 1. read_pdf
**Purpose**: Extract text content from a PDF file

**Parameters**:
- `filePath` (required): Absolute path to the PDF file
- `pageRange` (optional): Page range to extract (e.g., "1-5", "1,3,5-10")

**Example Usage**:
```
User: "Read the PDF at /Users/name/document.pdf"
User: "Extract text from pages 1-5 of report.pdf"
User: "What does the PDF in my Downloads folder say?"
```

**Response Format**: Returns JSON with `text` (extracted content), `pages` (total page count), and `info` (metadata)

### 2. get_pdf_info
**Purpose**: Retrieve metadata and information about a PDF

**Parameters**:
- `filePath` (required): Absolute path to the PDF file

**Example Usage**:
```
User: "How many pages are in this PDF?"
User: "Get information about contract.pdf"
User: "What's the size of this PDF file?"
```

**Response Format**: Returns JSON with pages, title, author, subject, creator, producer, dates, fileSize, filePath

### 3. create_pdf
**Purpose**: Create a new PDF from text content

**Parameters**:
- `content` (required): Text content to include in the PDF
- `outputPath` (required): Absolute path where the PDF will be saved
- `options` (optional): Object with formatting options
  - `title`: PDF title metadata
  - `author`: PDF author metadata
  - `subject`: PDF subject metadata
  - `fontSize`: Font size (default: 12)
  - `pageSize`: Page size - "A4", "Letter", "Legal", "A3", or "A5" (default: A4)

**Example Usage**:
```
User: "Create a PDF with this content: [text]"
User: "Make a PDF document from my notes"
User: "Generate a PDF report with title 'Monthly Summary'"
```

**Response Format**: Returns JSON with `success`, `path`, and `pages`

### 4. merge_pdfs
**Purpose**: Combine multiple PDF files into a single PDF

**Parameters**:
- `filePaths` (required): Array of absolute paths to PDF files to merge
- `outputPath` (required): Absolute path where the merged PDF will be saved

**Example Usage**:
```
User: "Merge these three PDFs into one"
User: "Combine report1.pdf and report2.pdf"
User: "Create a single PDF from all PDFs in this folder"
```

**Response Format**: Returns JSON with `success`, `path`, and total `pages`

### 5. split_pdf
**Purpose**: Extract specific pages from a PDF into a new file

**Parameters**:
- `filePath` (required): Absolute path to the source PDF file
- `pageRange` (required): Page range to extract (e.g., "1-5", "2,4,6-10")
- `outputPath` (required): Absolute path where the extracted PDF will be saved

**Example Usage**:
```
User: "Extract pages 1-10 from document.pdf"
User: "Split the first 5 pages into a separate file"
User: "Get pages 2, 4, and 6-10 from the report"
```

**Response Format**: Returns JSON with `success`, `path`, and `pages` in new file

### 6. update_pdf_metadata
**Purpose**: Update metadata fields of a PDF file

**Parameters**:
- `filePath` (required): Absolute path to the PDF file
- `metadata` (required): Object with fields to update
  - `title`: Document title
  - `author`: Document author
  - `subject`: Document subject
  - `keywords`: Document keywords
- `outputPath` (optional): Output path (defaults to overwriting original)

**Example Usage**:
```
User: "Change the PDF title to 'Annual Report 2024'"
User: "Update the author of this PDF to 'John Doe'"
User: "Set the metadata for contract.pdf"
```

**Response Format**: Returns JSON with `success` and `path`

### 7. extract_pages
**Purpose**: Extract specific pages into separate PDF files

**Parameters**:
- `filePath` (required): Absolute path to the source PDF file
- `pages` (required): Array of page numbers to extract (1-based, e.g., [1, 3, 5])
- `outputDir` (required): Directory where extracted pages will be saved
- `prefix` (optional): Filename prefix for extracted pages (default: "page")

**Example Usage**:
```
User: "Extract pages 1, 3, and 5 into separate files"
User: "Split each page of this PDF into individual files"
User: "Create separate PDFs for pages 2, 4, and 6"
```

**Response Format**: Returns JSON with `success` and array of `files` created

## Important Usage Guidelines

### File Paths
- **Always use absolute paths** for all file operations
- Convert relative paths or workspace-relative paths to absolute paths
- Validate that paths exist before calling tools
- Handle path separators correctly for the user's OS

### Error Handling
- All tools return error information in the response if operations fail
- Check the `success` field in responses
- Provide clear error messages to users
- Suggest corrections for common errors (file not found, invalid page range, etc.)

### Page Numbering
- Page numbers are **1-based** for user-facing parameters
- Page ranges support:
  - Single pages: "5"
  - Ranges: "1-5"
  - Multiple selections: "1,3,5-10"
  - Combined: "1-3,7,9-12"

### Performance Considerations
- Large PDF files may take time to process
- Consider file size limits (default: 50MB, configurable)
- For very large operations, inform the user processing may take time

### Best Practices
1. **Confirm operations**: Before creating/modifying files, confirm paths with user
2. **Validate inputs**: Check file exists before reading, directory exists before writing
3. **Clear feedback**: Provide summary of what was done (e.g., "Created 5-page PDF at /path/file.pdf")
4. **Suggest next steps**: After operations, suggest related actions user might want

## Example Conversations

### Reading a PDF
```
User: "What does the PDF in my Documents folder say?"
Assistant: [Use file_search or ask for specific path]
Assistant: [Call read_pdf with the path]
Assistant: "The PDF contains [summary]. It has X pages and discusses [key points]."
```

### Creating a PDF
```
User: "Create a PDF with my meeting notes"
Assistant: "I'll create a PDF with your notes. Where should I save it?"
User: "Save it as meeting-notes.pdf in Documents"
Assistant: [Call create_pdf with content and path]
Assistant: "Created a 2-page PDF at /Users/name/Documents/meeting-notes.pdf"
```

### Merging PDFs
```
User: "Combine report1.pdf and report2.pdf"
Assistant: [Get absolute paths]
Assistant: "What should I name the merged PDF?"
User: "final-report.pdf"
Assistant: [Call merge_pdfs]
Assistant: "Successfully merged 2 PDFs into final-report.pdf (15 pages total)"
```

## Configuration

Users can configure PDF Utilities via VS Code settings:
- `pdfUtilities.logLevel`: Logging level (error/warn/info/debug)
- `pdfUtilities.maxPdfSize`: Maximum PDF size in MB (default: 50)

## Troubleshooting

If tools are not available:
1. Check if extension is activated
2. Reload VS Code window
3. Check the Output panel: "PDF Utilities"

Common errors:
- "File not found": Verify path is correct and absolute
- "Invalid page range": Check page numbers are within document range
- "Permission denied": Check file/directory permissions

## Integration with Other Tools

These PDF tools work well with:
- File system tools (reading/writing files)
- Text processing tools
- Document analysis workflows
- Batch processing operations

When users ask to work with multiple PDFs or complex workflows, combine these tools strategically.
