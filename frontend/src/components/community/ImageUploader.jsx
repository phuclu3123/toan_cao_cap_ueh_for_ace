import { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Trash2,
  Image as ImageIcon,
  Plus,
  AlertCircle,
  Check,
  CornerDownRight
} from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * ImageUploader component for handwritten problem snapshots, exam papers, or diagrams.
 * Supports File upload (drag & drop / file picker / Ctrl+V paste) and Image URL pasting.
 * Supports up to 8 geometry/diagram images with preview and inline insertion.
 */
export default function ImageUploader({
  images = [],
  onChange,
  onImagesChange,
  onInsertToEditor,
  maxImages = 8,
  className = ''
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const triggerChange = (nextImages) => {
    onChange?.(nextImages);
    onImagesChange?.(nextImages);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      setErrorMessage(`Bạn chỉ có thể đính kèm tối đa ${maxImages} hình ảnh.`);
      return;
    }

    setErrorMessage('');
    setIsUploading(true);
    setUploadProgress(20);

    const newImages = [];
    let processed = 0;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, JPEG, WEBP).');
        setIsUploading(false);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Kích thước ảnh tối đa là 10MB.');
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: uploadEvent.target.result,
          preview: uploadEvent.target.result,
          altText: file.name.replace(/\.[^/.]+$/, ''),
          file
        });

        processed += 1;
        setUploadProgress(Math.round((processed / files.length) * 100));

        if (processed === files.length) {
          triggerChange([...images, ...newImages]);
          setIsUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handlePasteInZone = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            const newImg = {
              id: `img-paste-${Date.now()}`,
              url: uploadEvent.target.result,
              preview: uploadEvent.target.result,
              altText: 'Ảnh dán từ clipboard'
            };
            triggerChange([...images, newImg]);
          };
          reader.readAsDataURL(file);
        }
        return;
      }
    }
  };

  const handleAddUrl = () => {
    if (!tempUrl.trim()) return;

    if (images.length >= maxImages) {
      setErrorMessage(`Bạn chỉ có thể đính kèm tối đa ${maxImages} hình ảnh.`);
      return;
    }

    try {
      new URL(tempUrl);
    } catch {
      setErrorMessage('Định dạng URL không hợp lệ.');
      return;
    }

    setErrorMessage('');
    const newImg = {
      id: `img-url-${Date.now()}`,
      url: tempUrl.trim(),
      preview: tempUrl.trim(),
      altText: 'Ảnh đính kèm'
    };

    triggerChange([...images, newImg]);
    setTempUrl('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (imgId) => {
    triggerChange(images.filter((img) => img.id !== imgId));
    setErrorMessage('');
  };

  return (
    <div
      className={`image-uploader-component ${className}`}
      onPaste={handlePasteInZone}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Upload Zone */}
      {images.length > 0 ? (
        <div className="images-preview-grid">
          {images.map((img, idx) => (
            <div key={img.id || idx} className="image-preview-card">
              <img
                src={img.preview || img.url}
                alt={img.altText || `Ảnh ${idx + 1}`}
                className="image-preview-thumb"
              />
              <div className="image-preview-overlay">
                {onInsertToEditor && (
                  <button
                    type="button"
                    className="image-insert-editor-btn"
                    onClick={() => onInsertToEditor(img.preview || img.url, img.altText)}
                    title="Chèn ảnh này vào vị trí con trỏ trong lời giải"
                  >
                    <CornerDownRight size={13} />
                    <span>Chèn</span>
                  </button>
                )}
                <button
                  type="button"
                  className="image-delete-btn"
                  onClick={() => handleRemoveImage(img.id)}
                  title="Xóa ảnh này"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {images.length < maxImages && (
            <label className="image-add-more-card" title="Thêm ảnh khác (Hoặc bấm Ctrl+V)">
              <Plus size={18} />
              <span>Thêm ảnh ({images.length}/{maxImages})</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      ) : (
        <div className="image-upload-empty">
          {isUploading ? (
            <div className="image-upload-progress-box">
              <div className="upload-progress-bar-wrap">
                <div className="upload-progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="upload-progress-text">Đang tải ảnh đề bài... {uploadProgress}%</span>
            </div>
          ) : (
            <>
              <div className="image-upload-prompt">
                <ImageIcon size={26} className="image-upload-icon" />
                <p className="image-upload-text">
                  Đính kèm ảnh bài tập, đề thi hoặc sơ đồ hình vẽ (Có thể chọn nhiều ảnh hoặc bấm <b>Ctrl+V</b> để dán)
                </p>

                <div className="image-upload-buttons">
                  <label className="btn btn-secondary btn-sm image-file-btn">
                    <Upload size={14} />
                    <span>Chọn ảnh từ máy (Tối đa 8 ảnh)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    <LinkIcon size={14} />
                    <span>Dán URL ảnh</span>
                  </button>
                </div>
              </div>

              {showUrlInput && (
                <div className="image-url-form animate-fade-in">
                  <input
                    type="url"
                    className="form-input form-input-sm"
                    placeholder="https://example.com/hinh-anh-de-thi.jpg"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAddUrl}
                  >
                    <Check size={14} />
                    <span>Thêm</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="image-uploader-error">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
