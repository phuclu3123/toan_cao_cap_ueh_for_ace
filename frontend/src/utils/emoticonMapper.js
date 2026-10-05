/**
 * Official Facebook / Messenger Emoticon & Shortcut Mapping Table
 */
export const FACEBOOK_EMOTICON_MAP = [
  // Hearts & Love
  { patterns: ['<3', '&lt;3', '(heart)'], emoji: '❤️' },
  { patterns: ['</3', '&lt;/3', '(brokenheart)'], emoji: '💔' },
  { patterns: [':*', ':-*', '(kiss)'], emoji: '😘' },

  // Smileys & Expressions
  { patterns: [':)', ':-)', ':]', '=)'], emoji: '🙂' },
  { patterns: [':D', ':-D', '=D', ':d', ':-d'], emoji: '😀' },
  { patterns: [':3', ':-3'], emoji: '😺' },
  { patterns: [';)', ';-)'], emoji: '😉' },
  { patterns: [':P', ':-P', ':p', ':-p', '=P', '=p'], emoji: '😛' },
  { patterns: [':O', ':-O', ':o', ':-o'], emoji: '😮' },
  { patterns: [':(', ':-(', ':[', '=('], emoji: '🙁' },
  { patterns: [":'(", ":'-(", ":'c", ":'-c"], emoji: '😢' },
  { patterns: ['-_-', '-__-'], emoji: '😑' },
  { patterns: ['^_^', '^^'], emoji: '😊' },
  { patterns: ['>_<', '&gt;_&lt;', '>.<'], emoji: '😣' },
  { patterns: ['B)', 'B-)', '8)', '8-)'], emoji: '😎' },
  { patterns: ['o_O', 'O_o', 'o.O', 'O.o'], emoji: '😳' },
  { patterns: ['3:)', '3:-)', '(devil)'], emoji: '😈' },
  { patterns: ['O:)', 'O:-)', 'o:)', '(angel)'], emoji: '😇' },
  { patterns: ['>:o', '>:O', '&gt;:o', '&gt;:O', '>:-(', '&gt;:-('], emoji: '😡' },
  { patterns: [':v', ':-v', ':V', ':-V'], emoji: '✌️' },

  // Facebook Special Action Shortcuts
  { patterns: ['(y)', '(Y)', '(like)'], emoji: '👍' },
  { patterns: ['(n)', '(N)', '(dislike)'], emoji: '👎' },
  { patterns: ['(clap)'], emoji: '👏' },
  { patterns: ['(pray)'], emoji: '🙏' },
  { patterns: ['(fire)', '(hot)'], emoji: '🔥' },
  { patterns: ['(100)'], emoji: '💯' },
  { patterns: ['(star)'], emoji: '⭐' },
  { patterns: ['(sparkle)', '(sparkles)'], emoji: '✨' },
  { patterns: ['(c)', '(C)'], emoji: '©' },
  { patterns: ['(r)', '(R)'], emoji: '®' },
  { patterns: ['(tm)', '(TM)'], emoji: '™' }
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace emoticons in text while strictly preserving math ($...$ and $$...$$) and code blocks.
 */
export function replaceEmoticons(text) {
  if (!text || typeof text !== 'string') return text || '';

  // Split by LaTeX math, HTML tags and code blocks
  const tokenRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n\r]+?\$|```[\s\S]*?```|`[^`]+`|<[^>]+>)/g;
  const parts = text.split(tokenRegex);

  for (let i = 0; i < parts.length; i += 2) {
    let segment = parts[i];
    if (!segment) continue;

    for (const item of FACEBOOK_EMOTICON_MAP) {
      for (const pattern of item.patterns) {
        const escaped = escapeRegex(pattern);
        const regex = new RegExp('(^|[\\s\\(\\[{])' + escaped + '(?=[\\s\\)\\]},.!?;:]|$)', 'g');
        segment = segment.replace(regex, (match, p1) => p1 + item.emoji);
      }
    }
    parts[i] = segment;
  }

  return parts.join('');
}
