/**
 * Unit tests for extension/src/pdf-tools.ts
 *
 * Tests are organised in three groups:
 *   1. parsePageRange helper (pure, no I/O)
 *   2. PDF creation, read-back, and metadata (writes real files to OS temp dir)
 *   3. merge, split, and extract operations (real files, real pdf-lib)
 *
 * All file-system operations use the OS temp directory so no fixtures are
 * needed and the tests clean up after themselves.
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { PDFTools } from '../src/pdf-tools';

// Mock pdf-parse so tests don't depend on the old pdfjs (v1.10) bundled with
// pdf-parse being able to parse pdf-lib-generated PDFs. Unit tests verify our
// wrapper logic; real PDF parsing is exercised via manual / integration tests.
jest.mock('pdf-parse', () =>
  jest.fn((_buffer: Buffer) =>
    Promise.resolve({
      numpages: 1,
      text: 'Hello PDF world\nLine two of the document.',
      info: { Title: '', Author: '', Creator: '', Producer: '' }
    })
  )
);

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Returns a unique path inside the OS temp dir. */
function tmpFile(name: string): string {
  return path.join(os.tmpdir(), `pdf-utils-test-${Date.now()}-${name}`);
}

function cleanup(...paths: string[]) {
  for (const p of paths) {
    try { fs.unlinkSync(p); } catch { /* ignore */ }
  }
}

// ─── fixtures ─────────────────────────────────────────────────────────────────

let tools: PDFTools;
let singlePdf: string;   // created once, reused across tests
let multiPage: string;   // multi-page PDF

beforeAll(async () => {
  tools = new PDFTools();

  singlePdf = tmpFile('single.pdf');
  await tools.createPDF('Hello PDF world\nLine two of the document.', singlePdf, {
    title: 'Test PDF',
    author: 'Jest',
  });

  // Create a slightly longer document that fills more than one page
  const longContent = Array.from({ length: 200 }, (_, i) => `Line ${i + 1} of the long document.`).join('\n');
  multiPage = tmpFile('multi.pdf');
  await tools.createPDF(longContent, multiPage);
});

afterAll(() => {
  cleanup(singlePdf, multiPage);
});

// ─── 1. parsePageRange ────────────────────────────────────────────────────────

describe('parsePageRange', () => {
  // Access the public helper directly (we made it non-private in pdf-tools.ts)
  const t = () => new PDFTools();

  test('single page', () => {
    expect(t().parsePageRange('2', 5)).toEqual([1]); // 0-based → page 2 = index 1
  });

  test('range', () => {
    expect(t().parsePageRange('1-3', 5)).toEqual([0, 1, 2]);
  });

  test('mixed: single + range', () => {
    expect(t().parsePageRange('1,3-5', 6)).toEqual([0, 2, 3, 4]);
  });

  test('clamps to total pages', () => {
    // page 10 doesn't exist in a 5-page doc
    expect(t().parsePageRange('4-10', 5)).toEqual([3, 4]);
  });

  test('ignores out-of-range pages', () => {
    expect(t().parsePageRange('0,6', 5)).toEqual([]); // 0 is invalid (1-based), 6 > 5
  });
});

// ─── 2. createPDF + readPDF + getPDFInfo ──────────────────────────────────────

describe('createPDF', () => {
  test('creates a file on disk', () => {
    expect(fs.existsSync(singlePdf)).toBe(true);
  });

  test('returns correct page count and path', async () => {
    const result = await tools.createPDF('Short content', tmpFile('crt.pdf'));
    cleanup(result.path);
    expect(result.success).toBe(true);
    expect(result.pages).toBeGreaterThanOrEqual(1);
  });

  test('respects title / author metadata', async () => {
    const out = tmpFile('meta-create.pdf');
    await tools.createPDF('Content', out, { title: 'My Title', author: 'My Author' });
    const info = await tools.getPDFInfo(out);
    cleanup(out);
    expect(info.title).toBe('My Title');
    expect(info.author).toBe('My Author');
  });
});

describe('readPDF', () => {
  test('extracts text', async () => {
    const result = await tools.readPDF(singlePdf);
    expect(result.text).toContain('Hello PDF world');
  });

  test('returns page count', async () => {
    const result = await tools.readPDF(singlePdf);
    expect(result.pages).toBeGreaterThanOrEqual(1);
  });

  test('includes info block', async () => {
    const result = await tools.readPDF(singlePdf);
    expect(result.info.filePath).toBe(singlePdf);
    expect(result.info.fileSize).toBeGreaterThan(0);
  });

  test('annotates output when pageRange supplied', async () => {
    const result = await tools.readPDF(singlePdf, '1');
    expect(result.text).toContain('[Extracted pages 1');
  });

  test('throws for non-existent file', async () => {
    await expect(tools.readPDF('/no/such/file.pdf')).rejects.toThrow('File not found');
  });
});

describe('getPDFInfo', () => {
  test('returns metadata', async () => {
    const info = await tools.getPDFInfo(singlePdf);
    expect(info.pages).toBeGreaterThanOrEqual(1);
    expect(info.fileSize).toBeGreaterThan(0);
    expect(info.filePath).toBe(singlePdf);
  });

  test('throws for non-existent file', async () => {
    await expect(tools.getPDFInfo('/no/such/file.pdf')).rejects.toThrow('File not found');
  });
});

// ─── 3. mergePDFs ─────────────────────────────────────────────────────────────

describe('mergePDFs', () => {
  let merged: string;

  afterEach(() => cleanup(merged));

  test('combines two PDFs and returns combined page count', async () => {
    merged = tmpFile('merged.pdf');
    const a = await tools.getPDFInfo(singlePdf);
    const result = await tools.mergePDFs([singlePdf, singlePdf], merged);
    expect(result.success).toBe(true);
    expect(result.pages).toBe(a.pages * 2);
    expect(fs.existsSync(merged)).toBe(true);
  });

  test('throws when filePaths is empty', async () => {
    merged = tmpFile('empty-merge.pdf');
    await expect(tools.mergePDFs([], merged)).rejects.toThrow();
  });

  test('throws when a source file does not exist', async () => {
    merged = tmpFile('bad-merge.pdf');
    await expect(tools.mergePDFs(['/no/such.pdf', singlePdf], merged)).rejects.toThrow('File not found');
  });
});

// ─── 4. splitPDF ──────────────────────────────────────────────────────────────

describe('splitPDF', () => {
  let split: string;

  afterEach(() => cleanup(split));

  test('creates a new PDF with the requested pages', async () => {
    split = tmpFile('split.pdf');
    const result = await tools.splitPDF(singlePdf, '1', split);
    expect(result.success).toBe(true);
    expect(result.pages).toBeGreaterThanOrEqual(1);
    expect(fs.existsSync(split)).toBe(true);
  });

  test('throws for non-existent source', async () => {
    split = tmpFile('split-bad.pdf');
    await expect(tools.splitPDF('/no/such.pdf', '1', split)).rejects.toThrow('File not found');
  });
});

// ─── 5. updatePDFMetadata ─────────────────────────────────────────────────────

describe('updatePDFMetadata', () => {
  let updated: string;

  afterEach(() => cleanup(updated));

  test('updates title and author', async () => {
    updated = tmpFile('updated.pdf');
    const result = await tools.updatePDFMetadata(
      singlePdf,
      { title: 'Updated Title', author: 'Updated Author' },
      updated
    );
    expect(result.success).toBe(true);
    const info = await tools.getPDFInfo(updated);
    expect(info.title).toBe('Updated Title');
    expect(info.author).toBe('Updated Author');
  });

  test('defaults to overwriting when no outputPath given', async () => {
    // Make a copy so we don't corrupt singlePdf
    updated = tmpFile('overwrite.pdf');
    fs.copyFileSync(singlePdf, updated);
    const result = await tools.updatePDFMetadata(updated, { title: 'Overwritten' });
    expect(result.path).toBe(updated);
  });

  test('throws for non-existent file', async () => {
    updated = tmpFile('no-meta.pdf');
    await expect(tools.updatePDFMetadata('/no/such.pdf', { title: 'X' })).rejects.toThrow('File not found');
  });
});

// ─── 6. extractPages ──────────────────────────────────────────────────────────

describe('extractPages', () => {
  let outDir: string;

  beforeEach(() => {
    outDir = path.join(os.tmpdir(), `pdf-extract-${Date.now()}`);
  });

  afterEach(() => {
    try { fs.rmSync(outDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  test('creates one file per page', async () => {
    const result = await tools.extractPages(singlePdf, [1], outDir, 'p');
    expect(result.success).toBe(true);
    expect(result.files.length).toBe(1);
    expect(fs.existsSync(result.files[0])).toBe(true);
  });

  test('creates the output directory if it does not exist', async () => {
    const nested = path.join(outDir, 'nested', 'deep');
    const result = await tools.extractPages(singlePdf, [1], nested);
    expect(result.success).toBe(true);
    expect(fs.existsSync(nested)).toBe(true);
  });

  test('throws for invalid page number', async () => {
    await expect(tools.extractPages(singlePdf, [999], outDir)).rejects.toThrow('Invalid page number');
  });

  test('throws for non-existent source', async () => {
    await expect(tools.extractPages('/no/such.pdf', [1], outDir)).rejects.toThrow('File not found');
  });
});
