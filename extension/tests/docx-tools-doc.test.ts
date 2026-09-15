/**
 * Unit tests for extension/src/docx-tools.ts (legacy .doc path).
 *
 * word-extractor (OLE binary parsing) is mocked here — its own test suite
 * covers real .doc parsing. This only verifies that DocxTools routes .doc
 * files through word-extractor and shapes the result correctly.
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

const mockGetBody = jest.fn(() => 'Legacy doc body text with several words in it.');
const mockExtract = jest.fn().mockResolvedValue({ getBody: mockGetBody });

jest.mock('word-extractor', () =>
  jest.fn().mockImplementation(() => ({ extract: mockExtract }))
);

import { DocxTools } from '../src/docx-tools';

function tmpFile(name: string): string {
  return path.join(os.tmpdir(), `docx-utils-test-${Date.now()}-${name}`);
}

describe('readDocx (.doc)', () => {
  let tools: DocxTools;
  let legacyDoc: string;

  beforeAll(() => {
    tools = new DocxTools();
    legacyDoc = tmpFile('legacy.doc');
    fs.writeFileSync(legacyDoc, Buffer.from('dummy OLE bytes'));
  });

  afterAll(() => {
    try { fs.unlinkSync(legacyDoc); } catch { /* ignore */ }
  });

  test('extracts text via word-extractor and reports format: doc', async () => {
    const result = await tools.readDocx(legacyDoc);
    expect(result.text).toContain('Legacy doc body text');
    expect(result.info.format).toBe('doc');
    expect(result.info.filePath).toBe(legacyDoc);
    expect(result.info.title).toBeUndefined();
  });

  test('passes the file buffer to word-extractor', async () => {
    await tools.readDocx(legacyDoc);
    expect(mockExtract).toHaveBeenCalledWith(expect.any(Buffer));
  });
});
