"""OCR a scanned PDF to text, one "=== page N ===" block per page, so a page's image can be looked at later.

Usage: python ocr_book.py <book.pdf> <out.txt>
Resumes: pages already in out.txt are skipped, so a long book can be run in pieces.
"""
import re
import sys

import pymupdf
from rapidocr_onnxruntime import RapidOCR

pdf, out = sys.argv[1], sys.argv[2]
try:
    done = {int(n) for n in re.findall(r"^=== page (\d+) ===$", open(out, encoding="utf-8").read(), re.M)}
except FileNotFoundError:
    done = set()

COLUMN_GAP = 40  # px at 150 dpi: lines whose left edges are this close share a column


def reading_order(result):
    """Results come as [box, text, score]. Book pages run in columns: group lines by left edge,
    read the columns left to right, each top to bottom (sorting by height alone interleaves them)."""
    columns = []
    for r in sorted(result, key=lambda r: r[0][0][0]):
        if columns and r[0][0][0] - columns[-1][0] < COLUMN_GAP:
            columns[-1][1].append(r)
        else:
            columns.append([r[0][0][0], [r]])
        columns[-1][0] = r[0][0][0]
    return [r for _, rows in columns for r in sorted(rows, key=lambda r: r[0][0][1])]


ocr = RapidOCR()
book = pymupdf.open(pdf)
with open(out, "a", encoding="utf-8") as f:
    for i, page in enumerate(book, start=1):
        if i in done:
            continue
        # 150 dpi reads book type well; higher only slows it down.
        image = page.get_pixmap(dpi=150).tobytes("png")
        result, _ = ocr(image)
        f.write(f"=== page {i} ===\n" + "\n".join(r[1] for r in reading_order(result or [])) + "\n")
        f.flush()
        print(f"page {i}/{len(book)}", flush=True)
