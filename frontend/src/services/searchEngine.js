/**
 * Hybrid Search Engine for UEH Math Community
 * Supports:
 * 1. Normalized Vietnamese full-text search (with and without accent marks).
 * 2. Raw LaTeX formula command matching (e.g. \int, \partial, \det, \lambda, \begin{pmatrix}).
 * 3. Tag & Author tokens (e.g. #MaTran, @LuPhuc).
 * 4. Extensible Interface for future Image OCR search / Visual mathematical similarity.
 */

// Helper to remove Vietnamese diacritics
export function removeVietnameseTones(str = '') {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Clean & tokenize a search query
 */
export function parseSearchTokens(query = '') {
  if (!query || typeof query !== 'string') return { textTokens: [], latexTokens: [], tags: [], authors: [] };

  const trimmed = query.trim();
  const tags = [];
  const authors = [];
  const latexTokens = [];
  const textTokens = [];

  // Match #tags
  const tagMatches = trimmed.match(/#([\w\u00C0-\u1EF9]+)/g);
  if (tagMatches) {
    tagMatches.forEach(t => tags.push(t.slice(1).toLowerCase()));
  }

  // Match @authors
  const authorMatches = trimmed.match(/@([\w\u00C0-\u1EF9]+)/g);
  if (authorMatches) {
    authorMatches.forEach(a => authors.push(a.slice(1).toLowerCase()));
  }

  // Match LaTeX commands like \int, \partial, \frac, etc.
  const latexMatches = trimmed.match(/\\[a-zA-Z]+/g);
  if (latexMatches) {
    latexMatches.forEach(l => latexTokens.push(l.toLowerCase()));
  }

  // Normal text terms (excluding tokens)
  let cleanText = trimmed
    .replace(/#([\w\u00C0-\u1EF9]+)/g, '')
    .replace(/@([\w\u00C0-\u1EF9]+)/g, '')
    .trim();

  if (cleanText) {
    const rawTerms = cleanText.split(/\s+/).filter(Boolean);
    textTokens.push(...rawTerms);
  }

  return { textTokens, latexTokens, tags, authors, rawQuery: trimmed };
}

/**
 * Match a post against search query
 */
export function matchPost(post, query = '') {
  if (!query || !query.trim()) return true;

  const parsed = parseSearchTokens(query);
  const normalizedQuery = removeVietnameseTones(parsed.rawQuery);

  const titleNorm = removeVietnameseTones(post.title || '');
  const contentNorm = removeVietnameseTones(post.content || '');
  const authorNorm = removeVietnameseTones(post.author?.name || '');
  const rawContent = (post.content || '').toLowerCase();
  const rawTitle = (post.title || '').toLowerCase();

  // 1. Check direct query inclusion
  if (titleNorm.includes(normalizedQuery) || contentNorm.includes(normalizedQuery)) {
    return true;
  }

  // 2. Check LaTeX command tokens
  if (parsed.latexTokens.length > 0) {
    const hasAllLatex = parsed.latexTokens.every(token => rawContent.includes(token) || rawTitle.includes(token));
    if (hasAllLatex) return true;
  }

  // 3. Check Tag tokens
  if (parsed.tags.length > 0) {
    const postTags = (post.tags || []).map(t => removeVietnameseTones(t).replace('#', ''));
    const hasTag = parsed.tags.some(tag => postTags.some(pt => pt.includes(removeVietnameseTones(tag))));
    if (hasTag) return true;
  }

  // 4. Check Author tokens
  if (parsed.authors.length > 0) {
    const hasAuthor = parsed.authors.some(a => authorNorm.includes(removeVietnameseTones(a)));
    if (hasAuthor) return true;
  }

  // 5. Check text tokens (word-by-word)
  if (parsed.textTokens.length > 0) {
    const matchedTokens = parsed.textTokens.filter(token => {
      const normToken = removeVietnameseTones(token);
      return titleNorm.includes(normToken) || contentNorm.includes(normToken) || authorNorm.includes(normToken);
    });
    return matchedTokens.length === parsed.textTokens.length;
  }

  return false;
}

/**
 * Highlight keywords in text
 */
export function highlightKeywords(text = '', query = '') {
  if (!text || !query || !query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) return text;

  try {
    const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return text.replace(pattern, '<mark class="search-highlight">$1</mark>');
  } catch {
    return text;
  }
}

/**
 * Interface prepared for future Visual Image / OCR Search
 */
export async function searchByImage(imageBlob, metadata = {}) {
  // Architectural placeholder for AI OCR / KaTeX image feature extractor
  console.info('SearchByImage interface initialized for OCR math recognition...', metadata);
  return {
    success: true,
    recognizedLatex: '',
    results: []
  };
}
