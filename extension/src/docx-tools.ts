import { readFileSync, statSync, existsSync } from 'fs';
import { extname } from 'path';
import JSZip from 'jszip';
import { countWords, estimateTokens, truncateByWords, truncateByTokens } from './tokenizer';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WordExtractor = require('word-extractor');

export interface DocxInfo {
  title?: string;
  author?: string;
  subject?: string;
  lastModifiedBy?: string;
  createdDate?: string;
  modifiedDate?: string;
  fileSize: number;
  filePath: string;
  format: 'doc' | 'docx';
  wordCount?: number;
  approxTokenCount?: number;
}

export interface DocxTextContent {
  text: string;
  info: DocxInfo;
  wordCount: number;
  approxTokenCount: number;
  truncated?: boolean;
  truncationMethod?: 'maxWords' | 'maxTokens';
  warnings?: string[];
}

interface DocxCoreProperties {
  title?: string;
  author?: string;
  subject?: string;
  lastModifiedBy?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export class DocxTools {
  /**
   * Read and extract text from a Word document (.doc or .docx).
   * Supports optional pagination via maxWords or maxTokens, mirroring readPDF.
   */
  async readDocx(
    filePath: string,
    options?: { maxWords?: number; maxTokens?: number }
  ): Promise<DocxTextContent> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = extname(filePath).toLowerCase();
    if (ext !== '.docx' && ext !== '.doc') {
      throw new Error(`Unsupported file type: '${ext}'. Expected a .doc or .docx file.`);
    }

    const stats = statSync(filePath);
    const buffer = readFileSync(filePath);

    let text: string;
    let warnings: string[] = [];
    let coreProps: DocxCoreProperties = {};

    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = (result.value as string).trim();
      warnings = (result.messages as Array<{ type: string; message: string }>)
        .filter((m) => m.type === 'warning')
        .map((m) => m.message);
      coreProps = await this.readCoreProperties(buffer);
    } else {
      const extractor = new WordExtractor();
      const doc = await extractor.extract(buffer);
      text = (doc.getBody() as string).trim();
    }

    const info: DocxInfo = {
      ...coreProps,
      fileSize: stats.size,
      filePath,
      format: ext === '.docx' ? 'docx' : 'doc'
    };

    // Compute full-document stats before truncation
    const totalWordCount = countWords(text);
    const totalTokenCount = estimateTokens(text);
    info.wordCount = totalWordCount;
    info.approxTokenCount = totalTokenCount;

    // Apply pagination/truncation if requested
    let truncated = false;
    let truncationMethod: 'maxWords' | 'maxTokens' | undefined;

    if (options?.maxWords && options.maxWords > 0) {
      const truncatedText = truncateByWords(text, options.maxWords);
      if (truncatedText.length < text.length) {
        text = truncatedText;
        truncated = true;
        truncationMethod = 'maxWords';
      }
    } else if (options?.maxTokens && options.maxTokens > 0) {
      const truncatedText = truncateByTokens(text, options.maxTokens);
      if (truncatedText.length < text.length) {
        text = truncatedText;
        truncated = true;
        truncationMethod = 'maxTokens';
      }
    }

    return {
      text,
      info,
      wordCount: totalWordCount,
      approxTokenCount: totalTokenCount,
      ...(truncated && { truncated, truncationMethod }),
      ...(warnings.length > 0 && { warnings })
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Reads docProps/core.xml out of a .docx (OOXML zip) for title/author metadata.
   * Legacy .doc files (OLE binary format) have no equivalent exposed by word-extractor,
   * so this is only called for .docx.
   */
  private async readCoreProperties(buffer: Buffer): Promise<DocxCoreProperties> {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const coreFile = zip.file('docProps/core.xml');
      if (!coreFile) {
        return {};
      }
      const coreXml = await coreFile.async('string');

      const extract = (tag: string): string | undefined => {
        const match = coreXml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
        const value = match?.[1]?.trim();
        return value ? value : undefined;
      };

      return {
        title: extract('dc:title'),
        author: extract('dc:creator'),
        subject: extract('dc:subject'),
        lastModifiedBy: extract('cp:lastModifiedBy'),
        createdDate: extract('dcterms:created'),
        modifiedDate: extract('dcterms:modified')
      };
    } catch {
      return {};
    }
  }
}
