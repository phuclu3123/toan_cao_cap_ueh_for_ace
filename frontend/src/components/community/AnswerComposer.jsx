import { useRef, useState } from 'react';
import {
  Bot,
  Calculator,
  CheckCircle2,
  Eye,
  FileText,
  ImagePlus,
  LogIn,
  MessageSquareText,
  Send,
  ShieldCheck
} from 'lucide-react';
import MathToolbar from './MathToolbar';
import ImageUploader from './ImageUploader';
import MathRenderer from '../MathRenderer';
import '../../assets/styles/community.css';

export default function AnswerComposer({
  onSubmit,
  currentUser = null,
  onRequireLogin,
  onOpenCheatsheet,
  quoteText = '',
  onClearQuote
}) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showMathTools, setShowMathTools] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  const handleInsertLaTeX = (latexSnippet) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const wrappedSnippet = `$${latexSnippet}$`;
    setContent(content.substring(0, start) + wrappedSnippet + content.substring(end));
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + wrappedSnippet.length, start + wrappedSnippet.length);
    }, 10);
  };

  const handlePasteAIFormat = () => {
    navigator.clipboard?.readText().then((clipText) => {
      if (!clipText) return;
      const normalized = clipText
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
      setContent((previous) => previous ? `${previous}\n\n${normalized}` : normalized);
    }).catch(() => setError('Không thể đọc clipboard. Bạn có thể dán trực tiếp vào ô soạn thảo.'));
  };

  const handleApply3StepTemplate = () => {
    const template = `### Phân tích bài toán

**Bước 1: Thiết lập giả thiết**
$$\\mathcal{L}(x,y,\\lambda)=f(x,y)+\\lambda[b-g(x,y)]$$

**Bước 2: Biến đổi và giải**
Trình bày các bước tính toán tại đây.

**Bước 3: Kết luận**
Nghiệm của bài toán là $\\dots$`;
    setContent((previous) => previous ? `${previous}\n\n${template}` : template);
    textareaRef.current?.focus();
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (!content.trim() && images.length === 0) {
      setError('Hãy nhập phản hồi hoặc đính kèm ảnh bài giải.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      let finalContent = content.trim();
      if (images.length) {
        finalContent += images
          .map((image) => `\n\n![${image.altText || 'Ảnh bài giải'}](${image.preview || image.url})`)
          .join('');
      }
      await onSubmit(finalContent);
      setContent('');
      setImages([]);
      setShowImages(false);
      setShowPreview(false);
      onClearQuote?.();
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="answer-composer-section" className="answer-composer-card qa-response-desk">
      <header className="composer-header">
        <div className="composer-title-box">
          <span className="composer-icon-badge"><MessageSquareText size={18} /></span>
          <div>
            <span className="q-eyebrow">Open discussion</span>
            <h3 className="composer-title">Viết lời giải hoặc bình luận</h3>
            <p className="composer-subtitle">Phản hồi được đăng ngay — không cần tác giả duyệt trước.</p>
          </div>
        </div>
        <span className="qa-open-publish"><ShieldCheck size={13} /> Báo cáo sau đăng</span>
      </header>

      {quoteText && (
        <div className="active-quote-pill">
          <span>Trích dẫn: &ldquo;{quoteText.slice(0, 100)}...&rdquo;</span>
          <button type="button" onClick={onClearQuote} title="Bỏ trích dẫn">×</button>
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        {showMathTools && (
          <MathToolbar onInsert={handleInsertLaTeX} onOpenCheatsheet={onOpenCheatsheet} />
        )}

        <div className="composer-editor-wrap">
          <textarea
            ref={textareaRef}
            className="composer-textarea enterprise-textarea"
            rows={5}
            placeholder="Chia sẻ cách làm, góp ý hoặc đặt câu hỏi thêm… Dùng $công thức$ khi cần viết KaTeX."
            value={content}
            onFocus={() => setError('')}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="qa-composer-commandbar">
            <div className="qa-composer-tools">
              <button type="button" className={showMathTools ? 'is-active' : ''} onClick={() => setShowMathTools(!showMathTools)}>
                <Calculator size={14} /> Công thức
              </button>
              <button type="button" className={showImages ? 'is-active' : ''} onClick={() => setShowImages(!showImages)}>
                <ImagePlus size={14} /> Ảnh
              </button>
              <button type="button" className={showPreview ? 'is-active' : ''} onClick={() => setShowPreview(!showPreview)}>
                <Eye size={14} /> Xem trước
              </button>
              <button type="button" onClick={handlePasteAIFormat} title="Chuẩn hóa Markdown từ AI">
                <Bot size={14} /> Dán AI
              </button>
              <button type="button" onClick={handleApply3StepTemplate} title="Chèn mẫu lời giải">
                <FileText size={14} /> Mẫu 3 bước
              </button>
            </div>

            {currentUser ? (
              <button type="submit" className="qa-send-response" disabled={isSubmitting}>
                <Send size={15} /> {isSubmitting ? 'Đang gửi…' : 'Đăng phản hồi'}
              </button>
            ) : (
              <button type="button" className="qa-send-response" onClick={onRequireLogin}>
                <LogIn size={15} /> Đăng nhập để gửi
              </button>
            )}
          </div>
        </div>

        {showImages && (
          <div className="composer-image-section qa-composer-expandable">
            <div className="section-label-row">
              <span>Đính kèm ảnh bài giải</span>
              <span className="section-hint">Tối đa 3 ảnh</span>
            </div>
            <ImageUploader images={images} onChange={setImages} maxImages={3} />
          </div>
        )}

        {showPreview && (
          <div className="composer-live-preview-section qa-composer-expandable">
            <div className="live-preview-header">
              <span className="live-preview-title"><Eye size={14} /> Bản xem trước</span>
              <span className="live-status-pill"><CheckCircle2 size={12} /> KaTeX trực tiếp</span>
            </div>
            <div className="composer-live-preview-body">
              {content.trim() ? <MathRenderer text={content} /> : <span className="live-preview-placeholder">Nội dung xem trước sẽ xuất hiện tại đây.</span>}
            </div>
          </div>
        )}

        {error && <div className="composer-error-msg qa-composer-error">{error}</div>}

        <footer className="composer-footer enterprise-footer qa-response-policy">
          <span><ShieldCheck size={13} /> Bình luận hiển thị ngay. Hãy trao đổi chuyên nghiệp và tôn trọng người khác.</span>
          <strong>+10 điểm cho lời giải hữu ích</strong>
        </footer>
      </form>
    </section>
  );
}
