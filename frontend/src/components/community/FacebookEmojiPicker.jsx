import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Smile,
  Dog,
  Utensils,
  Trophy,
  Car,
  Lightbulb,
  Heart,
  Flag,
  Clock
} from 'lucide-react';
import '../../assets/styles/community.css';

// Flag dataset with official flag images (bypasses Windows text fallback)
const COUNTRY_FLAGS = [
  { code: '🇻🇳', name: 'Việt Nam', iso: 'vn' },
  { code: '🇺🇸', name: 'Hoa Kỳ (Mỹ)', iso: 'us' },
  { code: '🇬🇧', name: 'Vương quốc Anh', iso: 'gb' },
  { code: '🇫🇷', name: 'Pháp', iso: 'fr' },
  { code: '🇩🇪', name: 'Đức', iso: 'de' },
  { code: '🇯🇵', name: 'Nhật Bản', iso: 'jp' },
  { code: '🇰🇷', name: 'Hàn Quốc', iso: 'kr' },
  { code: '🇨🇳', name: 'Trung Quốc', iso: 'cn' },
  { code: '🇷🇺', name: 'Nga', iso: 'ru' },
  { code: '🇨🇦', name: 'Canada', iso: 'ca' },
  { code: '🇦🇺', name: 'Úc', iso: 'au' },
  { code: '🇮🇹', name: 'Ý', iso: 'it' },
  { code: '🇪🇸', name: 'Tây Ban Nha', iso: 'es' },
  { code: '🇧🇷', name: 'Brazil', iso: 'br' },
  { code: '🇮🇳', name: 'Ấn Độ', iso: 'in' },
  { code: '🇸🇬', name: 'Singapore', iso: 'sg' },
  { code: '🇹🇭', name: 'Thái Lan', iso: 'th' },
  { code: '🇲🇾', name: 'Malaysia', iso: 'my' },
  { code: '🇮🇩', name: 'Indonesia', iso: 'id' },
  { code: '🇵🇭', name: 'Philippines', iso: 'ph' },
  { code: '🇱🇦', name: 'Lào', iso: 'la' },
  { code: '🇰🇭', name: 'Campuchia', iso: 'kh' },
  { code: '🇨🇭', name: 'Thụy Sĩ', iso: 'ch' },
  { code: '🇸🇪', name: 'Thụy Điển', iso: 'se' },
  { code: '🇳🇱', name: 'Hà Lan', iso: 'nl' },
  { code: '🇦🇷', name: 'Argentina', iso: 'ar' },
  { code: '🇵🇹', name: 'Bồ Đào Nha', iso: 'pt' },
  { code: '🇲🇽', name: 'Mexico', iso: 'mx' },
  { code: '🇪🇺', name: 'Liên minh Châu Âu', iso: 'eu' }
];

const OTHER_FLAGS = ['🚩', '🏁', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️'];

// 100% Comprehensive Facebook / Apple style Emoji Dataset
const FULL_FB_EMOJI_SECTIONS = [
  {
    id: 'people',
    name: 'Mặt cười và hình người',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗',
      '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
      '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮',
      '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
      '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '💀', '☠️', '💩',
      '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
      // Hands & Gestures
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
      '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
      '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋'
    ]
  },
  {
    id: 'animals',
    name: 'Động vật và tự nhiên',
    icon: Dog,
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
      '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥',
      '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌',
      '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
      '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
      '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫',
      '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌',
      '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️',
      '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲',
      // Plants & Nature
      '🌵', '🎄', '🌲', '🌳', '🌴', '🪵', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🎋',
      '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻',
      '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔',
      '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥',
      '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
      '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '🫧', '☔', '☂️', '🌊', '🌫️'
    ]
  },
  {
    id: 'food',
    name: 'Đồ ăn và đồ uống',
    icon: Utensils,
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽',
      '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚',
      '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕',
      '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜',
      '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮',
      '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫',
      '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧋', '🥤',
      '🧃', '🧉', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🧊', '🥄',
      '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂'
    ]
  },
  {
    id: 'activities',
    name: 'Hoạt động & Thể thao',
    icon: Trophy,
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
      '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋',
      '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸',
      '🤺', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫',
      '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘',
      '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'
    ]
  },
  {
    id: 'travel',
    name: 'Đi lại & Địa điểm',
    icon: Car,
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛',
      '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘',
      '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆',
      '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶',
      '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🛟', '⛽', '🚧', '🚦', '🚥', '🚏',
      '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '⛲', '🏖️', '🏝️', '🏜️',
      '🌋', '⛰️', '🏔️', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏢', '🏬', '🏣',
      '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕'
    ]
  },
  {
    id: 'objects',
    name: 'Đồ vật & Học tập',
    icon: Lightbulb,
    emojis: [
      '🎓', '📚', '📖', '📝', '✏️', '🖊️', '🖋️', '✒️', '📐', '📏', '📊', '📈', '📉',
      '📋', '📌', '📍', '📎', '🖇️', '✂️', '🗂️', '📁', '📂', '📄', '📜', '🎒', '🧮',
      '🔢', '💡', '🔦', '🕯️', '🪔', '🏮', '📱', '📲', '💻', '🖥️', '🖨️', '⌨️', '🖱️',
      '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞',
      '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '⌛',
      '⏳', '📡', '🔋', '🔌', '🧲', '🔬', '🔭', '💉', '🩸', '💊', '🩹', '🩺',
      '🔑', '🗝️', '🪓', '🔨', '⚒️', '⛏️', '🔧', '🔩', '⚙️', '🧰', '🧱', '🪜', '⚖️'
    ]
  },
  {
    id: 'symbols',
    name: 'Biểu tượng & Trái tim',
    icon: Heart,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞',
      '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💯', '💢', '💥', '💫', '💬', '💭',
      '🗨️', '🗯️', '💤', '💮', '♨️', '💈', '🛑', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝',
      '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘',
      '🕤', '🕙', '🕥', '🕚', '🕦', '🌀', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄', '🎴',
      '🔔', '🔕', '📢', '📣', '⚠️', '⛔', '🚫', '❓', '❗', '‼️', '⁉️', '✅', '✔️',
      '❌', '➕', '➖', '✖️', '➗', '🟰', '♾️', '💲', '💱', '©️', '®️', '™️', '🔚',
      '🔙', '🔛', '🔝', '🔜', '🔘', '⚪', '⚫', '🔴', '🔵', '🟢', '🟡', '🟣', '🟠'
    ]
  },
  {
    id: 'flags',
    name: 'Cờ quốc gia',
    icon: Flag,
    isFlags: true
  }
];

const RECENT_KEY = 'ueh_community_recent_emojis';

export default function FacebookEmojiPicker({ onSelect, onClose }) {
  const [activeTabId, setActiveTabId] = useState('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltipText, setTooltipText] = useState('');
  const [recentEmojis, setRecentEmojis] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) || ['😀', '👍', '❤️', '🔥', '🎓', '💡', '💯', '🇻🇳'];
    } catch {
      return ['😀', '👍', '❤️', '🔥', '🎓', '💡', '💯', '🇻🇳'];
    }
  });

  const popoverRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const sectionRefs = useRef({});

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Click tab: smooth scroll to that section
  const handleTabClick = (sectionId) => {
    setActiveTabId(sectionId);
    const targetEl = sectionRefs.current[sectionId];
    if (targetEl && scrollContainerRef.current) {
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const targetTop = targetEl.getBoundingClientRect().top;
      const offset = targetTop - containerTop + scrollContainerRef.current.scrollTop - 4;
      scrollContainerRef.current.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
  };

  // Scrollspy: update active bottom tab based on scroll position
  const handleScroll = () => {
    if (searchQuery || !scrollContainerRef.current) return;
    const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
    
    // Check recent first
    if (recentEmojis.length > 0 && sectionRefs.current['recent']) {
      const rect = sectionRefs.current['recent'].getBoundingClientRect();
      if (rect.bottom > containerTop + 20) {
        setActiveTabId('recent');
        return;
      }
    }

    for (const sec of FULL_FB_EMOJI_SECTIONS) {
      const el = sectionRefs.current[sec.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= containerTop + 40 && rect.bottom > containerTop + 20) {
          setActiveTabId(sec.id);
          break;
        }
      }
    }
  };

  const handlePickEmoji = (emoji, iso = null) => {
    const updatedRecents = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 18);
    setRecentEmojis(updatedRecents);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updatedRecents));
    } catch {
      // Ignore
    }
    onSelect?.(emoji, iso);
  };

  // Filter emojis if searching
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results = [];

    // Search country flags
    for (const flag of COUNTRY_FLAGS) {
      if (flag.name.toLowerCase().includes(q) || flag.iso.includes(q)) {
        results.push({ isFlag: true, flag });
      }
    }

    for (const sec of FULL_FB_EMOJI_SECTIONS) {
      if (sec.emojis) {
        for (const emoji of sec.emojis) {
          if (!results.some(r => r.code === emoji || r === emoji)) {
            results.push(emoji);
          }
        }
      }
    }
    return results;
  }, [searchQuery]);

  return (
    <div className="fb-emoji-picker-popover" ref={popoverRef} role="dialog" aria-label="Bảng chọn Emoji Facebook">
      {/* 1. Header Search Bar */}
      <div className="fb-emoji-header">
        <div className="fb-emoji-search-wrap">
          <Search size={14} className="fb-emoji-search-icon" />
          <input
            type="text"
            className="fb-emoji-search-input"
            placeholder="Tìm kiếm biểu tượng (Việt Nam, cười, tim, chó, mèo...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              className="fb-emoji-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Unified Continuous Scroll Body (Shows ALL categories) */}
      <div
        className="fb-emoji-body"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {searchQuery ? (
          <div>
            <span className="fb-emoji-section-title">Kết quả tìm kiếm</span>
            <div className="fb-emoji-grid">
              {filteredEmojis?.map((item, idx) => {
                if (item.isFlag) {
                  return (
                    <button
                      key={`search-flag-${idx}`}
                      type="button"
                      className="fb-emoji-item fb-flag-item"
                      onClick={() => handlePickEmoji(item.flag.code, item.flag.iso)}
                      title={item.flag.name}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${item.flag.iso}.png`}
                        alt={item.flag.name}
                        className="fb-flag-img"
                        loading="lazy"
                      />
                    </button>
                  );
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    className="fb-emoji-item"
                    onClick={() => handlePickEmoji(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Recent Section */}
            {recentEmojis.length > 0 && (
              <div
                className="fb-emoji-section"
                ref={(el) => (sectionRefs.current['recent'] = el)}
              >
                <span className="fb-emoji-section-title">Đã dùng gần đây</span>
                <div className="fb-emoji-grid">
                  {recentEmojis.map((em, idx) => {
                    const matchedFlag = COUNTRY_FLAGS.find(f => f.code === em);
                    if (matchedFlag) {
                      return (
                        <button
                          key={`recent-${idx}`}
                          type="button"
                          className="fb-emoji-item fb-flag-item"
                          onClick={() => handlePickEmoji(em, matchedFlag.iso)}
                          title={matchedFlag.name}
                        >
                          <img
                            src={`https://flagcdn.com/w40/${matchedFlag.iso}.png`}
                            alt={matchedFlag.name}
                            className="fb-flag-img"
                            loading="lazy"
                          />
                        </button>
                      );
                    }
                    return (
                      <button
                        key={`recent-${idx}`}
                        type="button"
                        className="fb-emoji-item"
                        onClick={() => handlePickEmoji(em)}
                      >
                        {em}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Emoji Categories */}
            {FULL_FB_EMOJI_SECTIONS.map((sec) => {
              if (sec.isFlags) {
                return (
                  <div
                    key={sec.id}
                    className="fb-emoji-section"
                    ref={(el) => (sectionRefs.current[sec.id] = el)}
                  >
                    <span className="fb-emoji-section-title">{sec.name}</span>
                    <div className="fb-emoji-grid">
                      {/* Priority Vietnam Flag First! */}
                      {COUNTRY_FLAGS.map((flag) => (
                        <button
                          key={flag.iso}
                          type="button"
                          className="fb-emoji-item fb-flag-item"
                          onClick={() => handlePickEmoji(flag.code, flag.iso)}
                          title={flag.name}
                        >
                          <img
                            src={`https://flagcdn.com/w40/${flag.iso}.png`}
                            alt={flag.name}
                            className="fb-flag-img"
                            loading="lazy"
                          />
                        </button>
                      ))}

                      {OTHER_FLAGS.map((em, idx) => (
                        <button
                          key={`other-flag-${idx}`}
                          type="button"
                          className="fb-emoji-item"
                          onClick={() => handlePickEmoji(em)}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={sec.id}
                  className="fb-emoji-section"
                  ref={(el) => (sectionRefs.current[sec.id] = el)}
                >
                  <span className="fb-emoji-section-title">{sec.name}</span>
                  <div className="fb-emoji-grid">
                    {sec.emojis.map((em, idx) => (
                      <button
                        key={`${sec.id}-${idx}`}
                        type="button"
                        className="fb-emoji-item"
                        onClick={() => handlePickEmoji(em)}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 3. Bottom Category Navigation Tabs (Facebook / Apple style) */}
      {!searchQuery && (
        <div className="fb-emoji-bottom-bar">
          {recentEmojis.length > 0 && (
            <button
              type="button"
              className={`fb-emoji-nav-btn ${activeTabId === 'recent' ? 'is-active' : ''}`}
              onClick={() => handleTabClick('recent')}
              onMouseEnter={() => setTooltipText('Đã dùng gần đây')}
              onMouseLeave={() => setTooltipText('')}
              title="Đã dùng gần đây"
            >
              <Clock size={16} />
            </button>
          )}

          {FULL_FB_EMOJI_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTabId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`fb-emoji-nav-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => handleTabClick(sec.id)}
                onMouseEnter={() => setTooltipText(sec.name)}
                onMouseLeave={() => setTooltipText('')}
                title={sec.name}
              >
                <Icon size={16} />
              </button>
            );
          })}

          {tooltipText && (
            <div className="fb-emoji-hover-tooltip">
              {tooltipText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
