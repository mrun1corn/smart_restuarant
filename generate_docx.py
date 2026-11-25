"""Generates 'University Project book.docx' from the SAME content as the PDF.

The content lives in generate_book.build_story(), expressed as ReportLab flowables.
This module maps those flowables onto python-docx, so the two files cannot drift:
change the text once, rebuild both.

Run: python generate_docx.py
"""

import re
import sys
from html.parser import HTMLParser

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

sys.path.insert(0, ".")
import generate_book as gb  # noqa: E402

from reportlab.platypus import (  # noqa: E402
    HRFlowable, KeepTogether, ListFlowable, PageBreak, Paragraph, Spacer, Table,
)

OUT = "University Project book.docx"

INK = RGBColor(0x0F, 0x17, 0x2A)
BODY = RGBColor(0x33, 0x41, 0x55)
MUTED = RGBColor(0x64, 0x74, 0x8B)
ACCENT = RGBColor(0x25, 0x63, 0xEB)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

# ReportLab style name -> (docx style, overrides)
STYLE_MAP = {
    "CoverT": ("Title", dict(size=27, color=INK, center=True)),
    "CoverSub": ("Subtitle", dict(size=12.5, color=ACCENT, center=True)),
    "CoverMeta": ("Normal", dict(size=10, color=MUTED, center=True)),
    "H1x": ("Heading 1", dict(size=17, color=INK)),
    "H2x": ("Heading 2", dict(size=11, color=INK)),
    "Kicker": ("Normal", dict(size=8.5, color=ACCENT, bold=True, space_before=10)),
    "Px": ("Normal", dict(size=10, color=BODY)),
    "Focus": ("Normal", dict(size=9, color=MUTED, italic=True)),
    "Small": ("Normal", dict(size=8, color=MUTED)),
    "Code": ("Code", dict(size=8)),
    "Q": ("Normal", dict(size=10, color=INK, bold=True)),
    "A": ("Normal", dict(size=10, color=BODY, indent=6)),
    "End": ("Normal", dict(size=9, color=MUTED, center=True)),
    "CT": ("Normal", dict(size=9.5, color=INK, center=True)),
    "TH": ("Normal", dict(size=8.2, color=INK)),
}


class Rich(HTMLParser):
    """Minimal inline markup reader: b/strong, i/em, font face. Avoids a regex."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.runs = []
        self.bold = self.italic = self.mono = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("b", "strong"):
            self.bold += 1
        elif tag in ("i", "em"):
            self.italic += 1
        elif tag == "font":
            if dict(attrs).get("face", "").lower().startswith("courier"):
                self.mono += 1

    def handle_endtag(self, tag):
        if tag in ("b", "strong"):
            self.bold = max(0, self.bold - 1)
        elif tag in ("i", "em"):
            self.italic = max(0, self.italic - 1)
        elif tag == "font":
            self.mono = max(0, self.mono - 1)

    def handle_data(self, data):
        if data:
            self.runs.append((data, bool(self.bold), bool(self.italic), bool(self.mono)))


def parse(text):
    text = text.replace("<br/>", "\n")
    p = Rich()
    p.feed(text)
    return p.runs or [("", False, False, False)]


def add_runs(par, text, base_size=None):
    for chunk, bold, italic, mono in parse(text):
        pieces = chunk.split("\n")
        for n, piece in enumerate(pieces):
            if n:
                par.add_run().add_break()
            if not piece:
                continue
            run = par.add_run(piece)
            run.bold = bold or None
            run.italic = italic or None
            if mono:
                run.font.name = "Consolas"
                run.font.size = Pt((base_size or 10) - 1.5)
            elif base_size:
                run.font.size = Pt(base_size)


def set_cell_bg(cell, hex_color):
    el = OxmlElement("w:shd")
    el.set(qn("w:val"), "clear")
    el.set(qn("w:fill"), hex_color)
    cell._tc.get_or_add_tcPr().append(el)


def hr(doc, color="2563EB", weight=8):
    par = doc.add_paragraph()
    par.paragraph_format.space_before = Pt(4)
    par.paragraph_format.space_after = Pt(8)
    pPr = par._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(weight))
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)
    borders.append(bottom)
    pPr.append(borders)


def emit(doc, flowable):
    if isinstance(flowable, KeepTogether):
        for inner in flowable._content:
            emit(doc, inner)
        return

    if isinstance(flowable, PageBreak):
        doc.add_page_break()
        return

    if isinstance(flowable, Spacer):
        par = doc.add_paragraph()
        par.paragraph_format.space_after = Pt(flowable.height / 3)
        return

    if isinstance(flowable, HRFlowable):
        hr(doc)
        return

    if isinstance(flowable, ListFlowable):
        ordered = str(flowable._bulletType) == "1"
        for n, item in enumerate(flowable._flowables, start=1):
            inner = item._flowables[0]
            text = inner.text if isinstance(inner, Paragraph) else str(inner)
            par = doc.add_paragraph(style="List Number" if ordered else "List Bullet")
            par.paragraph_format.space_after = Pt(4)
            add_runs(par, text)
        return

    if isinstance(flowable, Table):
        rows = len(flowable._cellvalues)
        cols = len(flowable._cellvalues[0])
        table = doc.add_table(rows=rows, cols=cols)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.style = "Table Grid"
        table.autofit = True
        for r in range(rows):
            for c in range(cols):
                cell = table.cell(r, c)
                text = flowable._cellvalues[r][c].text
                par = cell.paragraphs[0]
                par.paragraph_format.space_after = Pt(2)
                add_runs(par, text, base_size=8.5)
                if r == 0:
                    set_cell_bg(cell, "EEF2FF")
                    for run in par.runs:
                        run.bold = True
        doc.add_paragraph().paragraph_format.space_after = Pt(6)
        return

    if isinstance(flowable, Paragraph):
        name = flowable.style.name
        style_name, opts = STYLE_MAP.get(name, ("Normal", {}))
        style = doc.styles[style_name] if style_name in [s.name for s in doc.styles] else doc.styles["Normal"]
        par = doc.add_paragraph(style=style)
        text = flowable.text

        if opts.get("center"):
            par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if opts.get("italic"):
            par.paragraph_format.space_after = Pt(6)
        if "indent" in opts:
            par.paragraph_format.left_indent = Mm(opts["indent"])
        if "space_before" in opts:
            par.paragraph_format.space_before = Pt(opts["space_before"])

        add_runs(par, text, base_size=opts.get("size"))
        for run in par.runs:
            if opts.get("bold"):
                run.bold = True
            if opts.get("color"):
                run.font.color.rgb = opts["color"]
            if opts.get("size"):
                run.font.size = Pt(opts["size"])
        return


def build():
    doc = Document()

    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    sec.left_margin = sec.right_margin = Mm(22)
    sec.top_margin = Mm(24)
    sec.bottom_margin = Mm(20)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10)
    normal.font.color.rgb = BODY
    normal.paragraph_format.space_after = Pt(6)

    for name, size, color in (("Heading 1", 17, INK), ("Heading 2", 11, INK)):
        st = doc.styles[name]
        st.font.name = "Calibri"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = color
        st.paragraph_format.space_before = Pt(10)
        st.paragraph_format.space_after = Pt(4)

    code = doc.styles.add_style("Code", 1)
    code.font.name = "Consolas"
    code.font.size = Pt(8)
    code.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    code.paragraph_format.space_after = Pt(8)
    code.paragraph_format.line_spacing = 1.15

    # footer with page numbers
    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run("Page ")
    run.font.size = Pt(8)
    run.font.color.rgb = MUTED
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    footer._p.append(fld)

    for flowable in gb.build_story():
        emit(doc, flowable)

    doc.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
