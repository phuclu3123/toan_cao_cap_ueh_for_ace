const ALLOWED_HTML_TAGS = new Set([
  'a', 'annotation', 'blockquote', 'br', 'code', 'div', 'em', 'figcaption',
  'figure', 'font', 'g', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'li', 'math',
  'menclose', 'mfrac', 'mi', 'mn', 'mo', 'mover', 'mpadded', 'mroot', 'mrow',
  'mspace', 'msqrt', 'msub', 'msubsup', 'msup', 'mtable', 'mtd', 'mtext',
  'mtr', 'munder', 'munderover', 'ol', 'p', 'path', 'pre', 's', 'semantics',
  'span', 'strong', 'sub', 'sup', 'svg', 'table', 'tbody', 'td', 'text', 'th',
  'thead', 'tr', 'tspan', 'u', 'ul', 'circle', 'ellipse', 'line', 'polygon',
  'polyline', 'rect'
]);

const BLOCKED_HTML_TAGS = new Set([
  'base', 'embed', 'iframe', 'link', 'meta', 'object', 'script', 'style'
]);

const SVG_PRESENTATION_ATTRIBUTES = new Set([
  'fill', 'fill-opacity', 'font-family', 'font-size', 'font-style', 'font-weight',
  'opacity', 'stroke', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'stroke-opacity', 'stroke-width', 'text-anchor', 'transform'
]);

const ALLOWED_STYLE_PROPERTIES = new Set([
  'background-color', 'border-color', 'border-style', 'border-width', 'color',
  'font-size', 'font-style', 'font-weight', 'height', 'line-height', 'margin',
  'margin-left', 'margin-right', 'padding', 'text-align', 'text-decoration',
  'top', 'transform', 'vertical-align', 'width'
]);

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const sanitizeUrl = (value, { allowImageData = false } = {}) => {
  const candidate = String(value || '').trim();
  if (!candidate) return '';
  if (allowImageData && /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(candidate)) {
    return candidate;
  }

  try {
    const baseUrl = typeof window === 'undefined' ? 'https://toancaocapueh.id.vn/' : window.location.origin;
    const parsed = new URL(candidate, baseUrl);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? candidate : '';
  } catch {
    return '';
  }
};

const sanitizeStyle = (value) => String(value || '')
  .split(';')
  .map((declaration) => declaration.trim())
  .filter(Boolean)
  .filter((declaration) => {
    const separator = declaration.indexOf(':');
    if (separator < 1) return false;
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const styleValue = declaration.slice(separator + 1);
    return ALLOWED_STYLE_PROPERTIES.has(property)
      && !/(?:url|expression|@import)\s*\(/i.test(styleValue);
  })
  .join('; ');

export const sanitizeHtml = (rawHtml) => {
  if (typeof document === 'undefined') return escapeHtml(rawHtml);

  const template = document.createElement('template');
  template.innerHTML = String(rawHtml || '');

  for (const element of [...template.content.querySelectorAll('*')]) {
    const tagName = element.tagName.toLowerCase();
    if (!ALLOWED_HTML_TAGS.has(tagName)) {
      if (BLOCKED_HTML_TAGS.has(tagName)) element.remove();
      else element.replaceWith(...element.childNodes);
      continue;
    }

    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const globallyAllowed = name === 'class'
        || name === 'title'
        || name === 'role'
        || name === 'aria-hidden'
        || name === 'aria-label';
      const tagAllowed = (tagName === 'a' && ['href', 'target', 'rel'].includes(name))
        || (tagName === 'img' && ['src', 'alt', 'width', 'height', 'loading'].includes(name))
        || (tagName === 'font' && ['color', 'face', 'size'].includes(name))
        || (tagName === 'annotation' && name === 'encoding')
        || (tagName === 'svg' && ['viewbox', 'width', 'height', 'preserveaspectratio', 'xmlns'].includes(name))
        || (tagName === 'path' && name === 'd')
        || (tagName === 'circle' && ['cx', 'cy', 'r'].includes(name))
        || (tagName === 'ellipse' && ['cx', 'cy', 'rx', 'ry'].includes(name))
        || (tagName === 'line' && ['x1', 'x2', 'y1', 'y2'].includes(name))
        || (['polygon', 'polyline'].includes(tagName) && name === 'points')
        || (tagName === 'rect' && ['height', 'rx', 'ry', 'width', 'x', 'y'].includes(name))
        || (['text', 'tspan'].includes(tagName) && ['dx', 'dy', 'x', 'y'].includes(name))
        || SVG_PRESENTATION_ATTRIBUTES.has(name);

      if (name.startsWith('on') || (!globallyAllowed && !tagAllowed && name !== 'style')) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (name === 'href') {
        const safeUrl = sanitizeUrl(attribute.value);
        if (safeUrl) element.setAttribute('href', safeUrl);
        else element.removeAttribute(attribute.name);
      } else if (name === 'src') {
        const safeUrl = sanitizeUrl(attribute.value, { allowImageData: true });
        if (safeUrl) element.setAttribute('src', safeUrl);
        else element.removeAttribute(attribute.name);
      } else if (name === 'style') {
        const safeStyle = sanitizeStyle(attribute.value);
        if (safeStyle) element.setAttribute('style', safeStyle);
        else element.removeAttribute(attribute.name);
      } else if (SVG_PRESENTATION_ATTRIBUTES.has(name) && /(?:url|expression)\s*\(/i.test(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }

    if (tagName === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }

  return template.innerHTML;
};
