"""Rename presentation copy only; preserve routes, storage keys and original documents."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
paths = []
for folder in ('components', 'pages'):
    paths.extend((root / 'src' / folder).rglob('*.jsx'))
paths += [root / 'src/utils/translations.js', root / 'src/utils/securityGuard.js', root / 'index.html', root / 'scripts/generate-course-artwork.mjs']
for path in paths:
    before = path.read_text(encoding='utf-8')
    after = before.replace('UEH TCC', 'α∫M4A').replace('TCC UEH', 'α∫M4A')
    if path.name == 'Navbar.jsx':
        after = after.replace('<span className="logo-symbol" aria-hidden="true" />', '')
        after = after.replace('<span className="logo-helper">UEH</span>\n              <span className="logo-main">TCC</span>', '<span className="brand-wordmark">α∫M4A</span>')
    if path.name == 'Footer.jsx':
        after = after.replace('<span className="logo-helper">UEH</span><span className="logo-main">TCC</span>', '<span className="brand-wordmark">α∫M4A</span>')
    if path.name == 'BrandLoader.jsx':
        after = after.replace('<span>UEH</span>\n          <span>TCC</span>', '<span className="brand-wordmark">α∫M4A</span>')
    if path.name == 'CourseEnrollmentModal.jsx':
        after = after.replace('>UEH <span>TCC</span></div>', '><span className="brand-wordmark">α∫M4A</span></div>')
    if path.name == 'index.html':
        after = after.replace('<title>Toán Cao Cấp UEH - Hỗ Trợ Học Tập & Tài Liệu TCC</title>', '<title>α∫M4A — Học để hiểu</title>')
        after = after.replace('<span>UEH</span><span>TCC</span>', '<span>α∫M4A</span>')
    after = after.replace('<span className="brand-wordmark">α∫M4A</span>', '<span className="brand-wordmark"><span className="brand-math">α∫</span>M4A</span>')
    if after != before:
        path.write_text(after, encoding='utf-8', newline='')
print('Updated display branding; internal identifiers and original materials preserved.')
