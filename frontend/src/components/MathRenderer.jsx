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

    // Regex to split by $$...$$ and $...$ (non-greedy)
    const regex = /(\$\$.*?\$\$|\$.*?\$)/s;
    const parts = text.split(regex);

    return parts.map((part, index) => {
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

      return part;
    });
  }, [text]);

  return <span className={`math-rendered-container ${className}`}>{renderedContent}</span>;
}
