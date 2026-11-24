"""Print the printed page number of each quote in a PDF with a text layer.

Usage: python find_pages.py <book.pdf> "quote one" "quote two" ...
The printed number is the page's label when the PDF has labels, else the most likely number in the
page's first or last lines; the PDF index is shown too.
"""
import re
import sys

import pymupdf

book = pymupdf.open(sys.argv[1])
pages = [(i, re.sub(r"\s+", " ", p.get_text())) for i, p in enumerate(book)]


def printed(i):
    label = book[i].get_label()
    if label:
        return label
    lines = [l.strip() for l in book[i].get_text().splitlines() if l.strip()]
    edge = lines[:3] + lines[-3:]
    numbers = [m for l in edge for m in re.findall(r"(?:^|\s)(\d{1,3})(?:\s|$)", l)]
    return numbers[0] if numbers else "?"


for quote in sys.argv[2:]:
    q = re.sub(r"\s+", " ", quote).lower()
    hits = [i for i, text in pages if q in text.lower()]
    print(f"{quote[:50]!r}: " + (", ".join(f"p. {printed(i)} (pdf {i + 1})" for i in hits[:3]) or "not found"))
