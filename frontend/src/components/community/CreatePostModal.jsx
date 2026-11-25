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
  FileQuestion
} from 'lucide-react';
import WYSIWYGMathEditor from './WYSIWYGMathEditor';
import ImageUploader from './ImageUploader';
import CommunitySelect from './CommunitySelect';
import MathRenderer from '../MathRenderer';
import ConfirmDialog from '../ui/ConfirmDialog';
import { SUBJECT_CATEGORIES, DIFFICULTY_LEVELS, reviewCommunityPost } from '../../services/communityService';
import { safeLocalStorage } from '../../utils/safeStorage';
import useModalFocus from '../../hooks/useModalFocus';
import '../../assets/styles/community.css';


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
  const draftKey = `ueh_tcc_post_draft:${currentUser?.id || currentUser?.uid || 'guest'}`;
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
    setImages([]);
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
      setImages(editingPost.image ? [{
        id: `existing-${editingPost.id || 'post'}`,
        url: editingPost.image,
        preview: editingPost.image,
        altText: editingPost.altText || 'Ảnh đề bài'
      }] : []);
    } else {
      // Load draft if available
      try {
        const draftStr = safeLocalStorage.getItem(draftKey);
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
          setImages(draft.image ? [{
            id: 'draft-image',
            url: draft.image,
            preview: draft.image,
            altText: draft.altText || 'Ảnh đề bài'
          }] : []);
          setHasDraftLoaded(true);
        } else {
          resetForm();
        }
      } catch {
        resetForm();
      }
    }
  }, [isOpen, editingPost, draftKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-save draft
  useEffect(() => {
    if (!isOpen || editingPost) return;

    if (title.trim() || content.trim()) {
      const draft = { type, title, content, subject, difficulty, tags, image, altText };
      safeLocalStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [isOpen, editingPost, type, title, content, subject, difficulty, tags, image, altText, draftKey]);

  const handleClearDraft = () => {
    safeLocalStorage.removeItem(draftKey);
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
      await onSubmit({
        type,
        title: title.trim(),
        content: content.trim(),
        subject,
        difficulty,
        tags,
        image: images[0]?.preview || images[0]?.url || image || null,
        altText
      });

      // Clear draft on success
      safeLocalStorage.removeItem(draftKey);
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Không thể đăng bài viết lúc này.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttemptClose = () => {
    if (isSubmitting) return;
    const hasChanges = title.trim() || content.trim();
    if (hasChanges && !editingPost) {
      setShowLeaveConfirm(true);
    } else {
      onClose();
    }
  };

  const modalRef = useModalFocus(isOpen, handleAttemptClose);

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
        <div ref={modalRef} tabIndex={-1} className="create-post-modal-card question-composer glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="create-modal-header">
            <div className="header-badge-title">
              <span className="create-modal-mark"><FileQuestion size={20} /></span>
              <div>
                <span className="q-eyebrow">α∫M4A</span>
                <h2 id="create-post-modal-title" className="create-modal-title">
                  {editingPost ? 'Chỉnh sửa bài viết' : type === 'question' ? 'Câu hỏi của bạn.' : 'Chia sẻ của bạn.'}
                </h2>
                <p className="create-modal-subtitle">Một đề bài rõ ràng, thêm nhiều góc nhìn.</p>
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
                <span>Đặt câu hỏi</span>
              </button>

              <button
                type="button"
                className={`type-switch-btn ${type === 'article' ? 'active' : ''}`}
                onClick={() => setType('article')}
              >
                <BookOpen size={16} />
                <span>Chia sẻ kinh nghiệm</span>
              </button>
            </div>

            <div className="question-sheet">
                {/* 2. Title Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="post-title-input">
                    Bạn muốn hỏi điều gì? <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="post-title-input"
                    rows={2}
                    className={`form-input ${errors.title ? 'input-error' : ''}`}
                    placeholder={
                      type === 'question'
                        ? 'Ví dụ: Mình nên bắt đầu bài cực trị Lagrange này từ đâu?'
                        : 'VD: Tổng hợp công thức tính định thức ma trận cấp n và mẹo bấm máy Casio 580...'
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <span className="form-error-msg">{errors.title}</span>}
                </div>

              <div className="question-metadata" aria-label="Thông tin bài viết">
                {/* Subject and difficulty */}
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="post-subject-select">
                      Chủ đề <span className="text-danger">*</span>
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
                      Mức độ <span className="text-danger">*</span>
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

              </div>
                {/* Writing and preview */}
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
                      <span>Xem trước</span>
                    </button>
                    <button type="button" className="composer-notebook" onClick={onOpenCheatsheet}><BookOpen size={15} /> Sổ tay của Phúc</button>
                  </div>

                  {activeMobileTab === 'editor' ? (
                    <div className="create-editor-pane">
                      <WYSIWYGMathEditor
                        value={content}
                        onChange={setContent}
                        onAttachImage={item => { setImages([item]); setImage(item.preview); setAltText(item.altText); }}
                        placeholder="Viết câu hỏi hoặc đề bài của bạn. Có thể thêm công thức và hình minh họa."
                        onOpenCheatsheet={onOpenCheatsheet}
                        minHeight="240px"
                        streamlined
                        showLivePreview={false}
                      />
                      {errors.content && <span className="form-error-msg">{errors.content}</span>}
                    </div>
                  ) : (
                    <div className="create-preview-full-card">
                      <div className="preview-pane-header">
                        <Eye size={14} />
                        <span>Xem trước bài viết</span>
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

              <details className="question-extras" open={images.length || tags.length ? true : undefined}>
                <summary><span><BookOpen size={16} /> Ảnh đề bài &amp; hashtag</span><span>Tùy chọn</span></summary>
                <div className="question-extras-content">
                {/* 5. Image Uploader */}
                <div className="form-group">
                  <label className="form-label">Ảnh đính kèm đề bài / sơ đồ (1 ảnh, tối đa 1MB; có thể dán <b>Ctrl+V</b>):</label>
                  <ImageUploader
                    images={images}
                    maxImages={1}
                    maxFileBytes={1024 * 1024}
                    onChange={(nextImages) => {
                      setImages(nextImages);
                      setImage(nextImages[0]?.preview || nextImages[0]?.url || null);
                      setAltText(nextImages[0]?.altText || '');
                    }}
                  />
                </div>

                {/* 6. Tags Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="post-tags-input">
                    Hashtag · tối đa 5 thẻ
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

                </div>
              </details>
            </div>
            {type === 'question' && (title.trim() || content.trim()) && <div className={`question-readiness ${publishReview.passes ? 'is-ready' : ''}`} role="status">
              {publishReview.passes ? <CheckCircle2 size={15} /> : <HelpCircle size={15} />}
              <span>{publishReview.passes ? 'Đề bài đã sẵn sàng để chia sẻ.' : publishReview.violations[0]}</span>
            </div>}
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
                  type === 'question' ? 'Đăng câu hỏi' : 'Chia sẻ bài viết'
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
