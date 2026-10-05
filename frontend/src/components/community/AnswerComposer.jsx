import { useState } from 'react';
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
  onClearQuote
}) {
  const [content, setContent] = useState('');
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

  const handleInsertImageToEditor = (imgSrc, altText = 'Ảnh bài giải') => {
    const imgTag = `<p><img src="${imgSrc}" alt="${altText}" class="wysiwyg-math-inline-img" style="max-width: 100%; max-height: 480px; height: auto; border-radius: 10px; margin: 12px 0; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.07); display: block;" /></p><p><br></p>`;
    setContent((prev) => (prev ? `${prev}${imgTag}` : imgTag));
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
      let finalContent = content.trim();
      // If there are attached images that haven't been inserted inline yet, append them
      if (images.length) {
        const uninsertedImages = images.filter(
          (img) => !finalContent.includes(img.preview || img.url)
        );
        if (uninsertedImages.length) {
          finalContent += uninsertedImages
            .map(
              (image) =>
                `<p><img src="${image.preview || image.url}" alt="${image.altText || 'Ảnh bài giải'}" class="wysiwyg-math-inline-img" style="max-width: 100%; max-height: 480px; height: auto; border-radius: 10px; margin: 12px 0; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.07); display: block;" /></p>`
            )
            .join('');
        }
      }
      await onSubmit(finalContent);
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
        <h3 className="se-your-answer-title">Câu trả lời của bạn</h3>
        <div className="se-composer-helper-links">
          <button
            type="button"
            className="se-helper-link-btn"
            onClick={onOpenCheatsheet}
          >
            <BookOpen size={14} />
            <span>Sổ tay công thức của Phúc</span>
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
        <WYSIWYGMathEditor
          value={content}
          onChange={setContent}
          placeholder="Nhập lời giải hoặc phân tích bài toán (soạn thảo in đậm B, nghiêng I, gạch chân U, đổi màu sắc, chèn KaTeX, chèn ảnh bài giải hoặc bấm Ctrl+V để dán trực tiếp)..."
          onOpenCheatsheet={onOpenCheatsheet}
          minHeight="220px"
        />

        {error && <div className="se-composer-error-msg">{error}</div>}

        {/* Image upload toggle */}
        {showImages && (
          <div className="se-image-uploader-section">
            <ImageUploader
              images={images}
              onChange={setImages}
              onImagesChange={setImages}
              onInsertToEditor={handleInsertImageToEditor}
              maxImages={8}
            />
          </div>
        )}

        {/* Guest Auth prompt if not logged in */}
        {!currentUser && (
          <div className="se-composer-auth-prompt">
            <LogIn size={15} />
            <span>Bạn cần đăng nhập tài khoản UEH để gửi câu trả lời bài toán.</span>
            <button
              type="button"
              className="se-composer-auth-link"
              onClick={onRequireLogin}
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Actions bar */}
        <div className="se-composer-bottom-bar">
          <button
            type="submit"
            className="se-post-answer-btn"
            disabled={isSubmitting}
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Đang gửi...' : 'Gửi câu trả lời'}</span>
          </button>

          <button
            type="button"
            className="se-attach-image-btn"
            onClick={() => setShowImages(!showImages)}
          >
            <ImagePlus size={15} />
            <span>{showImages ? 'Ẩn đính kèm ảnh' : 'Đính kèm ảnh bài giải'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
