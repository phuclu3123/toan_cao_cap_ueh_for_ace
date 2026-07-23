import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * High-performance, instant LaTeX rendering component using KaTeX.
 * Replaces slow MathJax async DOM scanning with synchronous, crisp KaTeX HTML output.
 */
export default function MathRenderer({ text, className = '' }) {
  const renderedContent = useMemo(() => {
    if (!text || typeof text !== 'string') return text || '';

    // Regex to split by $$...$$, $...$, and ![alt](src)
    const regex = /(\$\$.*?\$\$|\$.*?\$|!\[.*?\]\(.*?\))/s;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [, alt, src] = match;
          return (
            <figure key={index} className="article-diagram-figure">
              <img src={src} alt={alt} className="article-diagram-img" />
              {alt && <figcaption className="article-diagram-caption">📌 {alt}</figcaption>}
            </figure>
          );
        }
      }

      if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
            trust: true
          });
          return <span key={index} className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
          console.warn("KaTeX render error:", e);
          return <span key={index}>{part}</span>;
        }
      }

      if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
            trust: true
          });
          return <span key={index} className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
          console.warn("KaTeX render error:", e);
          return <span key={index}>{part}</span>;
        }
      }

      // Plain text part: parse bullet items (- item) and markdown bold (**text**) / italic (*text*)
      const parseFormattedText = (str) => {
        // If string contains newlines with bullet items "- "
        if (str.includes('\n- ') || str.startsWith('- ')) {
          const lines = str.split('\n');
          return lines.map((line, lIdx) => {
            if (line.trim().startsWith('- ')) {
              const content = line.trim().slice(2);
              return (
                <div key={lIdx} className="article-list-item">
                  <span className="bullet-dash">•</span>
                  <span>{parseFormattedTokens(content)}</span>
                </div>
              );
            }
            return <div key={lIdx}>{parseFormattedTokens(line)}</div>;
          });
        }
        return parseFormattedTokens(str);
      };

      const parseFormattedTokens = (str) => {
        // Match **bold** or *italic*
        const tokenRegex = /(\*\*.*?\*\*|\*.*?\*)/g;
        const tokens = str.split(tokenRegex);
        return tokens.map((token, tIdx) => {
          if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
            return <strong key={tIdx}>{token.slice(2, -2)}</strong>;
          }
          if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
            return <em key={tIdx}>{token.slice(1, -1)}</em>;
          }
          return token;
        });
      };

      return <span key={index}>{parseFormattedText(part)}</span>;
    });
  }, [text]);

  return <span className={`math-rendered-container ${className}`}>{renderedContent}</span>;
}
