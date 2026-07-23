import { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookMarked,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Maximize2,
  Minimize2,
  Quote,
  Route,
  Target,
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

function SolutionSteps({ steps, className = 'exam-solution' }) {
  return (
    <ol className={className}>
      {steps.map((step, index) => {
        const content = typeof step === 'string' ? step : step.content;
        const label = typeof step === 'string' ? `Bước ${index + 1}` : step.label;

        return (
          <li key={`${label}-${content}`}>
            <span className="solution-step-marker">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{label}</strong>
              <div>{renderMath(content)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function WorkedExampleBlock({ block }) {
  return (
    <details className="worked-example" open={block.open}>
      <summary>
        <span className="worked-example-icon" aria-hidden="true">
          <BookOpenCheck size={18} />
        </span>
        <div>
          <span className="worked-example-kicker">{block.meta || 'Ví dụ minh họa · có lời giải'}</span>
          <h3>{block.title}</h3>
        </div>
        <span className="worked-example-toggle" aria-hidden="true">
          <ChevronDown size={19} />
        </span>
      </summary>
      <div className="worked-example-body">
        <div className="worked-example-prompt">
          <span>Bài toán</span>
          <div>{renderMath(block.prompt)}</div>
        </div>
        {block.method && (
          <div className="worked-example-method">
            <Route size={18} aria-hidden="true" />
            <div>
              <strong>Ý tưởng giải</strong>
              <div>{renderMath(block.method)}</div>
            </div>
          </div>
        )}
        <SolutionSteps steps={block.steps} className="worked-example-solution" />
        <div className="worked-example-result">
          <span>Kết luận</span>
          <div>{renderMath(block.result)}</div>
        </div>
        {block.interpretation && (
          <p className="worked-example-interpretation">
            <strong>Đọc theo kinh tế:</strong> {renderMath(block.interpretation)}
          </p>
        )}
      </div>
    </details>
  );
}

function DiagramArtwork({ kind }) {
  if (kind === 'marginal-chain') {
    return (
      <svg viewBox="0 0 760 300" role="img" aria-label="Chuỗi lao động, sản lượng và doanh thu">
        <defs>
          <marker id="chain-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>
        <rect x="45" y="88" width="170" height="104" rx="20" className="diagram-card diagram-card-soft" />
        <rect x="295" y="88" width="170" height="104" rx="20" className="diagram-card diagram-card-accent" />
        <rect x="545" y="88" width="170" height="104" rx="20" className="diagram-card diagram-card-warm" />
        <path d="M220 140 H280" markerEnd="url(#chain-arrow)" className="diagram-flow-line" />
        <path d="M470 140 H530" markerEnd="url(#chain-arrow)" className="diagram-flow-line" />
        <text x="130" y="128" textAnchor="middle" className="diagram-card-title">LAO ĐỘNG</text>
        <text x="130" y="158" textAnchor="middle" className="diagram-card-value">L</text>
        <text x="380" y="128" textAnchor="middle" className="diagram-card-title">SẢN LƯỢNG</text>
        <text x="380" y="158" textAnchor="middle" className="diagram-card-value">Q(L)</text>
        <text x="630" y="128" textAnchor="middle" className="diagram-card-title">DOANH THU</text>
        <text x="630" y="158" textAnchor="middle" className="diagram-card-value">R(Q)</text>
        <text x="250" y="118" textAnchor="middle" className="diagram-small-label">MPL</text>
        <text x="500" y="118" textAnchor="middle" className="diagram-small-label">MR</text>
        <path d="M130 222 C270 280 490 280 630 222" className="diagram-brace" />
        <text x="380" y="274" textAnchor="middle" className="diagram-equation">MRP = MR × MPL</text>
      </svg>
    );
  }

  if (kind === 'profit-optimum') {
    return (
      <svg viewBox="0 0 760 360" role="img" aria-label="Giao điểm doanh thu biên và chi phí biên">
        <path d="M80 35 V302 H710" className="diagram-axis" />
        <path d="M125 78 L655 276" className="diagram-line diagram-line-accent" />
        <path d="M125 274 C305 258 480 202 655 72" className="diagram-line diagram-line-warm" />
        <path d="M405 218 V302" className="diagram-guide" />
        <circle cx="405" cy="218" r="8" className="diagram-point" />
        <text x="660" y="286" className="diagram-series-label diagram-accent-text">MR</text>
        <text x="650" y="62" className="diagram-series-label diagram-warm-text">MC</text>
        <text x="405" y="328" textAnchor="middle" className="diagram-axis-label">q*</text>
        <text x="92" y="24" className="diagram-axis-label">Giá trị biên</text>
        <text x="672" y="327" className="diagram-axis-label">Sản lượng q</text>
        <text x="262" y="178" textAnchor="middle" className="diagram-zone-label">MR &gt; MC</text>
        <text x="548" y="187" textAnchor="middle" className="diagram-zone-label">MR &lt; MC</text>
        <rect x="337" y="112" width="136" height="46" rx="12" className="diagram-label-box" />
        <text x="405" y="141" textAnchor="middle" className="diagram-equation">MR = MC</text>
      </svg>
    );
  }

  if (kind === 'average-cost') {
    return (
      <svg viewBox="0 0 760 360" role="img" aria-label="Chi phí biên cắt chi phí trung bình tại điểm đáy">
        <path d="M80 35 V302 H710" className="diagram-axis" />
        <path d="M120 78 C235 274 425 286 655 92" className="diagram-line diagram-line-accent" />
        <path d="M145 280 C335 258 475 190 650 62" className="diagram-line diagram-line-warm" />
        <path d="M396 216 V302" className="diagram-guide" />
        <circle cx="396" cy="216" r="8" className="diagram-point" />
        <text x="655" y="104" className="diagram-series-label diagram-accent-text">AC</text>
        <text x="650" y="52" className="diagram-series-label diagram-warm-text">MC</text>
        <text x="396" y="328" textAnchor="middle" className="diagram-axis-label">q₀</text>
        <text x="98" y="25" className="diagram-axis-label">Chi phí</text>
        <text x="668" y="327" className="diagram-axis-label">q</text>
        <rect x="318" y="130" width="156" height="48" rx="12" className="diagram-label-box" />
        <text x="396" y="160" textAnchor="middle" className="diagram-equation">MC = AC</text>
      </svg>
    );
  }

  if (kind === 'elasticity-revenue') {
    return (
      <svg viewBox="0 0 760 330" role="img" aria-label="Ba vùng co giãn và chiều biến động doanh thu">
        <rect x="60" y="70" width="205" height="178" rx="20" className="diagram-zone diagram-zone-teal" />
        <rect x="278" y="70" width="205" height="178" rx="20" className="diagram-zone diagram-zone-neutral" />
        <rect x="496" y="70" width="205" height="178" rx="20" className="diagram-zone diagram-zone-rose" />
        <text x="162" y="112" textAnchor="middle" className="diagram-card-title">CO GIÃN</text>
        <text x="380" y="112" textAnchor="middle" className="diagram-card-title">ĐƠN VỊ</text>
        <text x="598" y="112" textAnchor="middle" className="diagram-card-title">ÍT CO GIÃN</text>
        <text x="162" y="151" textAnchor="middle" className="diagram-card-value">|Eₚ| &gt; 1</text>
        <text x="380" y="151" textAnchor="middle" className="diagram-card-value">|Eₚ| = 1</text>
        <text x="598" y="151" textAnchor="middle" className="diagram-card-value">|Eₚ| &lt; 1</text>
        <text x="162" y="192" textAnchor="middle" className="diagram-zone-label">Tăng giá → TR giảm</text>
        <text x="380" y="192" textAnchor="middle" className="diagram-zone-label">TR dừng bậc nhất</text>
        <text x="598" y="192" textAnchor="middle" className="diagram-zone-label">Tăng giá → TR tăng</text>
        <text x="162" y="224" textAnchor="middle" className="diagram-small-label">MR &gt; 0</text>
        <text x="380" y="224" textAnchor="middle" className="diagram-small-label">MR = 0</text>
        <text x="598" y="224" textAnchor="middle" className="diagram-small-label">MR &lt; 0</text>
        <path d="M162 266 H598" className="diagram-brace" />
        <text x="380" y="300" textAnchor="middle" className="diagram-equation">Đừng đồng nhất dTR/dp với dTR/dQ</text>
      </svg>
    );
  }

  if (kind === 'income-split') {
    return (
      <svg viewBox="0 0 760 310" role="img" aria-label="Thu nhập tăng thêm được chia cho tiêu dùng và tiết kiệm">
        <defs>
          <marker id="income-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>
        <rect x="55" y="100" width="190" height="100" rx="20" className="diagram-card diagram-card-accent" />
        <rect x="515" y="35" width="190" height="94" rx="20" className="diagram-card diagram-card-soft" />
        <rect x="515" y="181" width="190" height="94" rx="20" className="diagram-card diagram-card-warm" />
        <path d="M250 150 C350 150 400 82 500 82" markerEnd="url(#income-arrow)" className="diagram-flow-line" />
        <path d="M250 150 C350 150 400 228 500 228" markerEnd="url(#income-arrow)" className="diagram-flow-line" />
        <text x="150" y="140" textAnchor="middle" className="diagram-card-title">THU NHẬP TĂNG</text>
        <text x="150" y="170" textAnchor="middle" className="diagram-card-value">dI</text>
        <text x="610" y="72" textAnchor="middle" className="diagram-card-title">TIÊU DÙNG</text>
        <text x="610" y="101" textAnchor="middle" className="diagram-card-value">dC = MPC·dI</text>
        <text x="610" y="218" textAnchor="middle" className="diagram-card-title">TIẾT KIỆM</text>
        <text x="610" y="247" textAnchor="middle" className="diagram-card-value">dS = MPS·dI</text>
        <text x="375" y="292" textAnchor="middle" className="diagram-equation">MPC + MPS = 1</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 760 360" role="img" aria-label="Đường cong và tiếp tuyến biểu diễn xấp xỉ cục bộ">
      <path d="M80 35 V302 H710" className="diagram-axis" />
      <path d="M105 275 C230 250 310 202 395 152 C490 96 585 78 680 82" className="diagram-line diagram-line-accent" />
      <path d="M175 278 L622 52" className="diagram-line diagram-line-warm diagram-dashed" />
      <path d="M395 152 V302 M395 152 H80" className="diagram-guide" />
      <circle cx="395" cy="152" r="8" className="diagram-point" />
      <text x="620" y="76" className="diagram-series-label diagram-warm-text">Tiếp tuyến</text>
      <text x="654" y="105" className="diagram-series-label diagram-accent-text">y = f(x)</text>
      <text x="395" y="328" textAnchor="middle" className="diagram-axis-label">x₀</text>
      <text x="105" y="142" className="diagram-axis-label">f(x₀)</text>
      <text x="668" y="327" className="diagram-axis-label">x</text>
      <rect x="225" y="40" width="205" height="54" rx="12" className="diagram-label-box" />
      <text x="327" y="62" textAnchor="middle" className="diagram-small-label">Hệ số góc tại x₀</text>
      <text x="327" y="82" textAnchor="middle" className="diagram-equation">f′(x₀)</text>
    </svg>
  );
}

function DiagramBlock({ block }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <figure className={`economic-diagram ${isExpanded ? 'is-expanded' : ''}`}>
      <div className="economic-diagram-heading">
        <div>
          <span>Minh họa trực quan</span>
          <h3>{block.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
          title={isExpanded ? 'Thu nhỏ hình' : 'Phóng lớn hình'}
        >
          {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          <span>{isExpanded ? 'Thu nhỏ' : 'Phóng lớn'}</span>
        </button>
      </div>
      <div className="economic-diagram-canvas">
        <DiagramArtwork kind={block.kind} />
      </div>
      {block.caption && <figcaption>{renderMath(block.caption)}</figcaption>}
    </figure>
  );
}

function ExamBlock({ block }) {
  return (
    <details className={`exam-dossier ${block.featured ? 'is-featured' : ''}`} open={block.featured}>
      <summary>
        <div className="exam-dossier-heading">
          <span className="exam-dossier-meta">{block.meta}</span>
          <h3>{block.title}</h3>
          <div className="exam-dossier-chips">
            {block.skill && <span>{block.skill}</span>}
            {block.difficulty && <span>{block.difficulty}</span>}
          </div>
        </div>
        <span className="exam-dossier-toggle" aria-hidden="true">
          <ChevronDown size={20} />
        </span>
      </summary>
      <div className="exam-dossier-body">
        {(block.given || block.ask) && (
          <div className="exam-brief-grid">
            {block.given && (
              <div>
                <span>Dữ kiện cốt lõi</span>
                <div>{renderMath(block.given)}</div>
              </div>
            )}
            {block.ask && (
              <div>
                <span>Đích cần tìm</span>
                <div>{renderMath(block.ask)}</div>
              </div>
            )}
          </div>
        )}
        <div className="exam-prompt">
          <span>Đề bài</span>
          <div>{renderMath(block.prompt)}</div>
        </div>
        {block.method && (
          <div className="exam-method">
            <Target size={18} aria-hidden="true" />
            <div>
              <strong>Chiến lược</strong>
              <div>{renderMath(block.method)}</div>
            </div>
          </div>
        )}
        <div className="exam-solution-heading">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Lời giải từng bước</span>
        </div>
        <SolutionSteps steps={block.steps} />
        <div className="exam-result">
          <span>Kết quả</span>
          <div>{renderMath(block.result)}</div>
        </div>
        {block.interpretation && (
          <div className="exam-interpretation">
            <strong>Diễn giải</strong>
            <div>{renderMath(block.interpretation)}</div>
          </div>
        )}
        {block.check && (
          <div className="exam-check">
            <CheckCircle2 size={17} aria-hidden="true" />
            <div>
              <strong>Tự kiểm tra</strong>
              <div>{renderMath(block.check)}</div>
            </div>
          </div>
        )}
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

    case 'example':
      return <WorkedExampleBlock block={block} />;

    case 'diagram':
      return <DiagramBlock block={block} />;

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
