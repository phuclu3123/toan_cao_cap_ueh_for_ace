"""Publish the supplied non-video midterm sources without editing their contents."""
from pathlib import Path
import hashlib
import json
import shutil
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'artifacts/midterm-import-20261125'
DOCS = ROOT / 'frontend/public/docs'
manifest = json.loads((BASE / 'manifest.json').read_text(encoding='utf-8-sig'))
by_index = {item['index']: item for item in manifest}
provenance = []

def attachment(index, slug, title, kind='exam', cohort=None, note=None, reuse=None, original_index=None):
    source = by_index[index]
    original = ROOT / source['path']
    is_word = source['extension'] == '.docx'
    readable = BASE / 'converted' / f'{index:02}.pdf' if is_word else original
    relative = reuse or f'midterm/{slug}.pdf'
    target = DOCS / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if not reuse:
        shutil.copyfile(readable, target)
    with pymupdf.open(target) as pdf:
        pages = len(pdf)
    item = {'id':slug.replace('/', '-'), 'title':title, 'pdf':relative, 'pages':pages, 'kind':kind}
    word_index = index if is_word else original_index
    if word_index is not None:
        word_relative = f'midterm/{slug}.docx'
        shutil.copyfile(ROOT / by_index[word_index]['path'], DOCS / word_relative)
        item['original'] = word_relative
    if cohort:
        item['cohort'] = cohort
    if note:
        item['note'] = note
    provenance.append({'source':source['source'], 'sourceSha256':source['sha256'], 'published':relative,
                       'publishedSha256':hashlib.sha256(target.read_bytes()).hexdigest(),
                       'conversion':'Word to PDF' if is_word else 'Original PDF',
                       **({'originalWordSource':by_index[word_index]['source'], 'originalWord':item['original']} if word_index is not None else {})})
    return item

groups = []
def group(identifier, name, image, description, files, note=None):
    entry = {'id':identifier,'title':f'Đề giữa kỳ — {name}', 'professor':identifier,
             'professorName':name,'image':image,'pdf':files[0]['pdf'],'desc':description,
             'category':'midterm','categoryLabel':'Đề giữa kỳ','date':'25/11/2026',
             'sourceStatus':'ready','sourceRevision':'20261125','attachments':files}
    if note:
        entry['note'] = note
    groups.append(entry)

correction = 'Tài liệu nguồn có bản đính chính riêng cho bài m = 4. Khi đối chiếu lời giải, ưu tiên bản đính chính trong bộ này.'
group('ndt','Thầy Nguyễn Đình Tuấn','ndt.png','Các đề giữa kỳ, bài sửa và bản đính chính bài m = 4.',[
    attachment(19,'ndt/dinh-chinh-m-4','Đính chính lời giải bài m = 4','solution',original_index=21),
    attachment(15,'ndt/de-02-04','Đề mới thi 02/04 và gợi ý giải',note='Gợi ý giải tham khảo được giữ nguyên theo tài liệu nguồn.'),
    attachment(1,'ndt/de-toan-gk','Đề toán giữa kỳ thầy Tuấn'),
    attachment(4,'ndt/de-3','Đề 3 giữa kỳ'),
    attachment(24,'ndt/de-4','Đề 4 giữa kỳ'),
    attachment(25,'ndt/giua-ky-linhhh','Đề và ghi chép giữa kỳ — LINHHH'),
    attachment(11,'ndt/them-de','Đề bổ sung'),
    attachment(9,'ndt/cau-he-phuong-trinh','Câu hệ phương trình — đề cuối','solution',note=correction),
],correction)
group('ntv','Thầy Ngô Trấn Vũ','ntv.jpg','Đề K50, K51 và các câu bổ sung K52, kèm phần lời giải có trong nguồn.',[
    attachment(22,'ntv/k51','Đề K51 và ghi chú đáp án',cohort='K51',note='Nguồn ghi rõ câu 7 chưa có đáp án. Giữ nguyên ghi chú này; không bổ sung đáp án suy đoán.'),
    attachment(16,'ntv/k50','Đề K50 và ghi chú đáp án',cohort='K50'),
    attachment(18,'ntv/k52-02-11','Hai câu bổ sung K52 — 02/11 và lời giải',cohort='K52'),
    attachment(12,'ntv/k52-10-11-2026','Câu 7 — K52, 10/11/2026',cohort='K52',note='Bản nguồn chỉ có ảnh câu 7, không phải toàn bộ đề.'),
])
group('pnta','Thầy Phan Ngô Tuấn Anh','pnta.jpg','Đề mới K51 và bộ đề giữa kỳ đang có.',[
    attachment(13,'pnta/k51','Đề mới K51',cohort='K51'),
    attachment(20,'pnta/bo-de','Bộ đề giữa kỳ',reuse='pnta.pdf'),
])
group('ntvv','Thầy Thanh Vân','ntvv.jpg','Tài liệu giữa kỳ được bổ sung và bài tập theo chương để ôn thêm.',[
    attachment(23,'thanh-van/anh-van','Tài liệu giữa kỳ — Anh Vân'),
    {'id':'thanh-van-bai-tap','title':'Bài tập theo chương (tài liệu đã có)','pdf':'BT_NTV.pdf','pages':len(pymupdf.open(DOCS/'BT_NTV.pdf')),'kind':'practice'},
])
group('gk-lxt','Thầy Lê Xuân Trường','c123.jpg','Hai tài liệu giữa kỳ từ bộ đề được cung cấp.',[
    attachment(17,'lxt/gk','Tài liệu giữa kỳ — GK'),
    attachment(8,'lxt/lxt','Đề giữa kỳ — LXT',reuse='GK/Le_Xuan_Truong.pdf'),
])
group('gk-nhan','Thầy Nhân','c123.jpg','Tài liệu giữa kỳ được giữ nguyên từ bản Word cung cấp.',[
    attachment(6,'nhan/giua-ky','Tài liệu giữa kỳ — Thầy Nhân'),
])
group('gk-ngoc-y','Thầy Ngọc Ý','c123.jpg','Tài liệu giữa kỳ được giữ nguyên từ bản Word cung cấp.',[
    attachment(14,'ngoc-y/giua-ky','Tài liệu giữa kỳ — Thầy Ngọc Ý'),
])
tgt_relative='midterm/tgt/loi-giai-viet-tay.pdf'
(DOCS/tgt_relative).parent.mkdir(parents=True,exist_ok=True)
shutil.copyfile(BASE/'converted/tgt.pdf', DOCS/tgt_relative)
group('gk-tgt','Thầy Trần Gia Tùng','c123.jpg','Năm trang ảnh ghi chép lời giải viết tay, sắp theo thứ tự câu 1–6.',[
    {'id':'tgt-loi-giai','title':'Ghi chép lời giải viết tay — câu 1–6','pdf':tgt_relative,'pages':5,'kind':'solution'},
])
for page,index in enumerate([3,0,7,2,10],1):
    source=by_index[index]
    provenance.append({'source':source['source'],'sourceSha256':source['sha256'],'published':tgt_relative,'page':page,'conversion':'Original image placed on PDF page without cropping'})
group('gk-dna','Thầy Sáng','c123.jpg','Hai ảnh đề giữa kỳ đã có trong thư viện.',[
    {'id':'sang-1','title':'Ảnh đề giữa kỳ — trang 1','pdf':'GK_DNA/1c90828a-976e-4a2d-9e5a-c8c79000ce75.jpg','kind':'exam'},
    {'id':'sang-2','title':'Ảnh đề giữa kỳ — trang 2','pdf':'GK_DNA/7263a874-0e17-4652-8e86-500a3dac4c13.jpg','kind':'exam'},
])
catalog=ROOT/'frontend/src/data/midtermCatalog.json'
catalog.write_text(json.dumps(groups,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
data_file=ROOT/'frontend/src/data/documentsData.js'
content=data_file.read_text(encoding='utf-8')
start=content.index('export const midtermExams = ')
end=content.index('export const finalExams',start)
content=content[:start]+'export const midtermExams = midtermCatalog;\n\n'+content[end:]
if not content.startswith("import midtermCatalog"):
    content="import midtermCatalog from './midtermCatalog.json';\n\n"+content
data_file.write_text(content,encoding='utf-8')
backend=ROOT/'backend/data/resources.json'
resources=json.loads(backend.read_text(encoding='utf-8-sig'))
resources['midtermExams']=groups
backend.write_text(json.dumps(resources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
audit={'archive':'ĐỀ GIỮA KỲ MỘT SỐ THẦY-20261125T093951Z-1-001.zip','importedOn':'2026-11-25',
       'excluded':'Both MP4 files and the DOCX containing only a video link, as requested by the owner.',
       'sources':provenance}
(ROOT/'docs/midterm-sources-20261125.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'groups':len(groups),'documents':sum(len(g['attachments']) for g in groups),'sourceFiles':len(provenance)},ensure_ascii=False))
