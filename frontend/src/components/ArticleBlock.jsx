import {
  AlertTriangle,
  ArrowUpRight,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Quote,
} from 'lucide-react';
import MathRenderer from './MathRenderer';

const renderMath = (content, className = '') => (
  <MathRenderer text={content} className={className} />
);

function InsightBlock({ block }) {
  const Icon = block.tone === 'rose' ? AlertTriangle : Lightbulb;

  return (
    <aside className={`editorial-callout tone-${block.tone || 'teal'}`}>
      <span className="editorial-callout-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <h3>{block.title}</h3>
        <div>{renderMath(block.content)}</div>
      </div>
    </aside>
  );
}

function ComparisonBlock({ block }) {
  return (
    <div className="editorial-table-wrap">
      <table className="editorial-table">
        <thead>
          <tr>
            {block.columns.map((column) => (
              <th key={column}>{renderMath(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{renderMath(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StepsBlock({ block }) {
  return (
    <div className="editorial-steps">
      {block.title && <h3>{block.title}</h3>}
      <ol>
        {block.items.map((item, index) => (
          <li key={item}>
            <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
            <div>{renderMath(item)}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExamBlock({ block }) {
  return (
    <details className={`exam-dossier ${block.featured ? 'is-featured' : ''}`} open={block.featured}>
      <summary>
        <div className="exam-dossier-heading">
          <span className="exam-dossier-meta">{block.meta}</span>
          <h3>{block.title}</h3>
        </div>
        <span className="exam-dossier-toggle" aria-hidden="true">
          <ChevronDown size={20} />
        </span>
      </summary>
      <div className="exam-dossier-body">
        <div className="exam-prompt">
          <span>Đề bài</span>
          <div>{renderMath(block.prompt)}</div>
        </div>
        <ol className="exam-solution">
          {block.steps.map((step) => (
            <li key={step}>
              <CheckCircle2 size={17} aria-hidden="true" />
              <div>{renderMath(step)}</div>
            </li>
          ))}
        </ol>
        <div className="exam-result">
          <span>Kết quả</span>
          <div>{renderMath(block.result)}</div>
        </div>
        {block.trap && (
          <div className="exam-trap">
            <AlertTriangle size={17} aria-hidden="true" />
            <div>
              <strong>Bẫy cần tránh</strong>
              <div>{renderMath(block.trap)}</div>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

function SourceListBlock({ block }) {
  return (
    <div className="article-source-panel">
      <div className="article-source-heading">
        <BookMarked size={19} aria-hidden="true" />
        <h3>{block.title}</h3>
      </div>
      <div className="article-source-list">
        {block.items.map((item) => {
          const content = (
            <>
              <span>
                <strong>{item.title}</strong>
                {item.note && <small>{item.note}</small>}
              </span>
              {item.href && <ArrowUpRight size={17} aria-hidden="true" />}
            </>
          );

          return item.href ? (
            <a href={item.href} target="_blank" rel="noreferrer" key={item.title}>
              {content}
            </a>
          ) : (
            <div className="article-source-item" key={item.title}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArticleBlock({ block }) {
  switch (block.type) {
    case 'paragraph':
      return <div className="editorial-paragraph">{renderMath(block.content)}</div>;

    case 'formula':
      return (
        <figure className="formula-panel">
          <figcaption>{block.label}</figcaption>
          <div className="formula-panel-expression">{renderMath(block.content)}</div>
          {block.note && <p>{block.note}</p>}
        </figure>
      );

    case 'insight':
      return <InsightBlock block={block} />;

    case 'comparison':
      return <ComparisonBlock block={block} />;

    case 'steps':
      return <StepsBlock block={block} />;

    case 'exam':
      return <ExamBlock block={block} />;

    case 'source-note':
      return (
        <aside className="source-note">
          <Quote size={19} aria-hidden="true" />
          <div>
            <h3>{block.title}</h3>
            <p>{block.content}</p>
          </div>
        </aside>
      );

    case 'source-list':
      return <SourceListBlock block={block} />;

    default:
      return null;
  }
}
