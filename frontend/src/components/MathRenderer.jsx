import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Bulletproof, high-performance Markdown + KaTeX rendering engine.
 * Handles:
 * - LaTeX: $$...$$, $...$, \[...\], \(...\)
 * - Markdown: Headings (# to ######), bold (**text**), italic (*text*), blockquotes (>),
 *   fenced code blocks (```), inline code (`code`), lists, tables, and images.
 */
export default function MathRenderer({ text, className = '', inline = false }) {
  const renderedContent = useMemo(() => {
    if (!text || typeof text !== 'string') return text || '';

    // Normalize AI LaTeX delimiters: \[ -> $$ and \( -> $
    const normalized = text
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

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
            const html = katex.renderToString(codeContent.trim(), {
              displayMode: true,
              throwOnError: false
            });
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
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false
          });
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
              <img src={src} alt={alt || 'Hình minh họa'} className="article-diagram-img" loading="lazy" />
              {alt && <figcaption className="article-diagram-caption">{alt}</figcaption>}
            </figure>
          );
        }
      }

      // 4. Regular text containing headers, lists, quotes, tables, and inline math
      return <span key={index}>{renderMarkdownParagraphs(part)}</span>;
    });
  }, [text, inline]);

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
 * Render inline tokens: $math$, **bold**, *italic*, `code`, and plain text
 */
function renderInlineFormatting(str) {
  if (!str) return '';

  // Split by inline math ($...$) first
  const mathParts = str.split(/(\$.*?\$)/g);

  return mathParts.map((part, mIdx) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const math = part.slice(1, -1).trim();
      try {
        const html = katex.renderToString(math, {
          displayMode: false,
          throwOnError: false
        });
        return <span key={mIdx} className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <code key={mIdx} className="math-render-error">{part}</code>;
      }
    }

    // Split by `inline code`, **bold**, *italic*
    const tokenParts = part.split(/(`[^`]+`|\*\*.*?\*\*|\*.*?\*)/g);

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
      return token;
    });
  });
}
