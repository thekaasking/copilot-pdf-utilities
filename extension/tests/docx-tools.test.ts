/**
 * Unit tests for extension/src/docx-tools.ts (.docx path).
 *
 * Exercised against the real fixture (tests/test-document.docx) via
 * mammoth/jszip, with no mocking, so real-world parsing is verified.
 * Legacy .doc handling (word-extractor is mocked there) lives in
 * docx-tools-doc.test.ts.
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { DocxTools } from '../src/docx-tools';

const FIXTURE_DOCX = path.join(__dirname, 'test-document.docx');

function tmpFile(name: string): string {
  return path.join(os.tmpdir(), `docx-utils-test-${Date.now()}-${name}`);
}

describe('readDocx (.docx)', () => {
  let tools: DocxTools;

  beforeAll(() => {
    tools = new DocxTools();
  });

  test('extracts text from the real fixture', async () => {
    const result = await tools.readDocx(FIXTURE_DOCX);
    expect(result.text).toContain('PDF Utilities - Test Document');
    expect(result.text).toContain('Section 1: Introduction');
    expect(result.text).toContain('Lorem ipsum dolor sit amet');
  });

  test('reports word and token counts', async () => {
    const result = await tools.readDocx(FIXTURE_DOCX);
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.approxTokenCount).toBeGreaterThan(0);
    expect(result.info.wordCount).toBe(result.wordCount);
    expect(result.info.approxTokenCount).toBe(result.approxTokenCount);
  });

  test('includes info block with fileSize, filePath, and format', async () => {
    const result = await tools.readDocx(FIXTURE_DOCX);
    expect(result.info.filePath).toBe(FIXTURE_DOCX);
    expect(result.info.fileSize).toBeGreaterThan(0);
    expect(result.info.format).toBe('docx');
  });

  test('truncates text at a word boundary when maxWords is set', async () => {
    const full = await tools.readDocx(FIXTURE_DOCX);
    const result = await tools.readDocx(FIXTURE_DOCX, { maxWords: 5 });
    expect(result.truncated).toBe(true);
    expect(result.truncationMethod).toBe('maxWords');
    expect(result.text.split(/\s+/).length).toBeLessThanOrEqual(5);
    // Full counts are still reported even though text was truncated
    expect(result.wordCount).toBe(full.wordCount);
  });

  test('truncates text when maxTokens is set', async () => {
    const result = await tools.readDocx(FIXTURE_DOCX, { maxTokens: 10 });
    expect(result.truncated).toBe(true);
    expect(result.truncationMethod).toBe('maxTokens');
    expect(result.text.length).toBeLessThanOrEqual(40 + 1); // ~4 chars/token, plus small word-boundary slack
  });

  test('maxWords takes precedence over maxTokens when both are set', async () => {
    const result = await tools.readDocx(FIXTURE_DOCX, { maxWords: 5, maxTokens: 1000 });
    expect(result.truncationMethod).toBe('maxWords');
  });

  test('does not report truncated when no limits are given', async () => {
    const result = await tools.readDocx(FIXTURE_DOCX);
    expect(result.truncated).toBeUndefined();
  });

  test('throws for non-existent file', async () => {
    await expect(tools.readDocx('/no/such/file.docx')).rejects.toThrow('File not found');
  });

  test('throws for unsupported file extension', async () => {
    const badFile = tmpFile('not-a-word-doc.txt');
    fs.writeFileSync(badFile, 'plain text');
    await expect(tools.readDocx(badFile)).rejects.toThrow('Unsupported file type');
    fs.unlinkSync(badFile);
  });
});
