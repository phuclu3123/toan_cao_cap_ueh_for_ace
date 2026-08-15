import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  HelpCircle,
  BookOpen,
  Eye,
  Edit3,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileQuestion
} from 'lucide-react';
import MathToolbar from './MathToolbar';
import ImageUploader from './ImageUploader';
import CommunitySelect from './CommunitySelect';
import MathRenderer from '../MathRenderer';
import ConfirmDialog from '../ui/ConfirmDialog';
import { SUBJECT_CATEGORIES, DIFFICULTY_LEVELS, reviewCommunityPost } from '../../services/communityService';
import { safeLocalStorage } from '../../utils/safeStorage';
import '../../assets/styles/community.css';

const DRAFT_KEY = 'ueh_tcc_post_draft';

/**
 * CreatePostModal component supporting Split-View on desktop and Tabbed on mobile,
 * validation, image upload with alt text, KaTeX toolbar, and auto-save draft.
 */
export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  editingPost = null,
  currentUser = null,
  onRequireLogin,
  onOpenCheatsheet
}) {
  const [type, setType] = useState('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('algebra');
  const [difficulty, setDifficulty] = useState('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [altText, setAltText] = useState('');

  const [activeMobileTab, setActiveMobileTab] = useState('editor'); // 'editor' | 'preview'
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);

  const textareaRef = useRef(null);

  const publishReview = useMemo(
    () => reviewCommunityPost({ type, title, content }),
    [type, title, content]
  );

  const resetForm = () => {
    setType('question');
    setTitle('');
    setContent('');
    setSubject('algebra');
    setDifficulty('medium');
    setTagInput('');
    setTags(['#ToanCaoCap']);
    setImage(null);
    setAltText('');
    setHasDraftLoaded(false);
  };

  // Initialize or populate form
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
      return;
    }

    if (editingPost) {
      setType(editingPost.type || 'question');
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setSubject(editingPost.subject || 'algebra');
      setDifficulty(editingPost.difficulty || 'medium');
      setTags(editingPost.tags || []);
      setImage(editingPost.image || null);
      setAltText(editingPost.altText || '');
    } else {
      // Load draft if available
      try {
        const draftStr = safeLocalStorage.getItem(DRAFT_KEY);
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          setType(draft.type || 'question');
          setTitle(draft.title || '');
          setContent(draft.content || '');
          setSubject(draft.subject || 'algebra');
          setDifficulty(draft.difficulty || 'medium');
          setTags(draft.tags || []);
          setImage(draft.image || null);
          setAltText(draft.altText || '');
          setHasDraftLoaded(true);
        } else {
          resetForm();
        }
      } catch {
        resetForm();
      }
    }
  }, [isOpen, editingPost]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-save draft
  useEffect(() => {
    if (!isOpen || editingPost) return;

    if (title.trim() || content.trim()) {
      const draft = { type, title, content, subject, difficulty, tags, image, altText };
      safeLocalStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [isOpen, editingPost, type, title, content, subject, difficulty, tags, image, altText]);

  const handleClearDraft = () => {
    safeLocalStorage.removeItem(DRAFT_KEY);
    resetForm();
  };

  const handleInsertMath = (latex) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + ` $${latex}$ `);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = content.substring(0, start);
    const textAfter = content.substring(end);
    const insertion = ` $${latex}$ `;

    setContent(textBefore + insertion + textAfter);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(`#${val}`) && tags.length < 5) {
        setTags([...tags, `#${val}`]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const validate = () => {
    const errs = {};
    if (!title.trim() || title.trim().length < 8) {
      errs.title = 'Tiêu đề cần có độ dài tối thiểu 8 ký tự.';
    }
    if (!content.trim() || content.trim().length < 20) {
      errs.content = 'Nội dung bài viết / bài toán cần tối thiểu 20 ký tự để người đọc hiểu rõ.';
    }
    if (!subject) {
      errs.subject = 'Vui lòng chọn môn học tương ứng.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser && onRequireLogin) {
      onRequireLogin();
      return;
    }

    if (!validate()) return;
    if (type === 'question' && !publishReview.passes) {
      setErrors({ submit: publishReview.violations[0] });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        title: title.trim(),
        content: content.trim(),
        subject,
        difficulty,
        tags,
        image,
        altText
      });

      // Clear draft on success
      safeLocalStorage.removeItem(DRAFT_KEY);
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Không thể đăng bài viết lúc này.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttemptClose = () => {
    const hasChanges = title.trim() || content.trim();
    if (hasChanges && !editingPost) {
      setShowLeaveConfirm(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="modal-backdrop-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleAttemptClose();
        }}
      >
        <div className="create-post-modal-card glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="create-modal-header">
            <div className="header-badge-title">
              <span className="create-modal-mark"><FileQuestion size={20} /></span>
              <div>
                <span className="q-eyebrow">UEH Knowledge Desk</span>
                <h2 id="create-post-modal-title" className="create-modal-title">
                  {editingPost ? 'Chỉnh sửa bài viết' : 'Soạn câu hỏi học thuật'}
                </h2>
                <p className="create-modal-subtitle">Trình bày vấn đề rõ ràng, thêm công thức hoặc ảnh đề bài khi cần.</p>
              </div>
              {hasDraftLoaded && !editingPost && (
                <span className="draft-badge-indicator" title="Bản nháp đã được tự động lưu">
                  Bản nháp đã lưu
                </span>
              )}
            </div>

            <button
              type="button"
              className="modal-close-btn"
              onClick={handleAttemptClose}
              aria-label="Đóng modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="create-post-form">
            {/* 1. Type Switcher */}
            <div className="post-type-switcher">
              <button
                type="button"
                className={`type-switch-btn ${type === 'question' ? 'active' : ''}`}
                onClick={() => setType('question')}
              >
                <HelpCircle size={16} />
                <span>Đặt câu hỏi / Bài toán khó</span>
              </button>

              <button
                type="button"
                className={`type-switch-btn ${type === 'article' ? 'active' : ''}`}
                onClick={() => setType('article')}
              >
                <BookOpen size={16} />
                <span>Chia sẻ bài viết / Kinh nghiệm học</span>
              </button>
            </div>

            {/* 2. Title Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="post-title-input">
                Tiêu đề bài viết: <span className="text-danger">*</span>
              </label>
              <input
                id="post-title-input"
                type="text"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder={
                  type === 'question'
                    ? 'VD: Tìm cực trị hàm 2 biến bằng phương pháp Lagrange trong đề thi giữa kỳ?'
                    : 'VD: Tổng hợp công thức tính định thức ma trận cấp n và mẹo bấm máy Casio 580...'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <span className="form-error-msg">{errors.title}</span>}
            </div>

            {/* 3. Category & Difficulty Selector Row */}
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="post-subject-select">
                  Chuyên môn môn học: <span className="text-danger">*</span>
                </label>
                <CommunitySelect
                  id="post-subject-select"
                  value={subject}
                  options={SUBJECT_CATEGORIES.filter((s) => s.id !== 'all').map((s) => ({
                    value: s.id,
                    label: s.label
                  }))}
                  onChange={setSubject}
                  ariaLabel="Chọn chuyên môn môn học"
                  className="create-post-select"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-diff-select">
                  Mức độ khó: <span className="text-danger">*</span>
                </label>
                <CommunitySelect
                  id="post-diff-select"
                  value={difficulty}
                  options={DIFFICULTY_LEVELS.map((d) => ({ value: d.id, label: d.label }))}
                  onChange={setDifficulty}
                  ariaLabel="Chọn mức độ khó"
                  className="create-post-select"
                />
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="mobile-editor-tabs">
              <button
                type="button"
                className={`mobile-tab-btn ${activeMobileTab === 'editor' ? 'active' : ''}`}
                onClick={() => setActiveMobileTab('editor')}
              >
                <Edit3 size={15} /> Soạn thảo
              </button>
              <button
                type="button"
                className={`mobile-tab-btn ${activeMobileTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveMobileTab('preview')}
              >
                <Eye size={15} /> Xem trước KaTeX
              </button>
            </div>

            {/* 4. Split-View Content Area */}
            <div className="split-view-container">
              {/* Left: Editor Pane */}
              <div className={`editor-pane ${activeMobileTab === 'preview' ? 'mobile-hidden' : ''}`}>
                <MathToolbar onInsert={handleInsertMath} onOpenCheatsheet={onOpenCheatsheet} />

                <textarea
                  ref={textareaRef}
                  className={`form-input form-textarea post-editor-textarea ${errors.content ? 'input-error' : ''}`}
                  rows={8}
                  placeholder={`Nhập nội dung câu hỏi hoặc đề bài chi tiết...\n\nVí dụ chèn công thức KaTeX:\n- Công thức cùng dòng: $f(x) = x^2 + 2x + 1$\n- Công thức căn giữa: $$\\int_{0}^{1} x e^x dx$$`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                {errors.content && <span className="form-error-msg">{errors.content}</span>}
              </div>

              {/* Right: KaTeX Live Preview Pane */}
              <div className={`preview-pane ${activeMobileTab === 'editor' ? 'mobile-hidden' : ''}`}>
                <div className="preview-pane-header">
                  <Eye size={14} />
                  <span>Bản xem trước trực quan (KaTeX Live)</span>
                </div>
                <div className="preview-content-box">
                  {content.trim() ? (
                    <MathRenderer text={content} />
                  ) : (
                    <span className="preview-placeholder">
                      Công thức Toán học và định dạng Markdown sẽ được render trực tiếp tại đây khi bạn gõ...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Image Uploader */}
            <div className="form-group">
              <label className="form-label">Ảnh đính kèm đề bài (Tùy chọn):</label>
              <ImageUploader
                images={image ? [{
                  id: 'post-attachment',
                  url: typeof image === 'string' ? image : image.url,
                  preview: typeof image === 'string' ? image : (image.preview || image.url),
                  altText: altText || image.altText || ''
                }] : []}
                maxImages={1}
                onChange={(nextImages) => {
                  const nextImage = nextImages[0];
                  setImage(nextImage?.preview || nextImage?.url || null);
                  setAltText(nextImage?.altText || '');
                }}
              />
            </div>

            {/* 6. Tags Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="post-tags-input">
                Hashtags liên quan (Tối đa 5 thẻ):
              </label>
              <div className="tags-input-container">
                <div className="tags-chips-list">
                  {tags.map((t, idx) => (
                    <span key={idx} className="tag-chip">
                      {t}
                      <button type="button" onClick={() => handleRemoveTag(t)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {tags.length < 5 && (
                  <input
                    id="post-tags-input"
                    type="text"
                    className="tag-text-input"
                    placeholder="Gõ tag rồi bấm Enter (VD: Lagrange, TichPhan)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                )}
              </div>
            </div>

            {type === 'question' && (
              <div className={`qa-preflight-panel ${publishReview.passes ? 'is-ready' : 'has-issues'}`}>
                <div className="qa-preflight-icon">
                  {publishReview.passes ? <ShieldCheck size={19} /> : <AlertCircle size={19} />}
                </div>
                <div className="qa-preflight-copy">
                  <strong>{publishReview.passes ? 'Sẵn sàng để đăng' : 'Kiểm tra câu hỏi trước khi đăng'}</strong>
                  <span>
                    {publishReview.passes
                      ? 'Không phát hiện spam, mã nguy hiểm hoặc ngôn từ công kích.'
                      : publishReview.violations[0]}
                  </span>
                </div>
                <div className="qa-preflight-checks" aria-label="Các tiêu chí kiểm tra">
                  <span className={publishReview.checks.clarity ? 'ok' : ''}><CheckCircle2 size={12} /> Rõ đề</span>
                  <span className={publishReview.checks.noSpam ? 'ok' : ''}><CheckCircle2 size={12} /> Không spam</span>
                  <span className={publishReview.checks.respectful ? 'ok' : ''}><CheckCircle2 size={12} /> Tôn trọng</span>
                </div>
              </div>
            )}

            <p className="qa-publish-policy">
              Chỉ câu hỏi được kiểm tra trước khi đăng. Lời giải và bình luận được hiển thị ngay;
              nội dung vi phạm có thể bị cộng đồng báo cáo và quản trị viên xử lý sau.
            </p>

            {/* General submit errors */}
            {errors.submit && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="create-modal-footer">
              <div className="footer-left-actions">
                {!editingPost && hasDraftLoaded && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearDraft}
                    title="Xóa bản nháp hiện tại"
                  >
                    <RotateCcw size={14} /> Xóa nháp
                  </button>
                )}
              </div>

              <div className="footer-right-actions">
                <button type="button" className="btn btn-secondary" onClick={handleAttemptClose}>
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Đang xử lý...'
                  ) : editingPost ? (
                    'Cập nhật bài viết'
                  ) : (
                    'Đăng bài ngay (+5 pts)'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Leave confirmation dialog */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onClose();
        }}
        title="Rời khỏi trang soạn thảo?"
        message="Nội dung bài viết của bạn đã được tự động lưu nháp. Bạn có chắc muốn đóng modal này không?"
        confirmLabel="Đóng modal"
        cancelLabel="Tiếp tục viết"
        variant="primary"
      />
    </>,
    document.body
  );
}
