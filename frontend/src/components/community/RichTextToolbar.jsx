import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignCenter,
  Type,
  Heading,
  List,
  ListOrdered,
  Quote,
  Code,
  BookOpen,
  ChevronDown,
  Smile,
  Layers
} from 'lucide-react';
import FacebookEmojiPicker from './FacebookEmojiPicker';
import CalloutBoxModal from './CalloutBoxModal';
import '../../assets/styles/community.css';

/**
 * RichTextToolbar: Comprehensive Word/Docs-style formatting toolbar
 * Supports bold, italic, underline, strikethrough, case transforms, alignments,
 * headings, lists, quotes, and rapid KaTeX mathematics insertion.
 */
export default function RichTextToolbar({
  textareaRef,
  content = '',
  setContent,
  onOpenCheatsheet,
  compact = false
}) {
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCalloutModal, setShowCalloutModal] = useState(false);

  const handleInsertCallout = (htmlSnippet) => {
    applyWrap(`\n${htmlSnippet}\n`, '', '');
  };

  // Helper to wrap or insert text around current selection
  const applyWrap = (prefix, suffix = '', defaultText = 'văn bản') => {
    const textarea = textareaRef?.current;
    if (!textarea) {
      setContent((prev) => `${prev} ${prefix}${defaultText}${suffix} `);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 20);
  };

  // Helper for block line prefixes (Headings, Lists, Quotes)
  const applyLinePrefix = (prefix) => {
    const textarea = textareaRef?.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n${prefix} `);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    if (selectedText.includes('\n')) {
      replacement = selectedText
        .split('\n')
        .map((line) => (line.trim() ? `${prefix} ${line}` : line))
        .join('\n');
    } else {
      replacement = `${prefix} ${selectedText || 'Tiêu đề'}`;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 20);
  };

  // Case transforms (UPPERCASE, lowercase, Capitalize)
  const applyCaseTransform = (mode) => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    if (!selectedText) return;

    let transformed = selectedText;
    if (mode === 'upper') {
      transformed = selectedText.toUpperCase();
    } else if (mode === 'lower') {
      transformed = selectedText.toLowerCase();
    } else if (mode === 'cap') {
      transformed = selectedText.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const newContent = content.substring(0, start) + transformed + content.substring(end);
    setContent(newContent);
    setShowCaseMenu(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
    }, 20);
  };

  // Quick Math Snippets
  const mathButtons = [
    { label: 'x²', code: 'x^{2}', title: 'Lũy thừa x^2' },
    { label: 'x/y', code: '\\frac{a}{b}', title: 'Phân số \\frac{a}{b}' },
    { label: '√x', code: '\\sqrt{x}', title: 'Căn bậc hai \\sqrt{x}' },
    { label: '∫', code: '\\int_{a}^{b} f(x)\\,dx', title: 'Tích phân' },
    { label: 'lim', code: '\\lim_{x \\to x_0} f(x)', title: 'Giới hạn' },
    { label: '∂f/∂x', code: '\\frac{\\partial f}{\\partial x}', title: 'Đạo hàm riêng' },
    { label: '∇f', code: '\\nabla f', title: 'Vector Gradient' },
    { label: 'λ', code: '\\lambda', title: 'Nhân tử Lagrange' },
    { label: '∑', code: '\\sum_{i=1}^{n} x_i', title: 'Tổng Sigma' },
    { label: '[Matrix]', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', title: 'Ma trận 2x2' }
  ];

  return (
    <div className={`rich-editor-toolbar ${compact ? 'is-compact' : ''}`} role="toolbar">
      {/* 1. Text Styling Group */}
      <div className="rich-toolbar-group">
        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyWrap('**', '**', 'chữ in đậm')}
          title="In đậm (Ctrl+B)"
        >
          <Bold size={14} />
        </button>

        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyWrap('*', '*', 'chữ in nghiêng')}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={14} />
        </button>

        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyWrap('<u>', '</u>', 'chữ gạch chân')}
          title="Gạch chân (<u>)"
        >
          <Underline size={14} />
        </button>

        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyWrap('~~', '~~', 'chữ gạch ngang')}
          title="Gạch ngang (~~)"
        >
          <Strikethrough size={14} />
        </button>
      </div>

      <div className="rich-toolbar-divider" />

      {/* 2. Headings & Case Transform */}
      <div className="rich-toolbar-group" style={{ position: 'relative' }}>
        <button
          type="button"
          className="rich-tool-btn dropdown-trigger"
          onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowCaseMenu(false); }}
          title="Tiêu đề & Đề mục"
        >
          <Heading size={14} />
          <ChevronDown size={10} />
        </button>

        {showHeadingMenu && (
          <div className="rich-dropdown-menu">
            <button type="button" onClick={() => { applyLinePrefix('###'); setShowHeadingMenu(false); }}>
              Tiêu đề lớn (H3)
            </button>
            <button type="button" onClick={() => { applyLinePrefix('####'); setShowHeadingMenu(false); }}>
              Tiêu đề vừa (H4)
            </button>
            <button type="button" onClick={() => { applyWrap('<small>', '</small>', 'chữ nhỏ'); setShowHeadingMenu(false); }}>
              Chữ kích thước nhỏ
            </button>
          </div>
        )}

        <button
          type="button"
          className="rich-tool-btn dropdown-trigger"
          onClick={() => { setShowCaseMenu(!showCaseMenu); setShowHeadingMenu(false); }}
          title="Đổi kiểu chữ (HOA/thường)"
        >
          <Type size={14} />
          <ChevronDown size={10} />
        </button>

        {showCaseMenu && (
          <div className="rich-dropdown-menu">
            <button type="button" onClick={() => applyCaseTransform('upper')}>
              IN HOA TOÀN BỘ
            </button>
            <button type="button" onClick={() => applyCaseTransform('lower')}>
              viết thường toàn bộ
            </button>
            <button type="button" onClick={() => applyCaseTransform('cap')}>
              Viết Hoa Chữ Cái Đầu
            </button>
          </div>
        )}
      </div>

      <div className="rich-toolbar-divider" />

      {/* 3. Alignment & Blocks */}
      <div className="rich-toolbar-group">
        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyWrap('$$', '$$', 'công_thức_căn_giữa')}
          title="Căn giữa công thức ($$)"
        >
          <AlignCenter size={14} />
        </button>

        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyLinePrefix('-')}
          title="Danh sách gạch đầu dòng"
        >
          <List size={14} />
        </button>

        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyLinePrefix('1.')}
          title="Danh sách đánh số"
        >
          <ListOrdered size={14} />
        </button>

        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyLinePrefix('>')}
          title="Khối trích dẫn (>)"
        >
          <Quote size={14} />
        </button>

        <button
          type="button"
          className="rich-tool-btn"
          onClick={() => applyWrap('```math\n', '\n```', 'f(x) = x^2')}
          title="Khối mã lời giải"
        >
          <Code size={14} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`rich-tool-btn ${showEmojiPicker ? 'is-active' : ''}`}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowCaseMenu(false);
              setShowHeadingMenu(false);
            }}
            title="Chèn biểu tượng cảm xúc / Emoji Facebook"
          >
            <Smile size={14} />
          </button>

          {showEmojiPicker && (
            <FacebookEmojiPicker
              onSelect={(emoji) => {
                applyWrap(emoji, '', '');
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>
      </div>

      <div className="rich-toolbar-divider" />

      {/* 4. Math Quick Insert Buttons */}
      <div className="rich-toolbar-math-group">
        <span className="rich-math-label">KaTeX:</span>
        {mathButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            className="rich-math-btn"
            title={btn.title}
            onClick={() => applyWrap('$', '$', btn.code)}
          >
            {btn.label}
          </button>
        ))}

        <button
          type="button"
          className="rich-math-btn is-callout-btn"
          style={{ background: '#f0fdf4', color: '#166534', borderColor: '#86efac', fontWeight: 600 }}
          title="Chèn Hộp Bổ đề / Định lý / Khung ghi chú tùy chỉnh màu sắc"
          onClick={() => setShowCalloutModal(true)}
        >
          <Layers size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
          Hộp Bổ đề
        </button>
      </div>

      {/* 5. Trigger Cheatsheet Button */}
      {onOpenCheatsheet && (
        <button
          type="button"
          className="rich-cheatsheet-btn"
          onClick={onOpenCheatsheet}
          title="Mở Sổ tay công thức toán của Phúc"
        >
          <BookOpen size={13} />
          <span>Sổ tay của Phúc</span>
        </button>
      )}

      {/* 6. Academic Callout Box Configurator Modal */}
      <CalloutBoxModal
        isOpen={showCalloutModal}
        onClose={() => setShowCalloutModal(false)}
        onInsert={handleInsertCallout}
      />
    </div>
  );
}
