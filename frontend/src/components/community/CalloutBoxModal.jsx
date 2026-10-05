import { useState, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Palette,
  Check,
  AlignLeft,
  AlignRight,
  Maximize2,
  Layers,
  Eye,
  Plus
} from 'lucide-react';
import MathRenderer from '../MathRenderer';
import '../../assets/styles/community.css';

// Preset color combinations tailored for high-end academic & editorial math publishing
const CALLOUT_COLOR_PRESETS = [
  {
    id: 'green',
    name: 'Xanh UEH (Mặc định)',
    barColor: '#176b4a',
    bgColor: '#f2f7f5',
    borderColor: '#dfe5e1',
    titleColor: '#0e4e35',
    textColor: '#17201c'
  },
  {
    id: 'blue',
    name: 'Xanh Dương',
    barColor: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#dbeafe',
    titleColor: '#1d4ed8',
    textColor: '#1e293b'
  },
  {
    id: 'purple',
    name: 'Tím Hoàng Gia',
    barColor: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ede9fe',
    titleColor: '#6d28d9',
    textColor: '#1e1b4b'
  },
  {
    id: 'orange',
    name: 'Cam Hổ Phách',
    barColor: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#ffedd5',
    titleColor: '#c2410c',
    textColor: '#431407'
  },
  {
    id: 'red',
    name: 'Đỏ Thẫm',
    barColor: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fee2e2',
    titleColor: '#b91c1c',
    textColor: '#450a0a'
  },
  {
    id: 'rose',
    name: 'Hồng Phấn',
    barColor: '#db2777',
    bgColor: '#fdf2f8',
    borderColor: '#fce7f3',
    titleColor: '#be185d',
    textColor: '#500724'
  },
  {
    id: 'gold',
    name: 'Vàng Ánh Kim',
    barColor: '#d97706',
    bgColor: '#fefce8',
    borderColor: '#fef08a',
    titleColor: '#b45309',
    textColor: '#451a03'
  },
  {
    id: 'slate',
    name: 'Xám Tối Giản',
    barColor: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    titleColor: '#334155',
    textColor: '#0f172a'
  }
];

// Quick Box Type Presets
const BOX_TYPE_PRESETS = [
  { id: 'lemma', label: 'Bổ đề', defaultTitle: 'Bổ đề 1.', defaultColor: 'green' },
  { id: 'theorem', label: 'Định lý', defaultTitle: 'Định lý 1.', defaultColor: 'blue' },
  { id: 'definition', label: 'Định nghĩa', defaultTitle: 'Định nghĩa.', defaultColor: 'purple' },
  { id: 'remark', label: 'Nhận xét', defaultTitle: 'Nhận xét.', defaultColor: 'gold' },
  { id: 'corollary', label: 'Hệ quả', defaultTitle: 'Hệ quả 1.', defaultColor: 'orange' },
  { id: 'example', label: 'Ví dụ', defaultTitle: 'Ví dụ 1.', defaultColor: 'slate' },
  { id: 'note', label: 'Chú ý / Ghi chú', defaultTitle: 'Chú ý:', defaultColor: 'red' },
  { id: 'custom', label: 'Tự do', defaultTitle: 'Ghi chú quan trọng:', defaultColor: 'green' }
];

export default function CalloutBoxModal({ isOpen, onClose, onInsert }) {
  const barColorId = useId();
  const bgColorId = useId();
  const borderColorId = useId();
  const titleColorId = useId();
  const textColorId = useId();
  const [selectedType, setSelectedType] = useState('lemma');
  const [title, setTitle] = useState('Bổ đề 1.');
  const [content, setContent] = useState(
    'Cho tam giác $ABC$ nội tiếp đường tròn $(O)$ và ngoại tiếp đường tròn $(I)$. Đường tròn $(I)$ tiếp xúc với $BC$ tại $D$. Đặt $V=OI\\cap BC$, gọi $P$ là giao điểm thứ hai của $AV$ với $(O)$, và gọi $A_1$ là điểm đối xứng của $A$ qua $OI$. Khi đó ba điểm $A_1,D,P$ thẳng hàng.'
  );

  const [selectedPreset, setSelectedPreset] = useState('green');
  const [barPosition, setBarPosition] = useState('left'); // 'left' | 'right' | 'both' | 'all' | 'none'
  const [showCustomColors, setShowCustomColors] = useState(false);

  // Custom color values
  const [customBarColor, setCustomBarColor] = useState('#176b4a');
  const [customBgColor, setCustomBgColor] = useState('#f2f7f5');
  const [customBorderColor, setCustomBorderColor] = useState('#dfe5e1');
  const [customTitleColor, setCustomTitleColor] = useState('#0e4e35');
  const [customTextColor, setCustomTextColor] = useState('#17201c');

  if (!isOpen) return null;

  const currentPreset = CALLOUT_COLOR_PRESETS.find((p) => p.id === selectedPreset) || CALLOUT_COLOR_PRESETS[0];

  const activeBarColor = showCustomColors ? customBarColor : currentPreset.barColor;
  const activeBgColor = showCustomColors ? customBgColor : currentPreset.bgColor;
  const activeBorderColor = showCustomColors ? customBorderColor : currentPreset.borderColor;
  const activeTitleColor = showCustomColors ? customTitleColor : currentPreset.titleColor;
  const activeTextColor = showCustomColors ? customTextColor : currentPreset.textColor;

  const handleSelectType = (typeObj) => {
    setSelectedType(typeObj.id);
    setTitle(typeObj.defaultTitle);
    if (!showCustomColors && typeObj.defaultColor) {
      setSelectedPreset(typeObj.defaultColor);
      const foundPreset = CALLOUT_COLOR_PRESETS.find((p) => p.id === typeObj.defaultColor);
      if (foundPreset) {
        setCustomBarColor(foundPreset.barColor);
        setCustomBgColor(foundPreset.bgColor);
        setCustomBorderColor(foundPreset.borderColor);
        setCustomTitleColor(foundPreset.titleColor);
        setCustomTextColor(foundPreset.textColor);
      }
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setCustomBarColor(preset.barColor);
    setCustomBgColor(preset.bgColor);
    setCustomBorderColor(preset.borderColor);
    setCustomTitleColor(preset.titleColor);
    setCustomTextColor(preset.textColor);
  };

  const getBarInlineStyle = () => {
    switch (barPosition) {
      case 'left':
        return `border-left: 4px solid ${activeBarColor};`;
      case 'right':
        return `border-right: 4px solid ${activeBarColor};`;
      case 'both':
        return `border-left: 4px solid ${activeBarColor}; border-right: 4px solid ${activeBarColor};`;
      case 'all':
        return `border: 2px solid ${activeBarColor};`;
      case 'none':
      default:
        return '';
    }
  };

  const handleInsert = () => {
    const barStyleStr = getBarInlineStyle();
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    const titleHtml = cleanTitle
      ? `<strong style="color: ${activeTitleColor}; font-weight: 800; margin-right: 6px;">${cleanTitle}</strong>`
      : '';

    const htmlOutput = `<div class="math-lemma-box math-callout-box" style="margin: 14px 0 12px; padding: 12px 18px; background: ${activeBgColor}; border: 1px solid ${activeBorderColor}; ${barStyleStr} border-radius: 10px; font-size: 0.98rem; line-height: 1.75; color: ${activeTextColor};">${titleHtml}${cleanContent}</div><p><br></p>`;

    onInsert?.(htmlOutput);
    onClose?.();
  };

  return createPortal(
    <div className="math-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="math-callout-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="math-callout-modal-header">
          <div className="math-callout-header-title">
            <div className="math-callout-icon-wrap" style={{ background: activeBarColor }}>
              <Layers size={18} color="#ffffff" />
            </div>
            <div>
              <h3>Chèn Hộp Bổ đề / Định lý / Khung Ghi chú</h3>
              <p>Tùy chỉnh màu nền, màu thanh viền (trái/phải) và công thức LaTeX theo ý bạn</p>
            </div>
          </div>
          <button
            type="button"
            className="math-callout-close-btn"
            onClick={onClose}
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="math-callout-modal-body custom-scrollbar">
          {/* 1. Quick Type Selector */}
          <div className="math-callout-section">
            <label className="math-callout-label">
              <span>Loại hộp nội dung</span>
              <span className="math-callout-hint">Chọn mẫu nhanh hoặc tự nhập</span>
            </label>
            <div className="math-callout-types-grid">
              {BOX_TYPE_PRESETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`math-callout-type-btn ${selectedType === t.id ? 'active' : ''}`}
                  onClick={() => handleSelectType(t)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Title & Content Input */}
          <div className="math-callout-section">
            <label className="math-callout-label">
              <span>Tiêu đề hộp</span>
            </label>
            <input
              type="text"
              className="math-callout-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Bổ đề 1., Định lý Gauss, Nhận xét quan trọng..."
            />
          </div>

          <div className="math-callout-section">
            <label className="math-callout-label">
              <span>Nội dung bên trong (hỗ trợ văn bản và công thức LaTeX $...$)</span>
            </label>
            <textarea
              className="math-callout-textarea custom-scrollbar"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung, có thể dùng LaTeX như $ABC$, $\int_{0}^{1}$, $\dfrac{a}{b}$..."
            />
          </div>

          {/* 3. Bar Position (Left, Right, Both, Full, None) */}
          <div className="math-callout-section">
            <label className="math-callout-label">
              <span>Vị trí thanh điểm nhấn (Thanh viền màu)</span>
            </label>
            <div className="math-callout-position-grid">
              <button
                type="button"
                className={`math-callout-pos-btn ${barPosition === 'left' ? 'active' : ''}`}
                onClick={() => setBarPosition('left')}
              >
                <AlignLeft size={14} />
                <span>Thanh bên trái (Chuẩn)</span>
              </button>
              <button
                type="button"
                className={`math-callout-pos-btn ${barPosition === 'right' ? 'active' : ''}`}
                onClick={() => setBarPosition('right')}
              >
                <AlignRight size={14} />
                <span>Thanh bên phải</span>
              </button>
              <button
                type="button"
                className={`math-callout-pos-btn ${barPosition === 'both' ? 'active' : ''}`}
                onClick={() => setBarPosition('both')}
              >
                <Layers size={14} />
                <span>Cả hai bên (Trái & Phải)</span>
              </button>
              <button
                type="button"
                className={`math-callout-pos-btn ${barPosition === 'all' ? 'active' : ''}`}
                onClick={() => setBarPosition('all')}
              >
                <Maximize2 size={14} />
                <span>Viền đậm toàn bộ</span>
              </button>
              <button
                type="button"
                className={`math-callout-pos-btn ${barPosition === 'none' ? 'active' : ''}`}
                onClick={() => setBarPosition('none')}
              >
                <span>Không có thanh viền</span>
              </button>
            </div>
          </div>

          {/* 4. Color Palette Presets */}
          <div className="math-callout-section">
            <div className="math-callout-flex-between">
              <label className="math-callout-label">
                <span>Bảng phối màu học thuật (Color Palette)</span>
              </label>
              <button
                type="button"
                className="math-callout-custom-toggle-btn"
                onClick={() => setShowCustomColors(!showCustomColors)}
              >
                <Palette size={13} />
                <span>{showCustomColors ? 'Dùng bảng màu có sẵn' : 'Tự chỉnh màu chi tiết (HEX)'}</span>
              </button>
            </div>

            {!showCustomColors ? (
              <div className="math-callout-presets-grid">
                {CALLOUT_COLOR_PRESETS.map((p) => {
                  const isSelected = selectedPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`math-callout-preset-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectPreset(p)}
                      style={{
                        background: p.bgColor,
                        borderColor: isSelected ? p.barColor : p.borderColor
                      }}
                    >
                      <div className="preset-bar-preview" style={{ background: p.barColor }} />
                      <div className="preset-info">
                        <span className="preset-name" style={{ color: p.titleColor }}>{p.name}</span>
                        <div className="preset-dots">
                          <span style={{ background: p.barColor }} title="Màu thanh viền" />
                          <span style={{ background: p.bgColor, border: '1px solid #cbd5e1' }} title="Màu nền" />
                        </div>
                      </div>
                      {isSelected && (
                        <div className="preset-check-badge" style={{ background: p.barColor }}>
                          <Check size={11} color="#fff" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Custom Color Inputs */
              <div className="math-callout-custom-colors-panel">
                <div className="custom-color-row">
                  <label htmlFor={barColorId}>Thanh điểm nhấn:</label>
                  <div className="color-input-wrapper">
                    <input
                      id={barColorId}
                      type="color"
                      value={customBarColor}
                      onChange={(e) => setCustomBarColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={customBarColor}
                      onChange={(e) => setCustomBarColor(e.target.value)}
                      className="color-hex-text"
                    />
                  </div>
                </div>

                <div className="custom-color-row">
                  <label htmlFor={bgColorId}>Màu nền hộp (Background):</label>
                  <div className="color-input-wrapper">
                    <input
                      id={bgColorId}
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="color-hex-text"
                    />
                  </div>
                </div>

                <div className="custom-color-row">
                  <label htmlFor={borderColorId}>Màu viền phụ (Border):</label>
                  <div className="color-input-wrapper">
                    <input
                      id={borderColorId}
                      type="color"
                      value={customBorderColor}
                      onChange={(e) => setCustomBorderColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={customBorderColor}
                      onChange={(e) => setCustomBorderColor(e.target.value)}
                      className="color-hex-text"
                    />
                  </div>
                </div>

                <div className="custom-color-row">
                  <label htmlFor={titleColorId}>Màu chữ tiêu đề:</label>
                  <div className="color-input-wrapper">
                    <input
                      id={titleColorId}
                      type="color"
                      value={customTitleColor}
                      onChange={(e) => setCustomTitleColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={customTitleColor}
                      onChange={(e) => setCustomTitleColor(e.target.value)}
                      className="color-hex-text"
                    />
                  </div>
                </div>

                <div className="custom-color-row">
                  <label htmlFor={textColorId}>Màu chữ nội dung:</label>
                  <div className="color-input-wrapper">
                    <input
                      id={textColorId}
                      type="color"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      className="color-hex-text"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Live Interactive Preview */}
          <div className="math-callout-section">
            <label className="math-callout-label">
              <Eye size={14} />
              <span>Xem trước trực tiếp (Live KaTeX Preview)</span>
            </label>
            <div className="math-callout-preview-wrapper">
              <div
                className="math-lemma-box math-callout-box"
                style={{
                  margin: 0,
                  padding: '14px 20px',
                  background: activeBgColor,
                  border: `1px solid ${activeBorderColor}`,
                  borderLeft: barPosition === 'left' || barPosition === 'both' ? `4px solid ${activeBarColor}` : `1px solid ${activeBorderColor}`,
                  borderRight: barPosition === 'right' || barPosition === 'both' ? `4px solid ${activeBarColor}` : `1px solid ${activeBorderColor}`,
                  ...(barPosition === 'all' ? { border: `2.5px solid ${activeBarColor}` } : {}),
                  borderRadius: '10px',
                  fontSize: '0.98rem',
                  lineHeight: '1.75',
                  color: activeTextColor
                }}
              >
                {title && (
                  <strong style={{ color: activeTitleColor, fontWeight: 800, marginRight: '6px' }}>
                    {title}{' '}
                  </strong>
                )}
                <MathRenderer text={content} inline />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="math-callout-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-primary math-callout-insert-btn"
            style={{ background: activeBarColor, borderColor: activeBarColor }}
            onClick={handleInsert}
          >
            <Plus size={15} />
            <span>Chèn Hộp vào bài viết</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
