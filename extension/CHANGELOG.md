# Changelog

## [2.1.0]

- Added word count (`wordCount`) and approximate LLM token count (`approxTokenCount`) to `read_pdf` and `get_pdf_info` responses.
- Added `maxWords` and `maxTokens` pagination parameters to `read_pdf` — text is truncated at a word boundary; full counts are always reported.
- New `tokenizer.ts` module: zero-dependency word counter and `ceil(chars/4)` token estimator (~±10% for English, compatible with GPT/Claude BPE tokenizers).
- Extended `PDFInfo` interface with optional `wordCount` and `approxTokenCount` fields.
- `PDFTextContent` now includes `wordCount`, `approxTokenCount`, and optional `truncated`/`truncationMethod` fields.
- Updated `package.json` input schema for `pdf-utilities_read_pdf` with `maxWords` and `maxTokens` properties.
- Updated model descriptions for `read_pdf` and `get_pdf_info` tools to document new fields.
- Added 26 unit tests covering tokenizer functions, pagination, and counter consistency.

## [2.0.0]

Initial marketplace release.

- 7 PDF tools registered via VS Code Language Model Tools API (no MCP required): `read_pdf`, `get_pdf_info`, `create_pdf`, `merge_pdfs`, `split_pdf`, `update_metadata`, `extract_pages`.
- `@pdf` chat participant for attaching and querying PDF files directly in chat.
- PDF text extraction via `pdf-parse`; creation and modification via `pdf-lib`.
- Supports optional page ranges for `read_pdf` and `split_pdf` (e.g. `1-5`, `1,3,5-10`).
- Copilot chat instructions file registered via `contributes.chatInstructions`.
- 27 Jest unit tests.
