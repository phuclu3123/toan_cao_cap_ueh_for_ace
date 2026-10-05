import { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  BookOpen,
  ChevronDown,
  Palette,
  Highlighter,
  Plus,
  Minus,
  Quote,
  Eye,
  EyeOff,
  Smile,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import MathRenderer from '../MathRenderer';
import { sanitizeHtml } from '../../utils/htmlSanitizer';
import FacebookEmojiPicker from './FacebookEmojiPicker';
import CalloutBoxModal from './CalloutBoxModal';
import { FACEBOOK_EMOTICON_MAP } from '../../utils/emoticonMapper';
import '../../assets/styles/community.css';

const TEXT_COLORS = [
  { label: 'Mặc định', color: '#0f172a' },
  { label: 'Xanh UEH', color: '#0d7a5f' },
  { label: 'Xanh dương', color: '#2563eb' },
  { label: 'Đỏ', color: '#dc2626' },
  { label: 'Cam', color: '#ea580c' },
  { label: 'Tím', color: '#7c3aed' },
  { label: 'Vàng kim', color: '#d97706' },
  { label: 'Xám', color: '#64748b' }
];

const HIGHLIGHT_COLORS = [
  { label: 'Không màu', color: 'transparent' },
  { label: 'Vàng nhạt', color: '#fef08a' },
  { label: 'Xanh lá nhạt', color: '#bbf7d0' },
  { label: 'Xanh dương nhạt', color: '#bfdbfe' },
  { label: 'Hồng nhạt', color: '#fbcfe8' }
];

const FONT_SIZES = [
  { label: '8pt (Rất nhỏ)', pt: 8, size: '1' },
  { label: '10pt (Nhỏ)', pt: 10, size: '2' },
  { label: '11pt (Tiêu chuẩn UEH)', pt: 11, size: '3' },
  { label: '14pt (Đề mục vừa)', pt: 14, size: '4' },
  { label: '18pt (Tiêu đề lớn)', pt: 18, size: '5' },
  { label: '24pt (Tiêu đề rất lớn)', pt: 24, size: '6' }
];

// Prioritized commonly used KaTeX math symbols
const COMMON_MATH_BUTTONS = [
  { label: '\\dfrac{a}{b}', code: '\\dfrac{a}{b}', title: 'Phân số đẹp' },
  { label: 'x²', code: 'x^{2}', title: 'Số mũ / Lũy thừa' },
  { label: '√x', code: '\\sqrt{x}', title: 'Căn bậc hai' },
  { label: 'lim', code: '\\lim_{x \\to x_0}', title: 'Giới hạn' },
  { label: '∫', code: '\\int_{a}^{b} f(x) dx', title: 'Tích phân' },
  { label: '∑', code: '\\sum_{i=1}^{n}', title: 'Tổng sigma' },
  { label: '[Ma trận]', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', title: 'Ma trận vuông' },
  { label: '≥ / ≤', code: '\\ge', title: 'Bất đẳng thức' },
  { label: '→', code: '\\to', title: 'Mũi tên suy ra / tiến tới' },
  { label: 'f(x,y)', code: 'f(x, y)', title: 'Hàm số 2 biến' }
];

/**
 * WYSIWYGMathEditor: Authentic Google Docs/Word-like rich text and math editor
 * With dual-row toolbar, live KaTeX preview, and standard list indentation.
 */
export default function WYSIWYGMathEditor({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung hoặc lời giải...',
  onOpenCheatsheet,
  minHeight = '180px',
  compact = false,
  showLivePreview = true
}) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const isInternalChange = useRef(false);
  const savedSelectionRange = useRef(null);

  const [fontSizePt, setFontSizePt] = useState(11);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [showCalloutModal, setShowCalloutModal] = useState(false);

  const saveSelection = () => {
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
        savedSelectionRange.current = sel.getRangeAt(0).cloneRange();
      }
    } catch {
      // Selection APIs can fail when focus moves outside the editor.
    }
  };

  const handleOpenCalloutModal = (e) => {
    e?.preventDefault?.();
    saveSelection();
    setShowCalloutModal(true);
  };

  // Sync external value to contentEditable only when it differs and not currently typing
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const safeValue = sanitizeHtml(value || '');
      if (editorRef.current.innerHTML !== safeValue) {
        editorRef.current.innerHTML = safeValue;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    const html = editorRef.current.innerHTML.replace(/&nbsp;/gi, ' ');
    onChange?.(html);
  };

  const exec = (command, val = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const applyTextColor = (color) => {
    exec('foreColor', color);
    setShowColorPicker(false);
  };

  const applyHighlight = (color) => {
    if (color === 'transparent') {
      exec('removeFormat');
    } else {
      exec('hiliteColor', color);
    }
    setShowHighlightPicker(false);
  };

  const applyFontSize = (sizeObj) => {
    exec('fontSize', sizeObj.size);
    setFontSizePt(sizeObj.pt);
    setShowSizeDropdown(false);
  };

  const stepFontSize = (delta) => {
    const nextPt = Math.max(8, Math.min(32, fontSizePt + delta));
    setFontSizePt(nextPt);
    const closest = FONT_SIZES.reduce((prev, curr) =>
      Math.abs(curr.pt - nextPt) < Math.abs(prev.pt - nextPt) ? curr : prev
    );
    exec('fontSize', closest.size);
  };

  const insertHtmlAtCursor = (htmlSnippet) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const sel = window.getSelection();
    let range = savedSelectionRange.current;

    // Check if saved range is valid inside editorRef
    if (!range || !editorRef.current.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Move to end of document
    }

    try {
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {
      // Fall through to inserting at the prepared range.
    }

    // Bulletproof DOM insertion
    try {
      const temp = document.createElement('div');
      temp.innerHTML = sanitizeHtml(htmlSnippet);
      const frag = document.createDocumentFragment();
      let node;
      let lastChild = null;
      while ((node = temp.firstChild)) {
        lastChild = frag.appendChild(node);
      }

      range.deleteContents();
      range.insertNode(frag);

      if (lastChild) {
        const afterRange = document.createRange();
        afterRange.setStartAfter(lastChild);
        afterRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(afterRange);
        savedSelectionRange.current = afterRange;
      }
    } catch {
      // Direct innerHTML append fallback
      editorRef.current.innerHTML = sanitizeHtml(
        (editorRef.current.innerHTML || '') + htmlSnippet
      );
    }

    isInternalChange.current = true;
    const finalHtml = editorRef.current.innerHTML.replace(/&nbsp;/gi, ' ');
    onChange?.(finalHtml);
  };

  const insertMathSnippet = (latex) => {
    editorRef.current?.focus();
    const snippet = ` $${latex}$ `;
    document.execCommand('insertText', false, snippet);
    handleInput();
  };

  const insertDisplayMath = () => {
    editorRef.current?.focus();
    const snippet = `\n$$f(x) = \\dfrac{a}{b}$$\n`;
    document.execCommand('insertText', false, snippet);
    handleInput();
  };

  const insertEmoji = (emoji, iso = null) => {
    editorRef.current?.focus();
    if (iso) {
      const flagHtml = `<img src="https://flagcdn.com/w40/${iso}.png" alt="${emoji}" class="inline-flag-emoji" contenteditable="false" />&nbsp;`;
      document.execCommand('insertHTML', false, flagHtml);
    } else {
      document.execCommand('insertText', false, emoji);
    }
    handleInput();
  };

  const insertCalloutBoxHtml = (htmlSnippet) => {
    insertHtmlAtCursor(htmlSnippet);
  };

  const handlePaste = (e) => {
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
            const base64 = uploadEvent.target.result;
            const imgHtml = `<p><img src="${base64}" alt="Ảnh bài giải đính kèm" class="wysiwyg-math-inline-img" style="max-width: 100%; max-height: 480px; height: auto; border-radius: 10px; margin: 12px 0; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.07); display: block;" /></p><p><br></p>`;
            insertHtmlAtCursor(imgHtml);
          };
          reader.readAsDataURL(file);
        }
        return;
      }
    }

    const pastedHtml = e.clipboardData.getData('text/html');
    if (pastedHtml) {
      e.preventDefault();
      insertHtmlAtCursor(sanitizeHtml(pastedHtml));
      return;
    }

    const pastedText = e.clipboardData.getData('text/plain');
    if (pastedText) {
      e.preventDefault();
      document.execCommand('insertText', false, pastedText);
      handleInput();
    }
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target.result;
        const imgHtml = `<p><img src="${base64}" alt="${file.name || 'Ảnh hình học đính kèm'}" class="wysiwyg-math-inline-img" style="max-width: 100%; max-height: 480px; height: auto; border-radius: 10px; margin: 12px 0; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.07); display: block;" /></p><p><br></p>`;
        insertHtmlAtCursor(imgHtml);
      };
      reader.readAsDataURL(file);
    });

    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
        const node = sel.anchorNode;
        if (node && node.nodeType === Node.TEXT_NODE) {
          const textBeforeCursor = node.textContent.slice(0, sel.anchorOffset);
          for (const item of FACEBOOK_EMOTICON_MAP) {
            for (const pattern of item.patterns) {
              if (textBeforeCursor.endsWith(pattern)) {
                const startIdx = textBeforeCursor.length - pattern.length;
                if (startIdx === 0 || /\s/.test(textBeforeCursor[startIdx - 1])) {
                  e.preventDefault();
                  const range = document.createRange();
                  range.setStart(node, startIdx);
                  range.setEnd(node, sel.anchorOffset);
                  range.deleteContents();
                  const replacementText = item.emoji + (e.key === ' ' ? ' ' : '\n');
                  const textNode = document.createTextNode(replacementText);
                  range.insertNode(textNode);
                  range.setStartAfter(textNode);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                  handleInput();
                  return;
                }
              }
            }
          }
        }
      }
    }
  };

  return (
    <div className={`docs-wysiwyg-wrapper ${compact ? 'is-compact' : ''}`}>
      {/* 1. Google Docs / Word Style Ribbon Toolbar */}
      <div className="docs-toolbar-ribbon" role="toolbar">
        {/* ROW 1: Standard Document Formatting */}
        <div className="docs-toolbar-row">
          {/* Font Size Stepper */}
          <div className="docs-toolbar-section">
            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => stepFontSize(-1)}
              title="Giảm cỡ chữ"
            >
              <Minus size={12} />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="docs-size-input-btn"
                onClick={() => {
                  setShowSizeDropdown(!showSizeDropdown);
                  setShowColorPicker(false);
                  setShowHighlightPicker(false);
                }}
                title="Chọn cỡ chữ"
              >
                <span>{fontSizePt}</span>
                <ChevronDown size={10} />
              </button>

              {showSizeDropdown && (
                <div className="docs-dropdown-popover">
                  {FONT_SIZES.map((fs) => (
                    <button
                      key={fs.size}
                      type="button"
                      className="docs-popover-item"
                      onClick={() => applyFontSize(fs)}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => stepFontSize(1)}
              title="Tăng cỡ chữ"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="docs-toolbar-sep" />

          {/* Basic Text Styles */}
          <div className="docs-toolbar-section">
            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('bold')}
              title="In đậm (Ctrl+B)"
            >
              <Bold size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('italic')}
              title="In nghiêng (Ctrl+I)"
            >
              <Italic size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('underline')}
              title="Gạch chân (Ctrl+U)"
            >
              <Underline size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('strikeThrough')}
              title="Gạch ngang"
            >
              <Strikethrough size={14} />
            </button>
          </div>

          <div className="docs-toolbar-sep" />

          {/* Text Color & Highlight Pickers */}
          <div className="docs-toolbar-section">
            {/* Text Color */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="docs-tool-btn docs-color-btn"
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowHighlightPicker(false);
                  setShowSizeDropdown(false);
                }}
                title="Màu văn bản"
              >
                <Palette size={14} />
                <div className="docs-color-bar" style={{ background: '#0d7a5f' }} />
              </button>

              {showColorPicker && (
                <div className="docs-color-palette-popover">
                  <span className="docs-palette-title">Màu chữ</span>
                  <div className="docs-palette-grid">
                    {TEXT_COLORS.map((tc) => (
                      <button
                        key={tc.color}
                        type="button"
                        className="docs-palette-swatch"
                        style={{ background: tc.color }}
                        onClick={() => applyTextColor(tc.color)}
                        title={tc.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Highlight Color */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="docs-tool-btn docs-color-btn"
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowColorPicker(false);
                  setShowSizeDropdown(false);
                }}
                title="Màu tô sáng / Highlight"
              >
                <Highlighter size={14} />
                <div className="docs-color-bar" style={{ background: '#fef08a' }} />
              </button>

              {showHighlightPicker && (
                <div className="docs-color-palette-popover">
                  <span className="docs-palette-title">Màu nền</span>
                  <div className="docs-palette-grid">
                    {HIGHLIGHT_COLORS.map((hc) => (
                      <button
                        key={hc.color}
                        type="button"
                        className="docs-palette-swatch"
                        style={{ background: hc.color, border: hc.color === 'transparent' ? '1px dashed #cbd5e1' : 'none' }}
                        onClick={() => applyHighlight(hc.color)}
                        title={hc.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Facebook Emoji Picker */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`docs-tool-btn docs-emoji-trigger-btn ${showEmojiPicker ? 'is-active' : ''}`}
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowColorPicker(false);
                  setShowHighlightPicker(false);
                  setShowSizeDropdown(false);
                }}
                title="Chèn biểu tượng cảm xúc / Emoji MXH Facebook (Cảm xúc, Bàn tay, Tim, Học tập, Lửa, Ăn uống...)"
              >
                <Smile size={14} />
              </button>

              {showEmojiPicker && (
                <FacebookEmojiPicker
                  onSelect={(emoji, iso) => {
                    insertEmoji(emoji, iso);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>
          </div>

          <div className="docs-toolbar-sep" />

          {/* Alignments */}
          <div className="docs-toolbar-section">
            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('justifyLeft')}
              title="Căn trái"
            >
              <AlignLeft size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('justifyCenter')}
              title="Căn giữa"
            >
              <AlignCenter size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('justifyRight')}
              title="Căn phải"
            >
              <AlignRight size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('justifyFull')}
              title="Căn đều hai bên"
            >
              <AlignJustify size={14} />
            </button>
          </div>

          <div className="docs-toolbar-sep" />

          {/* Lists & Quotes */}
          <div className="docs-toolbar-section">
            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('insertUnorderedList')}
              title="Danh sách gạch đầu dòng"
            >
              <List size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('insertOrderedList')}
              title="Danh sách đánh số thứ tự (1, 2, 3...)"
            >
              <ListOrdered size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn"
              onClick={() => exec('formatBlock', 'blockquote')}
              title="Khối trích dẫn"
            >
              <Quote size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn docs-callout-btn"
              onClick={handleOpenCalloutModal}
              title="Chèn Hộp Bổ đề / Định lý / Khung ghi chú (Tùy chỉnh màu & thanh viền)"
            >
              <Layers size={14} />
            </button>

            <button
              type="button"
              className="docs-tool-btn docs-image-btn"
              onClick={() => {
                saveSelection();
                imageInputRef.current?.click();
              }}
              title="Chèn ảnh / hình vẽ vào văn bản (Hoặc bấm Ctrl+V để dán trực tiếp)"
            >
              <ImageIcon size={14} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Preview Toggle Button */}
          {showLivePreview && (
            <div className="docs-toolbar-section" style={{ marginLeft: 'auto' }}>
              <button
                type="button"
                className={`docs-preview-toggle-btn ${isPreviewVisible ? 'is-active' : ''}`}
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                title="Bật/Tắt xem trước công thức KaTeX trực tiếp"
              >
                {isPreviewVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{isPreviewVisible ? 'Ẩn xem trước' : 'Xem trước KaTeX'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ROW 2: Prioritized Common KaTeX Formulas */}
        <div className="docs-toolbar-row docs-math-row">
          <div className="docs-toolbar-math-section">
            <span className="docs-math-ribbon-tag">KaTeX thường dùng:</span>
            {COMMON_MATH_BUTTONS.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                className="docs-math-chip"
                onClick={() => insertMathSnippet(btn.code)}
                title={btn.title}
              >
                {btn.label}
              </button>
            ))}

            <button
              type="button"
              className="docs-math-chip is-display-math"
              onClick={insertDisplayMath}
              title="Khối công thức căn giữa $$...$$"
            >
              $$ Căn giữa $$
            </button>

            <button
              type="button"
              className="docs-math-chip is-callout-chip"
              onClick={handleOpenCalloutModal}
              title="Chèn Hộp Bổ đề / Định lý / Khung ghi chú tùy chỉnh màu sắc"
            >
              <Layers size={11} style={{ marginRight: 4 }} />
              Hộp Bổ đề / Định lý
            </button>
          </div>

          {/* Sổ tay của Phúc button */}
          {onOpenCheatsheet && (
            <button
              type="button"
              className="docs-cheatsheet-trigger"
              onClick={onOpenCheatsheet}
              title="Mở Sổ tay công thức toán của Phúc"
            >
              <BookOpen size={13} />
              <span>Sổ tay của Phúc</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Visual ContentEditable Document Area */}
      <div
        ref={editorRef}
        contentEditable
        className="docs-wysiwyg-content"
        style={{ minHeight }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* 3. Live KaTeX Simultaneous Preview Box */}
      {showLivePreview && isPreviewVisible && value && value.replace(/<[^>]*>/g, '').trim().length > 0 && (
        <div className="docs-live-preview-box">
          <div className="docs-preview-header">
            <Eye size={13} />
            <span>Xem trước đồng thời (KaTeX Live Preview):</span>
          </div>
          <div className="docs-preview-body">
            <MathRenderer text={value} />
          </div>
        </div>
      )}

      {/* 4. Academic Callout Box Configurator Modal */}
      <CalloutBoxModal
        isOpen={showCalloutModal}
        onClose={() => setShowCalloutModal(false)}
        onInsert={insertCalloutBoxHtml}
      />
    </div>
  );
}
