"""Export genuine handwriting from the three owner-supplied PDFs without redrawing content."""
from pathlib import Path
import hashlib
import json
import pymupdf
from PIL import Image

source = Path(r'C:\Users\ADMIN\Downloads\Download\Anh')
frontend = Path(__file__).resolve().parents[1]
output = frontend / 'public/images/courses/notes'
output.mkdir(parents=True, exist_ok=True)
files = sorted(source.glob('*.pdf'))
selections = [
    ('input-output', files[0], 3, (15, 205, 825, 775)),
    ('elasticity', files[1], 2, (15, 0, 825, 550)),
    ('stationary-points', files[2], 2, (15, 320, 825, 835)),
    ('lagrange', files[2], 5, (10, 675, 832, 1191))
]
report = []
for name, path, number, bounds in selections:
    document = pymupdf.open(path)
    page = document[number-1]
    for suffix, clip, scale in [('page', page.rect, 1.8), ('preview', pymupdf.Rect(bounds), 1.6)]:
        pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale),clip=clip,alpha=False)
        image = Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
        image.thumbnail((1600,2300) if suffix == 'page' else (1100,900),Image.Resampling.LANCZOS)
        temporary=output/f'{name}-{suffix}.tmp'
        image.save(temporary,'WEBP',quality=94,method=6)
        temporary.replace(output/f'{name}-{suffix}.webp')
    report.append({'id':name,'source':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'page':number,'crop_points':list(bounds),'preview':f'{name}-preview.webp','full_page':f'{name}-page.webp'})
(output/'sources.json').write_text(json.dumps({'sources':report},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'pages':len(report),'bytes':sum(path.stat().st_size for path in output.glob('*.webp'))}))
