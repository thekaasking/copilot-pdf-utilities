# Code Patterns Reference - PDF Utilities Extension

**Purpose**: Common code patterns, conventions, and best practices for this project.

---

## LM Tool Patterns

### Registering a New Tool

```typescript
// 1. Add the class in extension/src/tools.ts
class MyPdfTool implements vscode.LanguageModelTool<{ filePath: string }> {
  private pdfTools = new PDFTools();

  async invoke(options: vscode.LanguageModelToolInvocationOptions<{ filePath: string }>, _token: vscode.CancellationToken) {
    const { filePath } = options.input;
    if (!filePath) throw new Error('filePath is required');
    try {
      const result = await this.pdfTools.someOperation(filePath);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(result))
      ]);
    } catch (error) {
      throw new Error(`pdf-utilities_my_tool failed: ${(error as Error).message}`);
    }
  }

  async prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<{ filePath: string }>, _token: vscode.CancellationToken) {
    return { invocationMessage: `Processing: ${options.input.filePath}` };
  }
}

// 2. Register in registerPdfTools() in extension/src/tools.ts
context.subscriptions.push(
  vscode.lm.registerTool('pdf-utilities_my_tool', new MyPdfTool())
);

// 3. Add contribution in extension/package.json under contributes.languageModelTools
{
  "name": "pdf-utilities_my_tool",
  "displayName": "My PDF Tool",
  "modelDescription": "Does something with a PDF file",
  "canBeReferencedInPrompt": true,
  "toolReferenceName": "pdf_my_tool",
  "inputSchema": {
    "type": "object",
    "properties": {
      "filePath": { "type": "string", "description": "Absolute path to the PDF file" }
    },
    "required": ["filePath"]
  }
}
```

---

## \ud83d\udcdc PDF Operation Patterns

### File Existence Check (Required Before Every Operation)

```typescript
import { existsSync } from 'fs';

if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}
```

### pdf-lib: Create / Modify PDF

```typescript
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

const pdfDoc = await PDFDocument.create();  // or PDFDocument.load(bytes)
const page = pdfDoc.addPage(PageSizes.A4);
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Hello', { x: 50, y: 750, size: 12, font, color: rgb(0, 0, 0) });
const bytes = await pdfDoc.save({ useObjectStreams: false }); // ALWAYS useObjectStreams: false
writeFileSync(outputPath, bytes);
```

### pdf-lib: Read Metadata

```typescript
const pdfDoc = await PDFDocument.load(readFileSync(filePath));
const title = pdfDoc.getTitle();
const author = pdfDoc.getAuthor();
const pages = pdfDoc.getPageCount();
```

### pdf-parse: Extract Text

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
const data = await pdfParse(readFileSync(filePath));
// data.text, data.numpages, data.info
```

---

## \ud83e\uddea Test Patterns

```typescript
// Mock pdf-parse at the top of every test file
jest.mock('pdf-parse', () =>
  jest.fn((_buffer: Buffer) =>
    Promise.resolve({ numpages: 1, text: 'Test content', info: {} })
  )
);

// Use os.tmpdir() for all test file I/O
const out = path.join(os.tmpdir(), `pdf-test-${Date.now()}.pdf`);
// always clean up
try { fs.unlinkSync(out); } catch { /* ignore */ }
```



### Tool Registration Pattern

```typescript
// src/index.ts - Standard tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "tool_name",
      description: "Clear, concise description of what tool does",
      inputSchema: {
        type: "object",
        properties: {
          requiredParam: { 
            type: "string", 
            description: "What this parameter does"
          },
          optionalParam: { 
            type: "string", 
            description: "What this optional parameter does (optional)"
          }
        },
        required: ["requiredParam"]
      }
    }
  ]
}));
```

### Tool Handler Pattern

```typescript
// src/index.ts - Tool call handler with validation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // ALWAYS validate args first
    if (!args) {
      throw new Error("Missing arguments");
    }

    switch (name) {
      case "read_pdf": {
        // Destructure with validation
        const { filePath, pageRange } = args;
        if (!filePath) {
          throw new Error("filePath is required");
        }

        // Call implementation
        const result = await this.pdfTools.readPDF(filePath, pageRange);

        // Return structured response
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // Structured error response
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error)
          })
        }
      ],
      isError: true
    };
  }
});
```

---

## 📚 PDF Manipulation Patterns

### File Validation Pattern

```typescript
// Always check file existence before operations
import { existsSync } from 'fs';

async readPDF(filePath: string): Promise<ReadPDFResult> {
  // Check file exists
  if (!existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  // Check file extension (optional but recommended)
  if (!filePath.toLowerCase().endsWith('.pdf')) {
    throw new Error('File must be a PDF');
  }

  // Proceed with operation
  const dataBuffer = readFileSync(filePath);
  // ...
}
```

### Page Range Parsing Pattern

```typescript
// Parse page range strings like "1-3,5,7-9"
private parsePageRange(range: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = range.split(',');

  for (const part of parts.map(p => p.trim())) {
    if (part.includes('-')) {
      // Handle range like "1-3"
      const [start, end] = part.split('-').map(Number);
      
      // Validate
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page range: ${part}`);
      }
      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid page range: ${part} (total pages: ${totalPages})`);
      }

      // Add all pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    } else {
      // Handle single page like "5"
      const page = Number(part);
      if (isNaN(page) || page < 1 || page > totalPages) {
        throw new Error(`Invalid page number: ${part} (total pages: ${totalPages})`);
      }
      pages.push(page);
    }
  }

  return pages;
}
```

### Error Handling Pattern

```typescript
async mergePDFs(filePaths: string[], outputPath: string): Promise<MergePDFResult> {
  try {
    // Validate inputs
    if (!filePaths || filePaths.length === 0) {
      throw new Error('No PDF files provided');
    }

    // Check all files exist
    for (const filePath of filePaths) {
      if (!existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }
    }

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Perform operation
    const mergedPdf = await PDFDocument.create();
    
    for (const filePath of filePaths) {
      const pdfBytes = readFileSync(filePath);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save result
    const mergedPdfBytes = await mergedPdf.save();
    writeFileSync(outputPath, mergedPdfBytes);

    return {
      path: outputPath,
      totalPages: mergedPdf.getPageCount()
    };

  } catch (error) {
    // Re-throw with context
    throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

---

## 🎯 TypeScript Patterns

### Strict Type Definitions

```typescript
// Use explicit return types
async readPDF(
  filePath: string, 
  pageRange?: string
): Promise<ReadPDFResult> {  // ✅ Explicit return type
  // ...
}

// Define interfaces for complex objects
export interface PDFInfo {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  keywords?: string;
  pages?: number;
}

// Use type guards
function isPDFInfo(obj: any): obj is PDFInfo {
  return typeof obj === 'object' && obj !== null;
}
```

### Options Pattern

```typescript
// Use optional options object with defaults
export interface CreatePDFOptions {
  fontSize?: number;
  margin?: number;
  pageSize?: 'letter' | 'a4';
}

async createPDF(
  content: string,
  outputPath: string,
  options: CreatePDFOptions = {}  // Default to empty object
): Promise<CreatePDFResult> {
  // Destructure with defaults
  const {
    fontSize = 12,
    margin = 50,
    pageSize = 'letter'
  } = options;

  // Use values
  const page = pdfDoc.addPage(PAGE_SIZES[pageSize]);
  // ...
}
```

### Enum Pattern

```typescript
// Use const objects instead of enums for better tree-shaking
const PAGE_SIZES = {
  letter: [612, 792],
  a4: [595, 842]
} as const;

type PageSize = keyof typeof PAGE_SIZES;
```

---

## 🔧 VS Code Extension Patterns

### Graceful Degradation Pattern

```typescript
// Handle missing APIs gracefully
export function activate(context: vscode.ExtensionContext) {
  // Check if MCP API is available
