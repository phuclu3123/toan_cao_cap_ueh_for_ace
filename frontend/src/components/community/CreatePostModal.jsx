import { useState, useEffect, useMemo } from 'react';
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
import WYSIWYGMathEditor from './WYSIWYGMathEditor';
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
  const [tags, setTags] = useState(['#ToanCaoCap']);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState([]);
  const [image, setImage] = useState(null);
  const [altText, setAltText] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('editor');
  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
      let finalContent = content.trim();
      if (images && images.length > 0) {
        const uninserted = images.filter((img) => !finalContent.includes(img.preview || img.url));
        if (uninserted.length > 0) {
          finalContent += uninserted
            .map(
              (img) =>
                `<p><img src="${img.preview || img.url}" alt="${img.altText || 'Ảnh đề bài'}" class="wysiwyg-math-inline-img" style="max-width: 100%; max-height: 480px; height: auto; border-radius: 10px; margin: 12px 0; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.07); display: block;" /></p>`
            )
            .join('');
        }
      }

      await onSubmit({
        type,
        title: title.trim(),
        content: finalContent,
        subject,
        difficulty,
        tags,
        image: images[0]?.preview || images[0]?.url || image || null,
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
          <form id="create-post-form-element" onSubmit={handleSubmit} className="create-post-form">
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

            {/* 4. Full-Width Editor with Preview Tab Toggle */}
            <div className="create-editor-section">
              <div className="create-editor-tabs-bar">
                <button
                  type="button"
                  className={`create-tab-btn ${activeMobileTab === 'editor' ? 'active' : ''}`}
                  onClick={() => setActiveMobileTab('editor')}
                >
                  <Edit3 size={15} />
                  <span>Soạn thảo nội dung</span>
                </button>

                <button
                  type="button"
                  className={`create-tab-btn ${activeMobileTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveMobileTab('preview')}
                >
                  <Eye size={15} />
                  <span>Xem trước KaTeX ({content.trim() ? 'Sẵn sàng' : 'Chưa có nội dung'})</span>
                </button>
              </div>

              {activeMobileTab === 'editor' ? (
                <div className="create-editor-pane">
                  <WYSIWYGMathEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Nhập nội dung câu hỏi hoặc đề bài chi tiết (hỗ trợ in đậm B, nghiêng I, gạch chân U, màu sắc, chèn công thức KaTeX trực quan như Google Docs)..."
                    onOpenCheatsheet={onOpenCheatsheet}
                    minHeight="220px"
                    showLivePreview={false}
                  />
                  {errors.content && <span className="form-error-msg">{errors.content}</span>}
                </div>
              ) : (
                <div className="create-preview-full-card">
                  <div className="preview-pane-header">
                    <Eye size={14} />
                    <span>Bản xem trước trực quan (KaTeX Live Preview)</span>
                  </div>
                  <div className="preview-content-box full-preview">
                    {content.trim() ? (
                      <MathRenderer text={content} />
                    ) : (
                      <span className="preview-placeholder">
                        Chưa có nội dung. Hãy chuyển qua tab "Soạn thảo nội dung" để nhập đề bài và công thức toán!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Image Uploader */}
            <div className="form-group">
              <label className="form-label">Ảnh đính kèm đề bài / sơ đồ (Tối đa 8 ảnh, hoặc dán <b>Ctrl+V</b>):</label>
              <ImageUploader
                images={images}
                maxImages={8}
                onChange={(nextImages) => {
                  setImages(nextImages);
                  setImage(nextImages[0]?.preview || nextImages[0]?.url || null);
                  setAltText(nextImages[0]?.altText || '');
                }}
                onInsertToEditor={(imgSrc, imgAlt) => {
                  const imgTag = `<p><img src="${imgSrc}" alt="${imgAlt || 'Ảnh đề bài'}" class="wysiwyg-math-inline-img" style="max-width: 100%; max-height: 480px; height: auto; border-radius: 10px; margin: 12px 0; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.07); display: block;" /></p><p><br></p>`;
                  setContent((prev) => (prev ? `${prev}${imgTag}` : imgTag));
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
          </form>

          {/* Sticky Footer Buttons - Always Visible */}
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
                form="create-post-form-element"
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
