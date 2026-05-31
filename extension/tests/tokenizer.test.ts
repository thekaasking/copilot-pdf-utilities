/**
 * Unit tests for tokenizer utility and read_pdf pagination / word+token counting.
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { countWords, estimateTokens, truncateByWords, truncateByTokens } from '../src/tokenizer';
import { PDFTools } from '../src/pdf-tools';

// Mock pdf-parse — return configurable text so we can test counting/truncation
const MOCK_TEXT = 'The quick brown fox jumps over the lazy dog. ' +
  'Pack my box with five dozen liquor jugs. ' +
  'How vexingly quick daft zebras jump.';

jest.mock('pdf-parse', () =>
  jest.fn((_buffer: Buffer) =>
    Promise.resolve({
      numpages: 1,
      text: MOCK_TEXT,
      info: { Title: 'Mock', Author: 'Test' }
    })
  )
);

// ─── helpers ──────────────────────────────────────────────────────────────────

function tmpFile(name: string): string {
  return path.join(os.tmpdir(), `pdf-utils-tok-test-${Date.now()}-${name}`);
}

function cleanup(...paths: string[]) {
  for (const p of paths) {
    try { fs.unlinkSync(p); } catch { /* ignore */ }
  }
}

// ─── 1. Tokenizer pure functions ──────────────────────────────────────────────

describe('countWords', () => {
  test('empty string returns 0', () => {
    expect(countWords('')).toBe(0);
  });

  test('whitespace-only returns 0', () => {
    expect(countWords('   \n\t  ')).toBe(0);
  });

  test('single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  test('multiple words with varied spacing', () => {
    expect(countWords('one  two   three')).toBe(3);
  });

  test('counts words in the mock text correctly', () => {
    // "The quick brown fox jumps over the lazy dog." = 9 words
    // "Pack my box with five dozen liquor jugs." = 8 words
    // "How vexingly quick daft zebras jump." = 6 words
    // Total = 23 words
    expect(countWords(MOCK_TEXT)).toBe(23);
  });
});

describe('estimateTokens', () => {
  test('empty string returns 0', () => {
    expect(estimateTokens('')).toBe(0);
  });

  test('approximates tokens as ceil(chars / 4)', () => {
    const text = 'Hello world'; // 11 chars → ceil(11/4) = 3
    expect(estimateTokens(text)).toBe(3);
  });

  test('token count is proportional to text length', () => {
    const short = 'Short text.';
    const long = short.repeat(10);
    // ceil(11/4)=3 vs ceil(110/4)=28 — close to 10x (ceiling causes minor variance)
    expect(estimateTokens(long)).toBe(Math.ceil(long.length / 4));
    expect(estimateTokens(long)).toBeGreaterThan(estimateTokens(short) * 9);
  });

  test('returns a reasonable estimate for English prose', () => {
    // MOCK_TEXT has 23 words. Typical BPE gives ~1.3 tokens/word for English,
    // so expect roughly 30 tokens. Our char-based heuristic: ceil(chars/4).
    const tokens = estimateTokens(MOCK_TEXT);
    // Should be in a reasonable range (20-50 for a 23-word sentence)
    expect(tokens).toBeGreaterThan(20);
    expect(tokens).toBeLessThan(60);
  });
});

describe('truncateByWords', () => {
  test('returns full text when under limit', () => {
    expect(truncateByWords('one two three', 5)).toBe('one two three');
  });

  test('truncates to max words', () => {
    const result = truncateByWords('one two three four five six', 3);
    expect(result).toBe('one two three');
  });

  test('preserves single word', () => {
    expect(truncateByWords('hello', 1)).toBe('hello');
  });

  test('handles exact limit', () => {
    expect(truncateByWords('one two three', 3)).toBe('one two three');
  });
});

describe('truncateByTokens', () => {
  test('returns full text when under limit', () => {
    const text = 'short';  // 5 chars → ~1.25 tokens
    expect(truncateByTokens(text, 10)).toBe(text);
  });

  test('truncates long text', () => {
    const text = 'a '.repeat(100).trim(); // 199 chars → ~50 tokens
    const result = truncateByTokens(text, 10); // 10 tokens → ~40 chars
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.length).toBeGreaterThan(0);
  });

  test('cuts at word boundary when possible', () => {
    const text = 'word1 word2 word3 word4 word5 word6 word7 word8';
    const result = truncateByTokens(text, 5); // 5 tokens → ~20 chars
    // Should consist of complete words (no partial words)
    const words = result.split(' ');
    expect(words.every(w => w.length > 0)).toBe(true);
    // Each resulting word should be a word from the original
    const originalWords = text.split(' ');
    expect(words.every(w => originalWords.includes(w))).toBe(true);
  });
});

// ─── 2. PDFTools integration (readPDF with counting & pagination) ─────────────

describe('readPDF word/token counting', () => {
  let tools: PDFTools;
  let testPdf: string;

  beforeAll(async () => {
    tools = new PDFTools();
    testPdf = tmpFile('count-test.pdf');
    await tools.createPDF(MOCK_TEXT, testPdf);
  });

  afterAll(() => cleanup(testPdf));

  test('readPDF returns wordCount', async () => {
    const result = await tools.readPDF(testPdf);
    expect(result.wordCount).toBe(23);
  });

  test('readPDF returns approxTokenCount', async () => {
    const result = await tools.readPDF(testPdf);
    expect(result.approxTokenCount).toBeGreaterThan(0);
    // Should be ceil(text.length / 4)
    expect(result.approxTokenCount).toBe(Math.ceil(MOCK_TEXT.length / 4));
  });

  test('info block also contains wordCount and approxTokenCount', async () => {
    const result = await tools.readPDF(testPdf);
    expect(result.info.wordCount).toBe(result.wordCount);
    expect(result.info.approxTokenCount).toBe(result.approxTokenCount);
  });

  test('readPDF with maxWords truncates text', async () => {
    const result = await tools.readPDF(testPdf, undefined, { maxWords: 5 });
    expect(result.truncated).toBe(true);
    expect(result.truncationMethod).toBe('maxWords');
    // Truncated text should have at most 5 words
    const truncatedWordCount = result.text.trim().split(/\s+/).length;
    expect(truncatedWordCount).toBeLessThanOrEqual(5);
    // But full counts are still reported
    expect(result.wordCount).toBe(23);
    expect(result.approxTokenCount).toBe(Math.ceil(MOCK_TEXT.length / 4));
  });

  test('readPDF with maxTokens truncates text', async () => {
    const result = await tools.readPDF(testPdf, undefined, { maxTokens: 5 });
    expect(result.truncated).toBe(true);
    expect(result.truncationMethod).toBe('maxTokens');
    // Truncated text should be shorter than original
    expect(result.text.length).toBeLessThan(MOCK_TEXT.length);
    // Full counts are still reported
    expect(result.wordCount).toBe(23);
  });

  test('readPDF without truncation has no truncated flag', async () => {
    const result = await tools.readPDF(testPdf);
    expect(result.truncated).toBeUndefined();
    expect(result.truncationMethod).toBeUndefined();
  });

  test('maxWords takes precedence over maxTokens', async () => {
    const result = await tools.readPDF(testPdf, undefined, { maxWords: 3, maxTokens: 1000 });
    expect(result.truncated).toBe(true);
    expect(result.truncationMethod).toBe('maxWords');
  });
});

// ─── 3. getPDFInfo word/token counting ────────────────────────────────────────

describe('getPDFInfo word/token counting', () => {
  let tools: PDFTools;
  let testPdf: string;

  beforeAll(async () => {
    tools = new PDFTools();
    testPdf = tmpFile('info-count-test.pdf');
    await tools.createPDF(MOCK_TEXT, testPdf);
  });

  afterAll(() => cleanup(testPdf));

  test('getPDFInfo returns wordCount', async () => {
    const info = await tools.getPDFInfo(testPdf);
    expect(info.wordCount).toBeDefined();
    expect(info.wordCount).toBe(23);
  });

  test('getPDFInfo returns approxTokenCount', async () => {
    const info = await tools.getPDFInfo(testPdf);
    expect(info.approxTokenCount).toBeDefined();
    expect(info.approxTokenCount).toBe(Math.ceil(MOCK_TEXT.length / 4));
  });

  test('token count is consistent between readPDF and getPDFInfo', async () => {
    const readResult = await tools.readPDF(testPdf);
    const info = await tools.getPDFInfo(testPdf);
    expect(info.wordCount).toBe(readResult.wordCount);
    expect(info.approxTokenCount).toBe(readResult.approxTokenCount);
  });
});
