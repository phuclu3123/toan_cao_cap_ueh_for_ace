import pypdf

def extract_pdf_text(pdf_path, output_txt_path):
    print(f"Extracting {pdf_path} to {output_txt_path}...")
    reader = pypdf.PdfReader(pdf_path)
    with open(output_txt_path, 'w', encoding='utf-8') as f:
        for i, page in enumerate(reader.pages):
            f.write(f"\n--- PAGE {i+1} ---\n")
            text = page.extract_text()
            if text:
                f.write(text)
    print("Done!")

extract_pdf_text('original_backup/main.pdf', 'main_extracted.txt')
extract_pdf_text('original_backup/final 2807.pdf', 'final_2807_extracted.txt')
