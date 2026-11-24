import { useEffect, useState } from 'react';
import {
  BookOpen,
  FileText,
  ImagePlus,
  Send,
  LogIn,
  X
} from 'lucide-react';
import WYSIWYGMathEditor from './WYSIWYGMathEditor';
import ImageUploader from './ImageUploader';
import MathRenderer from '../MathRenderer';
import { safeSessionStorage } from '../../utils/safeStorage';
import '../../assets/styles/community.css';

/**
 * AnswerComposer: Mathematics Stack Exchange "Your Answer" composer
 * Powered by 100% Word/Google Docs style WYSIWYG editor with live math and colors.
 */
export default function AnswerComposer({
  onSubmit,
  currentUser = null,
  onRequireLogin,
  onOpenCheatsheet,
  quoteText = '',
  onClearQuote,
  postId
}) {
  const guestDraftKey = `ueh_tcc_answer_draft:guest:${postId}`;
  const draftKey = currentUser ? `ueh_tcc_answer_draft:${currentUser.id || currentUser.uid}:${postId}` : guestDraftKey;
  const [content, setContentState] = useState(() => safeSessionStorage.getItem(draftKey) || (currentUser ? safeSessionStorage.getItem(guestDraftKey) : '') || '');
  const [pendingGuestDraft, setPendingGuestDraft] = useState(() => {
    const guest = currentUser && safeSessionStorage.getItem(guestDraftKey);
    const own = currentUser && safeSessionStorage.getItem(draftKey);
    return guest && own && guest !== own ? guest : '';
  });
  useEffect(() => {
    if (!currentUser || !safeSessionStorage.getItem(guestDraftKey)) return;
    if (!safeSessionStorage.getItem(draftKey) && content) safeSessionStorage.setItem(draftKey, content);
    safeSessionStorage.removeItem(guestDraftKey);
  }, [currentUser, guestDraftKey, draftKey, content]);
  const setContent = next => {
    const value = typeof next === 'function' ? next(content) : next;
    setContentState(value);
    if (draftKey) {
      if (value) safeSessionStorage.setItem(draftKey, value);
      else safeSessionStorage.removeItem(draftKey);
    }
  };
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showImages, setShowImages] = useState(false);

  const handleApply3StepTemplate = () => {
    const template = `<div><b>Bước 1: Thiết lập phương trình / Giả thiết</b></div>` +
      `<div>$$\\mathcal{L}(x,y,\\lambda)=f(x,y)+\\lambda[b-g(x,y)]$$</div><br>` +
      `<div><b>Bước 2: Biến đổi và giải hệ điều kiện dừng</b></div>` +
      `<div>Trình bày chi tiết các bước tính đạo hàm riêng và định thức tại đây...</div><br>` +
      `<div><b>Bước 3: Kết luận nghiệm tối ưu</b></div>` +
      `<div>Điểm tối ưu là $(x^*, y^*) = \\dots$</div>`;
    setContent((prev) => prev ? `${prev}<br><br>${template}` : template);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    if (!cleanContent && !content.includes('$') && !content.includes('<img') && images.length === 0) {
      setError('Hãy nhập nội dung lời giải hoặc đính kèm ảnh bài giải.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        content: (quoteText ? `<blockquote>${quoteText}</blockquote>` : '') + (content.trim() || (images.length ? '<p>Lời giải đính kèm.</p>' : '')),
        image: images[0]?.preview || images[0]?.url || null,
        altText: images[0]?.altText || ''
      });
      setContent('');
      setImages([]);
      setShowImages(false);
      onClearQuote?.();
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi câu trả lời. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="se-your-answer-card">
      <div className="se-your-answer-header">
        <div><h3 className="se-your-answer-title">Viết lời giải</h3><p className="qa-answer-composer-hint">Chia sẻ cách làm, cùng nhau hiểu sâu hơn.</p></div>
        <div className="se-composer-helper-links">
          <button
            type="button"
            className="se-helper-link-btn"
            onClick={onOpenCheatsheet}
          >
            <BookOpen size={14} />
            <span>Sổ tay công thức</span>
          </button>
          <button
            type="button"
            className="se-helper-link-btn"
            onClick={handleApply3StepTemplate}
          >
            <FileText size={14} />
            <span>Mẫu 3 bước giải</span>
          </button>
        </div>
      </div>

      {quoteText && (
        <div className="se-quote-preview-box">
          <div className="se-quote-content">
            <span className="se-quote-label">Đang trích dẫn:</span>
            <div className="se-quote-rendered-body">
              <MathRenderer text={quoteText} />
            </div>
          </div>
          <button
            type="button"
            className="se-quote-clear-btn"
            onClick={onClearQuote}
            aria-label="Xóa trích dẫn"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* WYSIWYG Word/Docs Rich Editor */}
      <form onSubmit={handleFormSubmit} className="se-composer-form">
        {pendingGuestDraft && <div className="qa-answer-draft-choice"><span>Đang mở bản nháp tài khoản. Bạn còn một bản soạn trước đăng nhập.</span><button type="button" onClick={() => { setContent(pendingGuestDraft); setPendingGuestDraft(''); }}>Dùng bản vừa soạn</button><button type="button" aria-label="Bỏ qua bản nháp trước đăng nhập" onClick={() => setPendingGuestDraft('')}><X size={14} /></button></div>}
        <WYSIWYGMathEditor
          value={content}
          onChange={setContent}
          onAttachImage={image => { setImages([image]); setShowImages(true); }}
          placeholder="Trình bày cách giải của bạn… Có thể dùng công thức hoặc dán ảnh trực tiếp."
          onOpenCheatsheet={onOpenCheatsheet}
          minHeight="220px"
          streamlined
        />

        {error && <div className="se-composer-error-msg">{error}</div>}

        {/* Image upload toggle */}
        {showImages && (
          <div className="se-image-uploader-section">
            <ImageUploader
              images={images}
              onChange={setImages}
              onImagesChange={setImages}
              maxImages={1}
              maxFileBytes={1024 * 1024}
              allowFiles
              allowPaste
            />
          </div>
        )}

        {/* Guest Auth prompt if not logged in */}
        {!currentUser && (
          <div className="se-composer-auth-prompt">
            <LogIn size={15} />
            <span>Bạn có thể soạn trước, đăng nhập để gửi lời giải.</span>
          </div>
        )}

        {/* Actions bar */}
        <div className="se-composer-bottom-bar">
          <button
            type="submit"
            className="se-post-answer-btn"
            disabled={isSubmitting}
          >
            {currentUser ? <Send size={15} /> : <LogIn size={15} />}
            <span>{isSubmitting ? 'Đang gửi...' : currentUser ? 'Gửi lời giải' : 'Đăng nhập để gửi'}</span>
          </button>

          <button
            type="button"
            className="se-attach-image-btn"
            onClick={() => setShowImages(!showImages)}
          >
            <ImagePlus size={15} />
            <span>{showImages ? 'Ẩn ảnh đính kèm' : 'Đính kèm ảnh'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
