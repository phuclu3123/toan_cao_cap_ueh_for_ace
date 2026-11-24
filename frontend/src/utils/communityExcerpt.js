import katex from 'katex';

/** Keep math whole; Vietnamese prose belongs outside KaTeX's text alphabet. */
export function communityExcerpt(content = '', maxLength = 160) {
  const clean = String(content).replace(/!\[.*?\]\(.*?\)/g, '').replace(/<[^>]+>/g, ' ').replace(/^#+\s+/gm, '').replace(/\s+/g, ' ').trim();
  let result = '';
  let index = 0;
  while (index < clean.length && result.length < maxLength) {
    if (clean[index] === '$' && clean[index - 1] !== '\\') {
      const delimiter = clean.startsWith('$$', index) ? '$$' : '$';
      const end = clean.indexOf(delimiter, index + delimiter.length);
      if (end === -1) break;
      const formula = clean.slice(index + delimiter.length, end);
      if (formula.length > 240) break;
      const parts = formula.split(/\\text\{([^{}]*[^\u0020-\u007E][^{}]*)\}/g);
      let rendered = '';
      try {
        for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
          if (partIndex % 2) { rendered += ' ' + parts[partIndex] + ' '; continue; }
          const math = parts[partIndex].replace(/^(?:\s*\\q?quad)+|(?:\\q?quad\s*)+$/g, '').trim();
          if (!math) continue;
          katex.renderToString(math, { throwOnError: true, strict: 'error', trust: false });
          rendered += '$' + math + '$';
        }
      } catch { break; }
      result += rendered;
      index = end + delimiter.length;
    } else result += clean[index++];
  }
  if (index < clean.length) {
    const trimmed = result.trimEnd();
    const boundary = trimmed.lastIndexOf(' ');
    if (trimmed.length >= maxLength && trimmed.at(-1) !== '$' && boundary > maxLength - 25) result = trimmed.slice(0, boundary);
    return result.trim() ? result.trim() + '…' : 'Mở câu hỏi để xem đề bài và công thức đầy đủ.';
  }
  return result.trim();
}
