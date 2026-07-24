import {
  AlertTriangle,
  ArrowUpRight,
  BookMarked,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
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
        <h3>{renderMath(block.title)}</h3>
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
      {block.title && <h3>{renderMath(block.title)}</h3>}
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
          <h3>{renderMath(block.title)}</h3>
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
  if (kind === 'theory-stack') {
    return (
      <svg viewBox="0 0 760 390" role="img" aria-label="Bốn tầng lý thuyết của Deep BSDE">
        <defs>
          <marker id="stack-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>
        <rect x="55" y="52" width="285" height="112" rx="18" className="diagram-card diagram-card-soft" />
        <rect x="420" y="52" width="285" height="112" rx="18" className="diagram-card diagram-card-accent" />
        <rect x="55" y="228" width="285" height="112" rx="18" className="diagram-card diagram-card-warm" />
        <rect x="420" y="228" width="285" height="112" rx="18" className="diagram-card diagram-card-soft" />
        <path d="M345 108 H404" markerEnd="url(#stack-arrow)" className="diagram-flow-line" />
        <path d="M563 170 V212" markerEnd="url(#stack-arrow)" className="diagram-flow-line" />
        <path d="M414 284 H355" markerEnd="url(#stack-arrow)" className="diagram-flow-line" />
        <text x="197" y="88" textAnchor="middle" className="diagram-card-title">XÁC SUẤT</text>
        <text x="197" y="121" textAnchor="middle" className="diagram-card-value">W, Itô, SDE</text>
        <text x="197" y="145" textAnchor="middle" className="diagram-small-label">Ngôn ngữ của bất định</text>
        <text x="563" y="88" textAnchor="middle" className="diagram-card-title">ĐIỀU KHIỂN</text>
        <text x="563" y="121" textAnchor="middle" className="diagram-card-value">HJB · FBSDE</text>
        <text x="563" y="145" textAnchor="middle" className="diagram-small-label">Policy và adjoint</text>
        <text x="197" y="264" textAnchor="middle" className="diagram-card-title">DEEP LEARNING</text>
        <text x="197" y="297" textAnchor="middle" className="diagram-card-value">ANN · SGD</text>
        <text x="197" y="321" textAnchor="middle" className="diagram-small-label">Xấp xỉ số chiều cao</text>
        <text x="563" y="264" textAnchor="middle" className="diagram-card-title">MEAN FIELD</text>
        <text x="563" y="297" textAnchor="middle" className="diagram-card-value">MFG · MFC</text>
        <text x="563" y="321" textAnchor="middle" className="diagram-small-label">Law và quần thể</text>
        <rect x="272" y="174" width="216" height="45" rx="12" className="diagram-label-box" />
        <text x="380" y="203" textAnchor="middle" className="diagram-equation">Deep BSDE</text>
      </svg>
    );
  }

  if (kind === 'fbsde-loop') {
    return (
      <svg viewBox="0 0 760 390" role="img" aria-label="Vòng coupling forward backward stochastic differential equation">
        <defs>
          <marker id="fbsde-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>
        <rect x="65" y="75" width="150" height="82" rx="16" className="diagram-card diagram-card-soft" />
        <rect x="305" y="75" width="150" height="82" rx="16" className="diagram-card diagram-card-accent" />
        <rect x="545" y="75" width="150" height="82" rx="16" className="diagram-card diagram-card-warm" />
        <path d="M220 116 H290" markerEnd="url(#fbsde-arrow)" className="diagram-flow-line" />
        <path d="M460 116 H530" markerEnd="url(#fbsde-arrow)" className="diagram-flow-line" />
        <text x="140" y="108" textAnchor="middle" className="diagram-card-title">INITIAL STATE</text>
        <text x="140" y="135" textAnchor="middle" className="diagram-card-value">X₀</text>
        <text x="380" y="108" textAnchor="middle" className="diagram-card-title">FORWARD STATE</text>
        <text x="380" y="135" textAnchor="middle" className="diagram-card-value">Xₜ</text>
        <text x="620" y="108" textAnchor="middle" className="diagram-card-title">TERMINAL</text>
        <text x="620" y="135" textAnchor="middle" className="diagram-card-value">pₜ = ∇g(Xₜ)</text>
        <rect x="305" y="258" width="150" height="82" rx="16" className="diagram-card diagram-card-accent" />
        <rect x="65" y="258" width="150" height="82" rx="16" className="diagram-card diagram-card-soft" />
        <text x="380" y="291" textAnchor="middle" className="diagram-card-title">BACKWARD</text>
        <text x="380" y="318" textAnchor="middle" className="diagram-card-value">pₜ, qₜ</text>
        <text x="140" y="291" textAnchor="middle" className="diagram-card-title">CONTROL</text>
        <text x="140" y="318" textAnchor="middle" className="diagram-card-value">αₜ*(pₜ)</text>
        <path d="M620 164 C620 244 500 299 470 299" markerEnd="url(#fbsde-arrow)" className="diagram-flow-line" />
        <path d="M290 299 H230" markerEnd="url(#fbsde-arrow)" className="diagram-flow-line" />
        <path d="M140 248 C140 211 285 195 362 164" markerEnd="url(#fbsde-arrow)" className="diagram-flow-line" />
        <text x="526" y="244" textAnchor="middle" className="diagram-small-label">terminal boundary</text>
        <text x="242" y="213" textAnchor="middle" className="diagram-small-label">drift coupling</text>
      </svg>
    );
  }

  if (kind === 'ac-tradeoff') {
    return (
      <svg viewBox="0 0 760 390" role="img" aria-label="Các quỹ đạo thanh lý Almgren Chriss theo mức risk aversion">
        <path d="M82 45 V320 H700" className="diagram-axis" />
        <path d="M92 75 C210 86 360 170 665 310" className="diagram-line diagram-line-warm" />
        <path d="M92 75 C250 130 430 235 665 310" className="diagram-line diagram-line-accent" />
        <path d="M92 75 L665 310" className="diagram-line diagram-dashed" />
        <circle cx="92" cy="75" r="7" className="diagram-point" />
        <circle cx="665" cy="310" r="7" className="diagram-point" />
        <text x="47" y="79" className="diagram-axis-label">X₀</text>
        <text x="674" y="336" className="diagram-axis-label">T</text>
        <text x="94" y="355" className="diagram-axis-label">Thời gian</text>
        <text x="22" y="32" className="diagram-axis-label">Inventory</text>
        <text x="530" y="125" className="diagram-series-label diagram-warm-text">λ cao</text>
        <text x="526" y="218" className="diagram-series-label diagram-accent-text">λ vừa</text>
        <text x="526" y="285" className="diagram-series-label">λ → 0</text>
        <rect x="120" y="245" width="230" height="55" rx="12" className="diagram-label-box" />
        <text x="235" y="268" textAnchor="middle" className="diagram-small-label">Risk cao → front-load</text>
        <text x="235" y="289" textAnchor="middle" className="diagram-equation">κ = √(λσ²/η)</text>
      </svg>
    );
  }

  if (kind === 'ac-layers') {
    return (
      <svg viewBox="0 0 760 390" role="img" aria-label="Ba lớp mô hình Almgren Chriss">
        <defs>
          <marker id="ac-layer-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>
        <rect x="42" y="94" width="196" height="190" rx="20" className="diagram-card diagram-card-soft" />
        <rect x="282" y="94" width="196" height="190" rx="20" className="diagram-card diagram-card-accent" />
        <rect x="522" y="94" width="196" height="190" rx="20" className="diagram-card diagram-card-warm" />
        <path d="M244 189 H266" markerEnd="url(#ac-layer-arrow)" className="diagram-flow-line" />
        <path d="M484 189 H506" markerEnd="url(#ac-layer-arrow)" className="diagram-flow-line" />

        <text x="140" y="133" textAnchor="middle" className="diagram-card-title">RỜI RẠC</text>
        <text x="140" y="166" textAnchor="middle" className="diagram-card-value">nₖ · xₖ · τ</text>
        <text x="140" y="201" textAnchor="middle" className="diagram-small-label">Implementation shortfall</text>
        <text x="140" y="228" textAnchor="middle" className="diagram-small-label">Spread + impact</text>
        <text x="140" y="255" textAnchor="middle" className="diagram-equation">E[C] + λ Var(C)</text>

        <text x="380" y="133" textAnchor="middle" className="diagram-card-title">LIÊN TỤC</text>
        <text x="380" y="166" textAnchor="middle" className="diagram-card-value">Ẋₜ = −αₜ</text>
        <text x="380" y="201" textAnchor="middle" className="diagram-small-label">Euler–Lagrange</text>
        <text x="380" y="228" textAnchor="middle" className="diagram-small-label">Hyperbolic path</text>
        <text x="380" y="255" textAnchor="middle" className="diagram-equation">κ = √(λσ²/η)</text>

        <text x="620" y="133" textAnchor="middle" className="diagram-card-title">ĐA TÀI SẢN</text>
        <text x="620" y="166" textAnchor="middle" className="diagram-card-value">H · Σprice</text>
        <text x="620" y="201" textAnchor="middle" className="diagram-small-label">Cross-impact</text>
        <text x="620" y="228" textAnchor="middle" className="diagram-small-label">Risk eigenmodes</text>
        <text x="620" y="255" textAnchor="middle" className="diagram-equation">K = M½</text>

        <text x="380" y="54" textAnchor="middle" className="diagram-card-value">Một trade-off, ba độ phân giải</text>
        <text x="380" y="332" textAnchor="middle" className="diagram-small-label">
          Dữ liệu giao dịch → trực giác vi phân → geometry ma trận
        </text>
      </svg>
    );
  }

  if (kind === 'full-law-encoder') {
    return (
      <svg viewBox="0 0 760 390" role="img" aria-label="Deep Sets mã hóa empirical law thành policy">
        <defs>
          <marker id="law-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>

        <rect x="34" y="76" width="174" height="238" rx="20" className="diagram-zone diagram-zone-neutral" />
        <text x="121" y="110" textAnchor="middle" className="diagram-card-title">PARTICLE CLOUD</text>
        <circle cx="81" cy="155" r="14" className="diagram-point" />
        <circle cx="145" cy="147" r="14" className="diagram-point" />
        <circle cx="112" cy="205" r="14" className="diagram-point" />
        <circle cx="166" cy="230" r="14" className="diagram-point" />
        <circle cx="72" cy="259" r="14" className="diagram-point" />
        <text x="121" y="295" textAnchor="middle" className="diagram-equation">μᴺ = N⁻¹ΣδXⁱ</text>

        <rect x="260" y="106" width="160" height="76" rx="16" className="diagram-card diagram-card-soft" />
        <text x="340" y="136" textAnchor="middle" className="diagram-card-title">SHARED φθ</text>
        <text x="340" y="163" textAnchor="middle" className="diagram-small-label">Mã hóa từng agent</text>

        <rect x="260" y="228" width="160" height="76" rx="16" className="diagram-card diagram-card-accent" />
        <text x="340" y="258" textAnchor="middle" className="diagram-card-title">SYMMETRIC POOL</text>
        <text x="340" y="285" textAnchor="middle" className="diagram-small-label">Mean / sum pooling</text>

        <rect x="478" y="106" width="116" height="76" rx="16" className="diagram-card diagram-card-warm" />
        <text x="536" y="136" textAnchor="middle" className="diagram-card-title">ρθ</text>
        <text x="536" y="163" textAnchor="middle" className="diagram-equation">eₜ</text>

        <rect x="626" y="106" width="104" height="198" rx="18" className="diagram-zone diagram-zone-teal" />
        <text x="678" y="139" textAnchor="middle" className="diagram-card-title">HEADS</text>
        <text x="678" y="180" textAnchor="middle" className="diagram-card-value">p₀</text>
        <text x="678" y="217" textAnchor="middle" className="diagram-card-value">q · q⁰</text>
        <text x="678" y="254" textAnchor="middle" className="diagram-card-value">α*</text>
        <text x="678" y="283" textAnchor="middle" className="diagram-small-label">State + law</text>

        <path d="M214 144 H244" markerEnd="url(#law-arrow)" className="diagram-flow-line" />
        <path d="M340 190 V212" markerEnd="url(#law-arrow)" className="diagram-flow-line" />
        <path d="M426 266 C468 266 454 144 462 144" markerEnd="url(#law-arrow)" className="diagram-flow-line" />
        <path d="M600 144 H610" markerEnd="url(#law-arrow)" className="diagram-flow-line" />
        <text x="380" y="54" textAnchor="middle" className="diagram-card-value">
          Permutation-invariant law representation
        </text>
        <text x="380" y="350" textAnchor="middle" className="diagram-small-label">
          Hoán vị agents không làm đổi pooled embedding
        </text>
      </svg>
    );
  }

  if (kind === 'mfg-mfc') {
    return (
      <svg viewBox="0 0 760 390" role="img" aria-label="So sánh Mean Field Game và Mean Field Control">
        <defs>
          <marker id="meanfield-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>
        <rect x="42" y="45" width="318" height="300" rx="20" className="diagram-zone diagram-zone-neutral" />
        <rect x="400" y="45" width="318" height="300" rx="20" className="diagram-zone diagram-zone-teal" />
        <text x="201" y="82" textAnchor="middle" className="diagram-card-title">MEAN FIELD GAME</text>
        <text x="559" y="82" textAnchor="middle" className="diagram-card-title">MEAN FIELD CONTROL</text>
        <rect x="87" y="113" width="228" height="62" rx="14" className="diagram-card diagram-card-soft" />
        <text x="201" y="140" textAnchor="middle" className="diagram-small-label">Agent tối ưu riêng</text>
        <text x="201" y="162" textAnchor="middle" className="diagram-equation">Best response α*(m)</text>
        <rect x="87" y="238" width="228" height="62" rx="14" className="diagram-card diagram-card-soft" />
        <text x="201" y="265" textAnchor="middle" className="diagram-small-label">Population consistency</text>
        <text x="201" y="287" textAnchor="middle" className="diagram-equation">m = Law(Xα*)</text>
        <path d="M201 183 V222" markerEnd="url(#meanfield-arrow)" className="diagram-flow-line" />
        <path d="M77 269 C47 210 52 146 78 144" markerEnd="url(#meanfield-arrow)" className="diagram-flow-line" />
        <rect x="445" y="113" width="228" height="62" rx="14" className="diagram-card diagram-card-accent" />
        <text x="559" y="140" textAnchor="middle" className="diagram-small-label">Social planner</text>
        <text x="559" y="162" textAnchor="middle" className="diagram-equation">min Jsocial(α, Law)</text>
        <rect x="445" y="238" width="228" height="62" rx="14" className="diagram-card diagram-card-warm" />
        <text x="559" y="265" textAnchor="middle" className="diagram-small-label">Nội hóa externality</text>
        <text x="559" y="287" textAnchor="middle" className="diagram-equation">Social optimum</text>
        <path d="M559 183 V222" markerEnd="url(#meanfield-arrow)" className="diagram-flow-line" />
        <text x="380" y="370" textAnchor="middle" className="diagram-equation">PoA = social cost(MFG) / social cost(MFC)</text>
      </svg>
    );
  }

  if (kind === 'deep-bsde-pipeline') {
    return (
      <svg viewBox="0 0 760 390" role="img" aria-label="Pipeline huấn luyện Deep BSDE">
        <defs>
          <marker id="deep-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" className="diagram-arrow-head" />
          </marker>
        </defs>
        <rect x="35" y="122" width="130" height="98" rx="16" className="diagram-card diagram-card-soft" />
        <rect x="220" y="122" width="130" height="98" rx="16" className="diagram-card diagram-card-accent" />
        <rect x="405" y="122" width="130" height="98" rx="16" className="diagram-card diagram-card-warm" />
        <rect x="590" y="122" width="130" height="98" rx="16" className="diagram-card diagram-card-soft" />
        <path d="M170 171 H205" markerEnd="url(#deep-arrow)" className="diagram-flow-line" />
        <path d="M355 171 H390" markerEnd="url(#deep-arrow)" className="diagram-flow-line" />
        <path d="M540 171 H575" markerEnd="url(#deep-arrow)" className="diagram-flow-line" />
        <text x="100" y="153" textAnchor="middle" className="diagram-card-title">SAMPLE</text>
        <text x="100" y="180" textAnchor="middle" className="diagram-card-value">X₀, ΔW</text>
        <text x="100" y="203" textAnchor="middle" className="diagram-small-label">Monte Carlo</text>
        <text x="285" y="153" textAnchor="middle" className="diagram-card-title">NETWORK</text>
        <text x="285" y="180" textAnchor="middle" className="diagram-card-value">p₀, q, q⁰</text>
        <text x="285" y="203" textAnchor="middle" className="diagram-small-label">Unknown objects</text>
        <text x="470" y="153" textAnchor="middle" className="diagram-card-title">ROLLOUT</text>
        <text x="470" y="180" textAnchor="middle" className="diagram-card-value">Xₖ, pₖ</text>
        <text x="470" y="203" textAnchor="middle" className="diagram-small-label">Euler graph</text>
        <text x="655" y="153" textAnchor="middle" className="diagram-card-title">BOUNDARY</text>
        <text x="655" y="180" textAnchor="middle" className="diagram-card-value">Lossₜ</text>
        <text x="655" y="203" textAnchor="middle" className="diagram-small-label">Terminal mismatch</text>
        <path d="M655 230 C655 330 285 340 285 237" markerEnd="url(#deep-arrow)" className="diagram-flow-line" />
        <rect x="347" y="278" width="174" height="48" rx="12" className="diagram-label-box" />
        <text x="434" y="308" textAnchor="middle" className="diagram-equation">Backprop + SGD</text>
        <text x="380" y="75" textAnchor="middle" className="diagram-card-value">Boundary-value problem → learning problem</text>
      </svg>
    );
  }

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
        <path d="M120 80 L650 280" className="diagram-line diagram-line-accent" />
        <path d="M120 280 C250 270 330 230 390 182 C470 125 560 90 650 65" className="diagram-line diagram-line-warm" />
        <path d="M390 182 V302" className="diagram-guide" />
        <circle cx="390" cy="182" r="8" className="diagram-point" />
        <text x="660" y="286" className="diagram-series-label diagram-accent-text">MR</text>
        <text x="650" y="62" className="diagram-series-label diagram-warm-text">MC</text>
        <text x="390" y="328" textAnchor="middle" className="diagram-axis-label">q*</text>
        <text x="92" y="24" className="diagram-axis-label">Giá trị biên</text>
        <text x="672" y="327" className="diagram-axis-label">Sản lượng q</text>
        <text x="245" y="164" textAnchor="middle" className="diagram-zone-label">MR &gt; MC</text>
        <text x="535" y="178" textAnchor="middle" className="diagram-zone-label">MR &lt; MC</text>
        <rect x="322" y="105" width="136" height="46" rx="12" className="diagram-label-box" />
        <text x="390" y="134" textAnchor="middle" className="diagram-equation">MR = MC</text>
      </svg>
    );
  }

  if (kind === 'average-cost') {
    return (
      <svg viewBox="0 0 760 360" role="img" aria-label="Chi phí biên cắt chi phí trung bình tại điểm đáy">
        <path d="M80 35 V302 H710" className="diagram-axis" />
        <path d="M120 85 Q385 375 650 85" className="diagram-line diagram-line-accent" />
        <path d="M140 290 C250 280 320 255 385 230 C480 190 565 130 650 65" className="diagram-line diagram-line-warm" />
        <path d="M385 230 V302" className="diagram-guide" />
        <circle cx="385" cy="230" r="8" className="diagram-point" />
        <text x="655" y="104" className="diagram-series-label diagram-accent-text">AC</text>
        <text x="650" y="52" className="diagram-series-label diagram-warm-text">MC</text>
        <text x="385" y="328" textAnchor="middle" className="diagram-axis-label">q₀</text>
        <text x="98" y="25" className="diagram-axis-label">Chi phí</text>
        <text x="668" y="327" className="diagram-axis-label">q</text>
        <rect x="307" y="145" width="156" height="48" rx="12" className="diagram-label-box" />
        <text x="385" y="175" textAnchor="middle" className="diagram-equation">MC = AC</text>
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
      <path d="M105 275 C220 255 315 205 395 152 C490 90 585 75 680 82" className="diagram-line diagram-line-accent" />
      <path d="M175 262 L622 38.5" className="diagram-line diagram-line-warm diagram-dashed" />
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
  return (
    <figure className="economic-diagram">
      <div className="economic-diagram-heading">
        <div>
          <span>Minh họa trực quan</span>
          <h3>{block.title}</h3>
        </div>
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
          <h3>{renderMath(block.title)}</h3>
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

function CodeBlock({ block }) {
  return (
    <figure className="article-code-block">
      <figcaption>
        <span>{block.label || 'Python'}</span>
        {block.note && <small>{block.note}</small>}
      </figcaption>
      <pre>
        <code>{block.content}</code>
      </pre>
    </figure>
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
          {block.note && <p>{renderMath(block.note)}</p>}
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

    case 'code':
      return <CodeBlock block={block} />;

    default:
      return null;
  }
}
