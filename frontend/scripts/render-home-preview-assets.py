"""Crop requested genuine PDF/video/discussion sources into cached homepage assets."""
import hashlib
import json
import re
from pathlib import Path

import pymupdf
from PIL import Image

frontend = Path(__file__).resolve().parents[1]
source_dir = frontend.parent / 'artifacts/color-refinement/media'
output = frontend / 'public/images/home'
output.mkdir(parents=True, exist_ok=True)
pdf_path = frontend / 'public/docs/K51_2_dot.pdf'
manifest = {'sources': []}

def save(image, name):
    image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
    temporary = output / (name + '.tmp')
    image.convert('RGB').save(temporary, 'WEBP', quality=90, method=6)
    temporary.replace(output / name)

with pymupdf.open(pdf_path) as document:
    for number, code in [(5, '204'), (8, '118'), (11, '354')]:
        page = document[number - 1]
        next_question = next((block[1] for block in page.get_text('blocks') if re.sub(r'\s+', '', block[4]).startswith('Câu2.')), 435)
        clip = pymupdf.Rect(48, 55, 547, next_question - 12)
        pixels = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=clip, alpha=False)
        image = Image.frombytes('RGB', (pixels.width, pixels.height), pixels.samples)
        name = f'exam-k51-{code}.webp'
        save(image, name)
        manifest['sources'].append({'asset': name, 'pdf': '/docs/K51_2_dot.pdf', 'page': number, 'crop_points': list(clip), 'sha256': hashlib.sha256(pdf_path.read_bytes()).hexdigest()})

video = Image.open(source_dir / 'lesson-video-frame.png')
crop = (200, 155, 795, 535)
save(video.crop(crop), 'lesson-matrix-video.webp')
manifest['sources'].append({'asset': 'lesson-matrix-video.webp', 'video': 'https://www.youtube.com/watch?v=ut-WxyDjtPQ', 'seconds': 240, 'crop_pixels': crop, 'original_size': video.size})

discussion = Image.open(source_dir / 'community-question.png')
crop = (0, 0, discussion.width, discussion.height)
save(discussion.crop(crop), 'community-lagrange.webp')
manifest['sources'].append({'asset': 'community-lagrange.webp', 'page': '/community/ueh-pnta-lagrange-cobb-douglas', 'selector': '.se-detail-header-block and #question-section', 'crop_pixels': crop})
(output / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'assets': [entry['asset'] for entry in manifest['sources']], 'bytes': sum(path.stat().st_size for path in output.glob('*.webp'))}))
