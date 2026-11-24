import json
import sys
from pathlib import Path
import pymupdf

root = Path(__file__).resolve().parents[1] / 'public/docs'
sys.stdout.reconfigure(encoding='utf-8')
for name in ['K51_2_dot.pdf', 'DE_THI_CHINH/FINAL_2807_1.pdf']:
    with pymupdf.open(root / name) as document:
        print(json.dumps({'file': name, 'pages': len(document)}))
        for index, page in enumerate(document):
            text = page.get_text()
            if index < 24 and any(term in text for term in ['Câu 1.', 'Câu 1:', 'Câu 1 ', 'Câu1.', 'Câu1:']):
                print(json.dumps({'page': index + 1, 'header': text[:250]}, ensure_ascii=False))
