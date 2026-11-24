"""Create preview images from the bundled midterm sources; keep provenance."""
import hashlib
import json
from pathlib import Path
import pymupdf
from PIL import Image

frontend = Path(__file__).resolve().parents[1]
output = frontend / 'public/images/exams/midterm'
output.mkdir(parents=True, exist_ok=True)
sources = [('pnta', 'pnta.pdf', 1), ('gk-dna', 'GK_DNA/1c90828a-976e-4a2d-9e5a-c8c79000ce75.jpg', 1), ('ntv', 'c123.pdf', 1), ('ntvv', 'BT_NTV.pdf', 2)]
metadata = {}
for identifier, filename, number in sources:
    source = frontend / 'public/docs' / filename
    if source.suffix.lower() == '.pdf':
        with pymupdf.open(source) as document:
            page = document[number-1]
            clip = pymupdf.Rect(28, 24, page.rect.width-28, page.rect.height*.64)
            pixels = page.get_pixmap(matrix=pymupdf.Matrix(2,2), clip=clip, alpha=False)
            image = Image.frombytes('RGB', (pixels.width, pixels.height), pixels.samples)
            total_pages = len(document)
    else:
        image = Image.open(source).convert('RGB')
        image = image.crop((0,0,image.width,int(image.height*.64)))
        total_pages = None
    image.thumbnail((1100,1050), Image.Resampling.LANCZOS)
    target = output / f'{identifier}.webp'
    temporary = target.with_suffix('.tmp')
    image.save(temporary,'WEBP',quality=90,method=6)
    temporary.replace(target)
    metadata[identifier] = {'image':f'/images/exams/midterm/{identifier}.webp','source':f'/docs/{filename}','page':number,'pages':total_pages,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()}
(output / 'sources.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
target = frontend / 'src/data/midtermPreviewData.js'
temporary = target.with_suffix('.tmp')
temporary.write_text('// Generated from bundled document sources; ndt is awaiting source correction.\nexport const midtermPreviewData = '+json.dumps(metadata,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
temporary.replace(target)
print(json.dumps({'previews':len(metadata),'bytes':sum(p.stat().st_size for p in output.glob('*.webp'))}))
