import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  PenLine,
  Sparkles,
  Trophy
} from 'lucide-react';
import MathRenderer from '../MathRenderer';
import '../../assets/styles/community.css';

const PROOF_SLIDES = [
  {
    index: '024',
    live: 12,
    equation: '$$\\nabla f(x,y)=\\lambda\\nabla g(x,y)$$',
    description: 'Cực trị có điều kiện · Phương pháp nhân tử Lagrange',
    steps: ['Mô hình hóa', 'Biến đổi', 'Kiểm chứng']
  },
  {
    index: '031',
    live: 8,
    equation: '$$A=Q\\Lambda Q^{-1}$$',
    description: 'Chéo hóa ma trận · Trị riêng và vector riêng',
    steps: ['Lập đa thức', 'Tìm cơ sở', 'Chéo hóa']
  },
  {
    index: '047',
    live: 16,
    equation: '$$\\iint_D (x^2+y^2)\\,dA$$',
    description: 'Tích phân kép · Đổi sang hệ tọa độ cực',
    steps: ['Phác miền', 'Đổi biến', 'Tính tích phân']
  }
];

/**
 * Masthead for the Math Q&A hub.
 * Restrained ink panel + real community metrics + a single ask entry point.
 */
export default function CommunityHeader({
  stats,
  onOpenCreate,
  onOpenLeaderboard,
  onOpenCheatsheet
}) {
  const [activeProof, setActiveProof] = useState(0);
  const [isProofPaused, setIsProofPaused] = useState(false);
  const totalDiscussions = stats?.totalDiscussions || 0;
  const totalAnswers = stats?.totalAnswers || 0;
  const solvedRate = stats?.solvedRate || 0;
  const openCount = stats?.openCount || 0;
  const currentProof = PROOF_SLIDES[activeProof];

  useEffect(() => {
    if (isProofPaused) return undefined;
    const timer = window.setInterval(() => {
      setActiveProof((current) => (current + 1) % PROOF_SLIDES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isProofPaused]);

  return (
    <header className="qa-masthead">
      <div className="qa-masthead-grid">
        <div className="qa-masthead-copy">
          <span className="q-eyebrow">
            <span className="qa-eyebrow-dot" />
            UEH · Diễn đàn Toán Cao Cấp
          </span>

          <h1 className="qa-masthead-title">
            Hỏi đáp Toán Cao Cấp
            <em>hỏi đúng. giải sâu. tiến bộ thật.</em>
          </h1>

          <p className="qa-masthead-desc">
            Câu hỏi được kiểm tra chất lượng trước khi đăng. Mọi thành viên có thể
            bình luận và đóng góp lời giải ngay, sau đó cộng đồng cùng đánh giá và phản biện.
          </p>

          <div className="qa-masthead-actions">
            <button type="button" className="q-btn q-btn-primary" onClick={onOpenCreate}>
              <PenLine size={16} />
              <span>Đặt câu hỏi</span>
            </button>
            <button type="button" className="q-btn q-btn-ink" onClick={onOpenCheatsheet}>
              <BookOpen size={16} />
              <span>Sổ tay KaTeX</span>
            </button>
            <button type="button" className="q-btn q-btn-ink" onClick={onOpenLeaderboard}>
              <Trophy size={16} />
              <span>Bảng vàng</span>
            </button>
          </div>
        </div>

        <aside
          className="qa-proofboard"
          aria-label="Bảng chứng minh nổi bật"
          onMouseEnter={() => setIsProofPaused(true)}
          onMouseLeave={() => setIsProofPaused(false)}
          onFocus={() => setIsProofPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsProofPaused(false);
          }}
        >
          <div className="qa-proofboard-head">
            <span><Sparkles size={12} /> Bài toán nổi bật</span>
            <span className="qa-proof-live"><i /> {currentProof.live} người đang giải</span>
          </div>

          <div className="qa-proof-viewport" aria-live="polite">
            <div
              className="qa-proof-track"
              style={{ transform: `translate3d(-${activeProof * 100}%, 0, 0)` }}
            >
              {PROOF_SLIDES.map((proof, proofIndex) => (
                <article
                  className="qa-proof-slide"
                  key={proof.index}
                  aria-hidden={proofIndex !== activeProof}
                >
                  <div className="qa-proof-equation">
                    <span className="qa-proof-index">No. {proof.index}</span>
                    <MathRenderer text={proof.equation} />
                    <p>{proof.description}</p>
                  </div>

                  <div className="qa-proof-path" aria-label="Ba bước giải bài">
                    {proof.steps.map((step, index) => (
                      <span className="qa-proof-step-group" key={step}>
                        <span><b>0{index + 1}</b> {step}</span>
                        {index < proof.steps.length - 1 && <i />}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <dl className="qa-metrics">
            <div className="qa-metric">
              <dt>Bài toán</dt>
              <dd className="q-num">{totalDiscussions}</dd>
            </div>
            <div className="qa-metric">
              <dt>Lời giải</dt>
              <dd className="q-num">{totalAnswers}</dd>
            </div>
            <div className="qa-metric is-accent">
              <dt><CheckCircle2 size={11} /> Đã giải</dt>
              <dd className="q-num">{solvedRate}%</dd>
              <span className="qa-metric-bar">
                <i style={{ width: `${Math.min(100, solvedRate)}%` }} />
              </span>
            </div>
            <div className="qa-metric">
              <dt>Đang chờ</dt>
              <dd className="q-num">{openCount}</dd>
            </div>
          </dl>

          <div className="qa-proof-pagination" aria-label="Chọn bảng chứng minh">
            <span className="qa-proof-counter">0{activeProof + 1} / 0{PROOF_SLIDES.length}</span>
            <div className="qa-proof-dots">
              {PROOF_SLIDES.map((proof, index) => (
                <button
                  key={proof.index}
                  type="button"
                  className={index === activeProof ? 'is-active' : ''}
                  aria-label={`Xem nội dung ${index + 1}`}
                  aria-current={index === activeProof ? 'true' : undefined}
                  onClick={() => setActiveProof(index)}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <button type="button" className="qa-askbar" onClick={onOpenCreate}>
        <span className="qa-askbar-icon"><PenLine size={17} /></span>
        <span className="qa-askbar-copy">
          <strong>Bạn đang mắc ở bước nào?</strong>
          <small>Dán đề bài, ảnh chụp hoặc công thức KaTeX — cộng đồng sẽ cùng bạn tháo gỡ.</small>
        </span>
        <span className="qa-askbar-cue">Soạn câu hỏi <ArrowRight size={15} /></span>
      </button>
    </header>
  );
}
