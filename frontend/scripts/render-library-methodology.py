"""Prepare two faithful views of the owner's existing methodology figure."""
from pathlib import Path
from PIL import Image
import hashlib
import json

source=Path(r'C:\Users\ADMIN\OneDrive\Tài liệu\A_A_quan_trong\NCKH_CTD\paper\slides\proposed_methodology.png')
output=Path(__file__).resolve().parents[1]/'public/images/library'
output.mkdir(parents=True,exist_ok=True)
photo=Image.open(source).convert('RGB')
overview=photo.copy()
overview.thumbnail((2200,1100),Image.Resampling.LANCZOS)
overview.save(output/'methodology-overview.webp','WEBP',quality=94,method=6)
crop=(1720,420,2810,770)
detail=photo.crop(crop)
detail.save(output/'methodology-ac-detail.webp','WEBP',quality=94,method=6)
(output/'sources.json').write_text(json.dumps({'source':source.name,'source_size':photo.size,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'assets':[{'file':'methodology-overview.webp','size':overview.size},{'file':'methodology-ac-detail.webp','crop_pixels':crop,'size':detail.size}]},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'size':photo.size,'bytes':sum(path.stat().st_size for path in output.glob('*.webp'))}))
