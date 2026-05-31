import { readFileSync, writeFileSync, statSync, existsSync, mkdirSync } from 'fs';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { countWords, estimateTokens, truncateByWords, truncateByTokens } from './tokenizer';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export interface PDFInfo {
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
  wordCount?: number;
  approxTokenCount?: number;
}

export interface PDFTextContent {
  text: string;
  pages: number;
  info: PDFInfo;
  wordCount: number;
  approxTokenCount: number;
  truncated?: boolean;
  truncationMethod?: 'maxWords' | 'maxTokens';
}

export interface CreatePDFOptions {
  title?: string;
  author?: string;
  subject?: string;
  fontSize?: number;
  pageSize?: keyof typeof PageSizes;
  margins?: { top: number; bottom: number; left: number; right: number };
}

export class PDFTools {
  /**
   * Read and extract text from a PDF file.
   * Supports optional pagination via maxWords or maxTokens.
   */
  async readPDF(
    filePath: string,
    pageRange?: string,
    options?: { maxWords?: number; maxTokens?: number }
  ): Promise<PDFTextContent> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const dataBuffer = readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const stats = statSync(filePath);
    const info: PDFInfo = {
      pages: data.numpages,
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      creator: data.info?.Creator,
      producer: data.info?.Producer,
      creationDate: data.info?.CreationDate ? String(data.info.CreationDate) : undefined,
      modificationDate: data.info?.ModDate ? String(data.info.ModDate) : undefined,
      fileSize: stats.size,
      filePath
    };

    let text = data.text as string;

    if (pageRange) {
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pages = this.parsePageRange(pageRange, pdfDoc.getPageCount());
      text = `[Extracted pages ${pageRange} (indices: ${pages.map(p => p + 1).join(',')})]\n${text}`;
    }

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
      pages: data.numpages,
      info,
      wordCount: totalWordCount,
      approxTokenCount: totalTokenCount,
      ...(truncated && { truncated, truncationMethod })
    };
  }

  /**
   * Get PDF metadata and information (includes word and token counts)
   */
  async getPDFInfo(filePath: string): Promise<PDFInfo> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const dataBuffer = readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const stats = statSync(filePath);

    // Extract text for word/token counting
    const data = await pdfParse(dataBuffer);
    const text = data.text as string;

    return {
      pages: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      subject: pdfDoc.getSubject(),
      creator: pdfDoc.getCreator(),
      producer: pdfDoc.getProducer(),
      creationDate: pdfDoc.getCreationDate()?.toISOString(),
      modificationDate: pdfDoc.getModificationDate()?.toISOString(),
      fileSize: stats.size,
      filePath,
      wordCount: countWords(text),
      approxTokenCount: estimateTokens(text)
    };
  }

  /**
   * Create a new PDF from text content
   */
  async createPDF(
    content: string,
    outputPath: string,
    options: CreatePDFOptions = {}
  ): Promise<{ success: boolean; path: string; pages: number }> {
    const pdfDoc = await PDFDocument.create();

    if (options.title) { pdfDoc.setTitle(options.title); }
    if (options.author) { pdfDoc.setAuthor(options.author); }
    if (options.subject) { pdfDoc.setSubject(options.subject); }
    pdfDoc.setCreator('PDF Utilities');
    pdfDoc.setProducer('pdf-lib');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 12;
    const pageSize = options.pageSize ? PageSizes[options.pageSize] : PageSizes.A4;
    const margins = options.margins || { top: 50, bottom: 50, left: 50, right: 50 };

    const maxWidth = pageSize[0] - margins.left - margins.right;
    const lineHeight = fontSize * 1.2;

    const lines = this.wrapText(content, font, fontSize, maxWidth);

    let page = pdfDoc.addPage(pageSize);
    let y = pageSize[1] - margins.top;

    for (const line of lines) {
      if (y < margins.bottom) {
        page = pdfDoc.addPage(pageSize);
        y = pageSize[1] - margins.top;
      }

      page.drawText(line, {
        x: margins.left,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      });

      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    writeFileSync(outputPath, pdfBytes);

    return {
      success: true,
      path: outputPath,
      pages: pdfDoc.getPageCount()
    };
  }

  /**
   * Merge multiple PDFs into one
   */
  async mergePDFs(
    filePaths: string[],
    outputPath: string
  ): Promise<{ success: boolean; path: string; pages: number }> {
    if (filePaths.length === 0) {
      throw new Error('No PDF files provided for merging');
    }

    const mergedPdf = await PDFDocument.create();

    for (const filePath of filePaths) {
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const pdfBytes = readFileSync(filePath);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPages().map((_, i) => i));
      copiedPages.forEach((p) => mergedPdf.addPage(p));
    }

    mergedPdf.setCreator('PDF Utilities');
    mergedPdf.setProducer('pdf-lib');
    mergedPdf.setModificationDate(new Date());

    const mergedPdfBytes = await mergedPdf.save();
    writeFileSync(outputPath, mergedPdfBytes);

    return {
      success: true,
      path: outputPath,
      pages: mergedPdf.getPageCount()
    };
  }

  /**
   * Split PDF or extract specific pages
   */
  async splitPDF(
    filePath: string,
    pageRange: string,
    outputPath: string
  ): Promise<{ success: boolean; path: string; pages: number }> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const pdfBytes = readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();

    const pages = this.parsePageRange(pageRange, pdfDoc.getPageCount());
    const copiedPages = await newPdf.copyPages(pdfDoc, pages);
    copiedPages.forEach((p) => newPdf.addPage(p));

    newPdf.setCreator('PDF Utilities');
    newPdf.setProducer('pdf-lib');
    newPdf.setCreationDate(new Date());

    const newPdfBytes = await newPdf.save();
    writeFileSync(outputPath, newPdfBytes);

    return {
      success: true,
      path: outputPath,
      pages: newPdf.getPageCount()
    };
  }

  /**
   * Update PDF metadata
   */
  async updatePDFMetadata(
    filePath: string,
    metadata: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string;
    },
    outputPath?: string
  ): Promise<{ success: boolean; path: string }> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const pdfBytes = readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    if (metadata.title) { pdfDoc.setTitle(metadata.title); }
    if (metadata.author) { pdfDoc.setAuthor(metadata.author); }
    if (metadata.subject) { pdfDoc.setSubject(metadata.subject); }
    if (metadata.keywords) { pdfDoc.setKeywords([metadata.keywords]); }
    pdfDoc.setModificationDate(new Date());

    const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
    const savePath = outputPath || filePath;
    writeFileSync(savePath, modifiedPdfBytes);

    return {
      success: true,
      path: savePath
    };
  }

  /**
   * Extract pages from PDF into separate files
   */
  async extractPages(
    filePath: string,
    pages: number[],
    outputDir: string,
    prefix: string = 'page'
  ): Promise<{ success: boolean; files: string[] }> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const pdfBytes = readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const extractedFiles: string[] = [];

    for (const pageNum of pages) {
      if (pageNum < 1 || pageNum > pdfDoc.getPageCount()) {
        throw new Error(`Invalid page number: ${pageNum}. PDF has ${pdfDoc.getPageCount()} pages.`);
      }

      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
      newPdf.addPage(copiedPage);

      const outputPath = `${outputDir}/${prefix}_${pageNum}.pdf`;
      const newPdfBytes = await newPdf.save();
      writeFileSync(outputPath, newPdfBytes);
      extractedFiles.push(outputPath);
    }

    return {
      success: true,
      files: extractedFiles
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  parsePageRange(range: string, totalPages: number): number[] {
    const pages: number[] = [];
    const parts = range.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) {
            pages.push(i - 1);
          }
        }
      } else {
        const pageNum = parseInt(trimmed, 10);
        if (pageNum >= 1 && pageNum <= totalPages) {
          pages.push(pageNum - 1);
        }
      }
    }

    return pages;
  }

  private wrapText(text: string, font: { widthOfTextAtSize(t: string, s: number): number }, fontSize: number, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }
}
