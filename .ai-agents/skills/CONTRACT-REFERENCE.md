# Contract Reference - PDF Utilities Extension

**Purpose**: Critical interfaces and schemas that must be preserved across changes.

---

## PDFTools Class Interface (`extension/src/pdf-tools.ts`)

```typescript
class PDFTools {
  async readPDF(filePath: string, pageRange?: string): Promise<PDFTextContent>;
  async getPDFInfo(filePath: string): Promise<PDFInfo>;
  async createPDF(content: string, outputPath: string, options?: CreatePDFOptions): Promise<{ success: boolean; path: string; pages: number }>;
  async mergePDFs(filePaths: string[], outputPath: string): Promise<{ success: boolean; path: string; pages: number }>;
  async splitPDF(filePath: string, pageRange: string, outputPath: string): Promise<{ success: boolean; path: string; pages: number }>;
  async updatePDFMetadata(filePath: string, metadata: { title?: string; author?: string; subject?: string; keywords?: string }, outputPath?: string): Promise<{ success: boolean; path: string }>;
  async extractPages(filePath: string, pages: number[], outputDir: string, prefix?: string): Promise<{ success: boolean; files: string[] }>;
  parsePageRange(range: string, totalPages: number): number[];
}
```

## Key Interfaces

```typescript
interface PDFInfo {
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  fileSize: number;
  filePath: string;
}

interface PDFTextContent {
  text: string;
  pages: number;
  info: PDFInfo;
}

interface CreatePDFOptions {
  title?: string;
  author?: string;
  subject?: string;
  fontSize?: number;
  pageSize?: keyof typeof PageSizes;
  margins?: { top: number; bottom: number; left: number; right: number };
}
```

## LM Tool Schemas

Tool names follow `pdf-utilities_<operation>`. `toolReferenceName` follows `pdf_<operation>`. All `filePath` parameters must be absolute paths.

Current mapping:

* `pdf-utilities_read_pdf` -> `#pdf_read`
* `pdf-utilities_get_pdf_info` -> `#pdf_info`
* `pdf-utilities_create_pdf` -> `#pdf_create`
* `pdf-utilities_merge_pdfs` -> `#pdf_merge`
* `pdf-utilities_split_pdf` -> `#pdf_split`
* `pdf-utilities_update_metadata` -> `#pdf_metadata`
* `pdf-utilities_extract_pages` -> `#pdf_extract`

## Contract Rules

**Breaking changes** include removing a method, changing a method signature, changing the return shape, or renaming a method or tool contribution.

**Safe changes** include adding optional parameters, adding new methods, and changing internal implementation details.

## When to Validate

Before making changes that might break existing code, update this file together with tests and the relevant tool schema or implementation.