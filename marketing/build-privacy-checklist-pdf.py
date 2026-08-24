#!/usr/bin/env python3

from pathlib import Path

from reportlab.lib.colors import HexColor, Color
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "resources" / "pregnancy-baby-app-privacy-checklist.pdf"
PAGE_W, PAGE_H = A4

NAVY = HexColor("#07152F")
NAVY_2 = HexColor("#0D2347")
GOLD = HexColor("#F4C56D")
CREAM = HexColor("#FFF7E5")
INK = HexColor("#132342")
MUTED = HexColor("#52617A")
PALE = HexColor("#F4F7FC")
LINE = HexColor("#D9E1EF")


QUESTIONS = [
    ("ACCOUNT", "Can I inspect or begin without creating an account?"),
    ("STORAGE", "What stays on the device, and what goes to cloud storage?"),
    ("SHARING", "Who can see a shared record, and how is access removed?"),
    ("AI", "What does any AI feature receive, and is consent required first?"),
    ("ANALYTICS", "Are analytics or advertising tools kept separate from baby data?"),
    ("LOCATION", "Is location required, optional or stored?"),
    ("EXPORT", "Can the family take its history out in a usable format?"),
    ("DELETION", "Can the account and cloud copy be deleted clearly?"),
]


def paragraph(canvas, text, x, y_top, width, style):
    item = Paragraph(text, style)
    _, height = item.wrap(width, PAGE_H)
    item.drawOn(canvas, x, y_top - height)
    return height


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdfmetrics.registerFont(TTFont("OBubbaScript", str(ROOT / "Parisienne-Regular.ttf")))

    canvas = Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    canvas.setTitle("Pregnancy and Baby App Privacy Checklist - 8 Questions to Ask")
    canvas.setAuthor("OBubba")
    canvas.setSubject("A plain-language checklist for comparing pregnancy and baby app privacy")

    # Header
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 205, PAGE_W, 205, fill=1, stroke=0)
    canvas.setFillColor(NAVY_2)
    canvas.circle(PAGE_W - 48, PAGE_H - 58, 120, fill=1, stroke=0)
    canvas.setFillColor(Color(244 / 255, 197 / 255, 109 / 255, alpha=0.14))
    canvas.circle(PAGE_W - 91, PAGE_H - 124, 70, fill=1, stroke=0)

    canvas.setFont("OBubbaScript", 30)
    canvas.setFillColor(GOLD)
    canvas.drawString(38, PAGE_H - 44, "OBubba")

    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.setFillColor(GOLD)
    canvas.drawString(39, PAGE_H - 70, "PREGNANCY + BABY APP PRIVACY")

    header_style = ParagraphStyle(
        "header",
        fontName="Helvetica-Bold",
        fontSize=25,
        leading=28,
        textColor=CREAM,
        alignment=TA_LEFT,
    )
    paragraph(canvas, "8 questions before you trust an app with the family record", 38, PAGE_H - 84, 405, header_style)

    sub_style = ParagraphStyle(
        "sub",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=HexColor("#DDE6F7"),
    )
    paragraph(canvas, "Look past the word 'private'. Write down what the app actually says, and leave a blank where the answer is unclear.", 38, PAGE_H - 158, 425, sub_style)

    icon_path = ROOT / "icon.png"
    if icon_path.exists():
        canvas.drawImage(ImageReader(str(icon_path)), PAGE_W - 112, PAGE_H - 119, 72, 72, mask="auto", preserveAspectRatio=True)

    # Checklist rows
    y = PAGE_H - 231
    label_style = ParagraphStyle("label", fontName="Helvetica-Bold", fontSize=7.2, leading=8.5, textColor=NAVY_2)
    question_style = ParagraphStyle("question", fontName="Helvetica-Bold", fontSize=10.5, leading=13, textColor=INK)
    note_style = ParagraphStyle("note", fontName="Helvetica", fontSize=7.8, leading=10, textColor=MUTED)

    for number, (label, question) in enumerate(QUESTIONS, start=1):
        row_h = 59
        canvas.setFillColor(PALE if number % 2 else HexColor("#FFFFFF"))
        canvas.roundRect(34, y - row_h, PAGE_W - 68, row_h - 5, 7, fill=1, stroke=0)

        canvas.setStrokeColor(NAVY_2)
        canvas.setLineWidth(1.1)
        canvas.rect(46, y - 31, 12, 12, fill=0, stroke=1)

        canvas.setFillColor(GOLD)
        canvas.circle(78, y - 25, 13, fill=1, stroke=0)
        canvas.setFillColor(NAVY)
        canvas.setFont("Helvetica-Bold", 9)
        canvas.drawCentredString(78, y - 28, str(number))

        paragraph(canvas, label, 101, y - 13, 75, label_style)
        paragraph(canvas, question, 101, y - 25, 420, question_style)

        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.75)
        canvas.line(101, y - 48, PAGE_W - 48, y - 48)
        y -= row_h

    # Interpretation box
    box_y = 76
    canvas.setFillColor(HexColor("#FFF3D5"))
    canvas.roundRect(34, box_y, PAGE_W - 68, 74, 9, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 10.5)
    canvas.drawString(48, box_y + 55, "A useful answer is specific")
    paragraph(
        canvas,
        "Sync and sharing can require data to move. The practical test is whether the app explains each transfer, limits it to the job requested, and gives the family a meaningful choice. This checklist is not a security audit or legal advice.",
        48,
        box_y + 47,
        PAGE_W - 96,
        note_style,
    )

    # Footer and links
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE_W, 58, fill=1, stroke=0)
    canvas.setFillColor(CREAM)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(38, 37, "Read the full plain-language guide")
    canvas.setFillColor(GOLD)
    canvas.setFont("Helvetica-Bold", 10)
    guide_url = "https://obubba.com/blog/pregnancy-baby-app-privacy-checklist.html?utm_source=printable&utm_medium=pdf&utm_campaign=from_bump_to_baby_auto&utm_content=privacy_checklist_pdf"
    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.drawString(38, 20, "obubba.com/blog/pregnancy-baby-app-privacy-checklist.html")
    canvas.linkURL(guide_url, (34, 12, 335, 34), relative=0)

    canvas.setFillColor(HexColor("#DDE6F7"))
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(PAGE_W - 38, 34, "Free to print and share unchanged")
    canvas.drawRightString(PAGE_W - 38, 21, "OBubba - updated 24 August 2026")

    canvas.showPage()
    canvas.save()


if __name__ == "__main__":
    build()
