import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { replaceEmoticons } from '../utils/emoticonMapper';
import { sanitizeHtml, sanitizeUrl } from '../utils/htmlSanitizer';

const FLAG_MAP = {
  '🇻🇳': 'vn', '🇺🇸': 'us', '🇬🇧': 'gb', '🇫🇷': 'fr', '🇩🇪': 'de',
  '🇯🇵': 'jp', '🇰🇷': 'kr', '🇨🇳': 'cn', '🇷🇺': 'ru', '🇨🇦': 'ca',
  '🇦🇺': 'au', '🇮🇹': 'it', '🇪🇸': 'es', '🇧🇷': 'br', '🇮🇳': 'in',
  '🇸🇬': 'sg', '🇹🇭': 'th', '🇲🇾': 'my', '🇮🇩': 'id', '🇵🇭': 'ph',
  '🇱🇦': 'la', '🇰🇭': 'kh', '🇨🇭': 'ch', '🇸🇪': 'se', '🇳🇱': 'nl',
  '🇦🇷': 'ar', '🇵🇹': 'pt', '🇲🇽': 'mx', '🇪🇺': 'eu'
};

const renderMath = (math, displayMode) => katex.renderToString(math, {
  displayMode,
  trust: false,
  throwOnError: true,
  strict: 'error'
});

function replaceFlagEmojisWithImages(str) {
  if (!str) return '';
  let res = str;
  for (const [flag, iso] of Object.entries(FLAG_MAP)) {
    if (res.includes(flag)) {
      res = res.replaceAll(flag, `<img src="https://flagcdn.com/w40/${iso}.png" alt="${flag}" class="inline-flag-emoji" />`);
    }
  }
  return res;
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Bulletproof, high-performance Markdown + KaTeX rendering engine.
 * Handles:
 * - LaTeX: $$...$$, $...$, \[...\], \(...\)
 * - Markdown: Headings (# to ######), bold (**text**), italic (*text*), blockquotes (>),
 *   fenced code blocks (```), inline code (`code`), lists, tables, and images.
 */
function renderHtmlWithMath(htmlStr) {
  if (!htmlStr) return '';
  // Replace $$...$$ with KaTeX display HTML
  let processed = htmlStr.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return renderMath(math.trim(), true);
    } catch {
      return `$$${math}$$`;
    }
  });
  // Replace $...$ with KaTeX inline HTML
  processed = processed.replace(/\$([^$\n\r]+?)\$/g, (_, math) => {
    try {
      return renderMath(math.trim(), false);
    } catch {
      return `$${math}$`;
    }
  });
  return sanitizeHtml(processed);
}

export default function MathRenderer({ text, className = '', inline = false }) {
  const renderedContent = useMemo(() => {
    if (!text || typeof text !== 'string') return text || '';

    // Normalize AI LaTeX delimiters and convert &nbsp; to standard space
    let normalized = text
      .replace(/&nbsp;/gi, ' ')
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

    // Replace text emoticons (<3 -> ❤️, :) -> 🙂, :3 -> 😺, (y) -> 👍, etc.)
    normalized = replaceEmoticons(normalized);

    // Replace country flags with high-res flag images
    normalized = replaceFlagEmojisWithImages(normalized);

    // Check if input contains rich HTML tags from WYSIWYG editor
    const hasHtmlTags = /<([a-z][a-z0-9]*)\b[^>]*>/i.test(normalized);
    if (hasHtmlTags) {
      const processedHtml = renderHtmlWithMath(normalized);
      const hasBlockTags = /<(div|p|blockquote|table|ul|ol|h[1-6])\b/i.test(normalized);
      if (inline && !hasBlockTags) {
        return <span className="math-inline-rendered" dangerouslySetInnerHTML={{ __html: processedHtml }} />;
      }
      return <div className={`math-rendered-html ${className}`} dangerouslySetInnerHTML={{ __html: processedHtml }} />;
    }

    // Decode HTML entities if markdown mode
    normalized = decodeHtmlEntities(normalized);

    // Inline mode for titles, headings, and buttons
    if (inline) {
      return renderInlineFormatting(normalized);
    }

    // Split text into major blocks: Code blocks, Display Math, Images
    const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$|!\[.*?\]\(.*?\))/g;
    const majorParts = normalized.split(blockRegex);

    return majorParts.map((part, index) => {
      if (!part) return null;

      // 1. Code Block (```lang\ncode\n```)
      if (part.startsWith('```') && part.endsWith('```') && part.length >= 6) {
        const firstLineEnd = part.indexOf('\n');
        let language = 'plaintext';
        let codeContent = '';
        if (firstLineEnd !== -1) {
          language = part.slice(3, firstLineEnd).trim() || 'plaintext';
          codeContent = part.slice(firstLineEnd + 1, -3);
        } else {
          codeContent = part.slice(3, -3);
        }

        // If it's a math code block, render KaTeX directly
        if (language === 'math' || language === 'latex' || language === 'katex') {
          try {
            const html = renderMath(codeContent.trim(), true);
            return <div key={index} className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <pre key={index} className="ai-code-block"><code>{codeContent}</code></pre>;
          }
        }

        return (
          <div key={index} className="ai-code-block-wrapper">
            <div className="ai-code-header">
              <span className="ai-code-lang">{language}</span>
              <button
                type="button"
                className="ai-code-copy-btn"
                onClick={() => navigator.clipboard?.writeText(codeContent)}
                title="Sao chép mã"
              >
                Sao chép
              </button>
            </div>
            <pre className="ai-code-block">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // 2. Display Math ($$...$$)
      if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = renderMath(math, true);
          return <div key={index} className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <code key={index} className="math-render-error">{part}</code>;
        }
      }

      // 3. Image (![alt](src))
      if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [, alt, src] = match;
          return (
            <figure key={index} className="article-diagram-figure">
              <img src={sanitizeUrl(src, { allowImageData: true })} alt={alt || 'Hình minh họa'} className="article-diagram-img" loading="lazy" />
              {alt && <figcaption className="article-diagram-caption">{alt}</figcaption>}
            </figure>
          );
        }
      }

      // 4. Regular text containing headers, lists, quotes, tables, and inline math
      return <span key={index}>{renderMarkdownParagraphs(part)}</span>;
    });
  }, [text, inline, className]);

  if (inline) {
    return <span className={`math-rendered-inline ${className}`}>{renderedContent}</span>;
  }

  return <div className={`math-rendered-container ${className}`}>{renderedContent}</div>;
}

/**
 * Parse Markdown blocks: Headings, Blockquotes, Lists, Tables, Paragraphs
 */
function renderMarkdownParagraphs(content) {
  const lines = content.split('\n');
  const elements = [];
  let tableBuffer = [];

  const flushTable = (keyPrefix) => {
    if (tableBuffer.length === 0) return null;
    const rows = [...tableBuffer];
    tableBuffer = [];

    const isHeaderSeparator = (row) => /^\|?\s*:?-+:?\s*(\|:?-+:?\s*)*\|?$/.test(row.trim());

    return (
      <div key={`table-${keyPrefix}`} className="ai-table-wrapper">
        <table className="ai-markdown-table">
          <tbody>
            {rows.map((rowStr, rIdx) => {
              if (isHeaderSeparator(rowStr)) return null;
              const cells = rowStr.split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
              const isFirstRow = rIdx === 0;
              return (
                <tr key={rIdx} className={isFirstRow ? 'table-header-row' : 'table-body-row'}>
                  {cells.map((cell, cIdx) => {
                    const CellTag = isFirstRow ? 'th' : 'td';
                    return (
                      <CellTag key={cIdx}>
                        {renderInlineFormatting(cell.trim())}
                      </CellTag>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table row detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      elements.push(flushTable(i));
    }

    if (!trimmed) {
      elements.push(<div key={`br-${i}`} className="paragraph-spacer" />);
      continue;
    }

    // Precise Heading Regex matching (supports #, ##, ###, ####, #####, ######)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headingText = headerMatch[2];
      const HeadingTag = `h${Math.min(level + 1, 6)}`;
      const headingClass = `ai-heading-${level}`;
      elements.push(
        <HeadingTag key={`h-${i}`} className={headingClass}>
          {renderInlineFormatting(headingText)}
        </HeadingTag>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="ai-blockquote">
          {renderInlineFormatting(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`li-${i}`} className="article-list-item">
          <span className="bullet-dash" aria-hidden="true">•</span>
          <span>{renderInlineFormatting(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered List
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`numli-${i}`} className="article-list-item numbered">
          <span className="bullet-number">{numMatch[1]}.</span>
          <span>{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={`p-${i}`} className="ai-text-line">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  if (tableBuffer.length > 0) {
    elements.push(flushTable('end'));
  }

  return elements;
}

/**
 * Render inline tokens: $math$, $$math$$, **bold**, *italic*, <u>underline</u>, ~~strikethrough~~, `code`, and plain text
 */
function renderInlineFormatting(str) {
  if (!str) return '';

  // Normalize $$...$$ into $...$ in inline context so it doesn't break into empty $$ tokens
  const cleanStr = String(str).replace(/\$\$([\s\S]*?)\$\$/g, '$$$1$$');

  // Split by inline math ($...$) first
  const mathParts = cleanStr.split(/(\$.*?\$)/g);

  return mathParts.map((part, mIdx) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const math = part.slice(1, -1).trim();
      try {
        const html = renderMath(math, false);
        return <span key={mIdx} className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <code key={mIdx} className="math-render-error">{part}</code>;
      }
    }

    // Split by `inline code`, **bold**, *italic*, <u>underline</u>, ~~strikethrough~~
    const tokenParts = part.split(/(`[^`]+`|\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|~~.*?~~)/g);

    return tokenParts.map((token, tIdx) => {
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return <code key={tIdx} className="ai-inline-code">{token.slice(1, -1)}</code>;
      }
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return <strong key={tIdx} className="ai-bold">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
        return <em key={tIdx} className="ai-italic">{token.slice(1, -1)}</em>;
      }
      if (token.startsWith('<u>') && token.endsWith('</u>') && token.length >= 7) {
        return <u key={tIdx} className="ai-underline">{token.slice(3, -4)}</u>;
      }
      if (token.startsWith('~~') && token.endsWith('~~') && token.length >= 4) {
        return <s key={tIdx} className="ai-strikethrough">{token.slice(2, -2)}</s>;
      }
      return token;
    });
  });
}
