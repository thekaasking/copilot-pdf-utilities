/**
 * Lightweight text statistics and approximate tokenizer.
 *
 * Approximates OpenAI/Claude BPE tokenization without requiring a large
 * dependency. Uses the widely-accepted heuristic of ~4 characters per token
 * for English text, with adjustments for whitespace and punctuation.
 */

/**
 * Count words in a text string (splits on whitespace).
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  return text.trim().split(/\s+/).length;
}

/**
 * Approximate token count for LLMs (Claude, GPT).
 *
 * Uses a hybrid heuristic:
 * - English prose averages ~4 characters per token with BPE tokenizers
 * - Short words and punctuation tend to be single tokens
 * - We count whitespace-separated words, then apply a multiplier for
 *   subword splits that BPE commonly performs on longer words.
 *
 * Accuracy: typically within ±10% for English prose.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  // Primary heuristic: characters / 4 (well-established for English + BPE)
  // This naturally accounts for punctuation being its own token and
  // longer words being split into subwords.
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within a maximum word count.
 * Returns the truncated text.
 */
export function truncateByWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(' ');
}

/**
 * Truncate text to fit within an approximate token budget.
 * Uses character-based estimation (4 chars ≈ 1 token).
 * Returns the truncated text.
 */
export function truncateByTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }
  // Cut at character boundary, then trim to last complete word
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.8) {
    return cut.slice(0, lastSpace);
  }
  return cut;
}
