# Contract Reference - PDF Utilities Extension

**Purpose**: Critical interfaces and schemas that must be preserved across changes.

---

## 📋 PDFTools Class Interface (`extension/src/pdf-tools.ts`)

```typescript
class PDFTools {
  async readPDF(filePath: string, pageRange?: string): Promise<PDFTextContent>;
  async getPDFInfo(filePath: string): Promise<PDFInfo>;
  async createPDF(content: string, outputPath: string, options?: CreatePDFOptions): Promise<{ success: boolean; path: string; pages: number }>;
  async mergePDFs(filePaths: string[], outputPath: string): Promise<{ success: boolean; path: string; pages: number }>;
  async splitPDF(filePath: string, pageRange: string, outputPath: string): Promise<{ success: boolean; path: string; pages: number }>;
  async updatePDFMetadata(filePath: string, metadata: { title?: string; author?: string; subject?: string; keywords?: string }, outputPath?: string): Promise<{ success: boolean; path: string }>;
  async extractPages(filePath: string, pages: number[], outputDir: string, prefix?: string): Promise<{ success: boolean; files: string[] }>;
  parsePageRange(range: string, totalPages: number): number[];  // PUBLIC — used in tests
}
```

## 📋 Key Interfaces

```typescript
interface PDFInfo {
  pages: number; title?: string; author?: string; subject?: string;
  creator?: string; producer?: string; creationDate?: string;
  modificationDate?: string; fileSize: number; filePath: string;
}

interface PDFTextContent { text: string; pages: number; info: PDFInfo; }

interface CreatePDFOptions {
  title?: string; author?: string; subject?: string;
  fontSize?: number; pageSize?: keyof typeof PageSizes;
  margins?: { top: number; bottom: number; left: number; right: number };
}
```

## 📋 LM Tool Schemas (from `extension/package.json`)

Tool names follow pattern `pdf-utilities_<operation>`. `toolReferenceName` follows `pdf_<operation>`. All `filePath` parameters must be absolute paths.


**When to validate**: Before making changes that might break existing code.

---

## 📋 Registered Contracts

### Contract 1: PDFTools Class Interface

**Contract ID**: `pdf-tools-class-interface`

```typescript
// Critical methods the LM tools depend on
class PDFTools {
  async readPDF(
    filePath: string, 
    pageRange?: string
  ): Promise<{ text: string; pages: number; info: any }>;

  async getPDFInfo(
    filePath: string
  ): Promise<PDFInfo>;

  async createPDF(
    content: string, 
    outputPath: string, 
    options?: CreatePDFOptions
  ): Promise<{ path: string; pages: number }>;

  async mergePDFs(
    filePaths: string[], 
    outputPath: string
  ): Promise<{ path: string; totalPages: number }>;

  async splitPDF(
    filePath: string, 
    pageRange: string, 
    outputPath: string
  ): Promise<{ path: string; pages: number }>;

  async updatePDFMetadata(
    filePath: string, 
    metadata: Partial<PDFInfo>, 
    outputPath?: string
  ): Promise<{ path: string }>;

  async extractPages(
    filePath: string, 
    pages: number[], 
    outputDir: string, 
    prefix?: string
  ): Promise<{ files: string[] }>;
}
```

**Breaking Changes**:
* Removing a method
* Changing method signature (params, return type)
* Changing return object structure
* Renaming methods

**Safe Changes**:
* Adding optional parameters
* Adding new methods
* Internal implementation changes
* Private method changes

---

### Contract 2: LM Tool Contributions

**Contract ID**: `lm-tool-contributions`

The `contributes.languageModelTools` array in `extension/package.json` defines the public schema for each tool. Changing `name`, `toolReferenceName`, or required properties in `inputSchema` is a breaking change for users.

