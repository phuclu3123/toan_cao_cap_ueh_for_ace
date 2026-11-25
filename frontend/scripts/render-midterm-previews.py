"""Create preview images from the bundled midterm sources; keep provenance."""
import hashlib
import json
from pathlib import Path
import pymupdf
from PIL import Image

frontend = Path(__file__).resolve().parents[1]
output = frontend / 'public/images/exams/midterm'
output.mkdir(parents=True, exist_ok=True)
catalog = json.loads((frontend / 'src/data/midtermCatalog.json').read_text(encoding='utf-8'))
sources = [(item['id'], item['pdf'], 1) for item in catalog]
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
temporary.write_text('// Generated from the curated midterm catalog and bundled source files.\nexport const midtermPreviewData = '+json.dumps(metadata,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
temporary.replace(target)
print(json.dumps({'previews':len(metadata),'bytes':sum(p.stat().st_size for p in output.glob('*.webp'))}))
