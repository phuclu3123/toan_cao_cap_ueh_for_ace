import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  Image as ImageIcon,
  Move
} from 'lucide-react';
import '../../assets/styles/AvatarCropModal.css';

/**
 * AvatarCropModal: Apple / Facebook / Google style circular avatar cropper.
 * Supports smooth mouse/touch dragging, zoom slider (1x - 3x), 90-degree rotation, and high-res export.
 */
export default function AvatarCropModal({
  isOpen,
  onClose,
  onSave,
  initialImage = null
}) {
  const [imageSrc, setImageSrc] = useState(initialImage);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageObjRef = useRef(null);

  // Load image whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setImageVersion((version) => version + 1);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle file select or drag-and-drop
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setImageSrc(loadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Draw current image onto canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const size = 320; // Internal preview resolution
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Save canvas state
    ctx.save();

    // Move to center of canvas
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate dimensions to cover square canvas
    const imgAspect = img.width / img.height;
    let drawWidth, drawHeight;
    if (imgAspect >= 1) {
      drawHeight = size * zoom;
      drawWidth = size * imgAspect * zoom;
    } else {
      drawWidth = size * zoom;
      drawHeight = (size / imgAspect) * zoom;
    }

    // Apply pan offset
    const posX = position.x * zoom;
    const posY = position.y * zoom;

    ctx.drawImage(
      img,
      -drawWidth / 2 + posX,
      -drawHeight / 2 + posY,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }, [position, zoom, rotation]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, imageVersion]);

  // Drag handlers (Mouse & Touch)
  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!imageSrc || !e.touches[0]) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches[0]) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Export cropped circular image as base64
  const handleCropAndSave = async () => {
    const img = imageObjRef.current;
    if (!img) return;

    setIsProcessing(true);
    try {
      const exportCanvas = document.createElement('canvas');
      const exportSize = 400; // High quality 400x400 avatar
      exportCanvas.width = exportSize;
      exportCanvas.height = exportSize;
      const ctx = exportCanvas.getContext('2d');

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.translate(exportSize / 2, exportSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const imgAspect = img.width / img.height;
      let drawWidth, drawHeight;
      if (imgAspect >= 1) {
        drawHeight = exportSize * zoom;
        drawWidth = exportSize * imgAspect * zoom;
      } else {
        drawWidth = exportSize * zoom;
        drawHeight = (exportSize / imgAspect) * zoom;
      }

      const scaleRatio = exportSize / 320;
      const posX = position.x * zoom * scaleRatio;
      const posY = position.y * zoom * scaleRatio;

      ctx.drawImage(
        img,
        -drawWidth / 2 + posX,
        -drawHeight / 2 + posY,
        drawWidth,
        drawHeight
      );

      const croppedBase64 = exportCanvas.toDataURL('image/jpeg', 0.92);
      await onSave?.(croppedBase64);
      onClose?.();
    } catch (err) {
      console.error('Lỗi cắt ảnh đại diện:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="avatar-crop-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="avatar-crop-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="avatar-crop-header">
          <div className="avatar-crop-title">
            <div className="avatar-crop-icon-badge">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3>Căn chỉnh Ảnh đại diện</h3>
              <p>Kéo để di chuyển vị trí và dùng thanh trượt để phóng to/thu nhỏ</p>
            </div>
          </div>
          <button
            type="button"
            className="avatar-crop-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="avatar-crop-body">
          {imageSrc ? (
            <div className="avatar-crop-viewport-wrap">
              {/* Canvas viewport */}
              <div
                ref={containerRef}
                className={`avatar-crop-canvas-container ${isDragging ? 'is-dragging' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <canvas ref={canvasRef} className="avatar-crop-canvas" />
                {/* Circular Mask Overlay */}
                <div className="avatar-crop-circle-mask" />
                <div className="avatar-crop-drag-hint">
                  <Move size={12} />
                  <span>Kéo để căn chỉnh</span>
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="avatar-crop-controls">
                <div className="avatar-crop-zoom-row">
                  <button
                    type="button"
                    className="avatar-crop-tool-btn"
                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                    title="Thu nhỏ"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="avatar-crop-slider"
                  />
                  <button
                    type="button"
                    className="avatar-crop-tool-btn"
                    onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                    title="Phóng to"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    type="button"
                    className="avatar-crop-tool-btn is-rotate"
                    onClick={handleRotate}
                    title="Xoay 90 độ"
                  >
                    <RotateCw size={15} />
                    <span>Xoay</span>
                  </button>
                </div>

                <div className="avatar-crop-file-row">
                  <button
                    type="button"
                    className="avatar-crop-change-file-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    <span>Chọn ảnh khác</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Upload Empty State */
            <div
              className="avatar-crop-upload-empty"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="avatar-crop-upload-icon-circle">
                <Upload size={28} />
              </div>
              <h4>Tải lên ảnh đại diện mới</h4>
              <p>Hỗ trợ định dạng PNG, JPG, JPEG, WEBP (tối đa 10MB)</p>
              <button type="button" className="btn btn-primary avatar-crop-browse-btn">
                Duyệt ảnh từ máy tính
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="avatar-crop-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-primary avatar-crop-save-btn"
            onClick={handleCropAndSave}
            disabled={!imageSrc || isProcessing}
          >
            {isProcessing ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <Check size={16} />
                <span>Áp dụng Ảnh đại diện</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
