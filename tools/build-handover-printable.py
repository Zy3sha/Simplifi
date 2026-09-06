#!/usr/bin/env python3

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "resources" / "obubba-baby-care-handover-sheet.pdf"

NAVY = colors.HexColor("#071833")
NAVY_2 = colors.HexColor("#10284F")
GOLD = colors.HexColor("#F5BD4F")
CREAM = colors.HexColor("#FFFAF3")
INK = colors.HexColor("#2F2934")
MUTED = colors.HexColor("#6D6571")
LINE = colors.HexColor("#D8D0C5")
PALE_GOLD = colors.HexColor("#FFF3D5")


def line(c, x1, y, x2, width=0.7, colour=LINE):
    c.setStrokeColor(colour)
    c.setLineWidth(width)
    c.line(x1, y, x2, y)


def text(c, value, x, y, size=8.5, colour=INK, font="Helvetica"):
    c.setFillColor(colour)
    c.setFont(font, size)
    c.drawString(x, y, value)


def field(c, label, x, y, width, label_width=None):
    text(c, label, x, y + 2, 8, MUTED, "Helvetica-Bold")
    start = x + (label_width if label_width is not None else c.stringWidth(label, "Helvetica-Bold", 8) + 7)
    line(c, start, y, x + width)


def section(c, title, y, number):
    c.setFillColor(NAVY)
    c.roundRect(34, y - 17, 527, 24, 7, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.circle(49, y - 5, 8, fill=1, stroke=0)
    text(c, str(number), 46.6, y - 8, 8, NAVY, "Helvetica-Bold")
    text(c, title, 64, y - 9, 10.5, colors.white, "Helvetica-Bold")


def checkbox(c, label, x, y, width=10):
    c.setStrokeColor(NAVY_2)
    c.setLineWidth(0.8)
    c.rect(x, y - 1, width, width, fill=0, stroke=1)
    text(c, label, x + width + 5, y + 1, 8.2, INK)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    width, height = A4
    c.setTitle("OBubba Baby Care Handover Sheet")
    c.setAuthor("OBubba")
    c.setSubject("A printable one-page baby care handover for trusted carers")

    c.setFillColor(CREAM)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, height - 105, width, 105, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.circle(514, height - 37, 22, fill=1, stroke=0)
    text(c, "O", 505, height - 45, 25, NAVY, "Helvetica-Bold")
    text(c, "OBubba", 34, height - 38, 18, GOLD, "Helvetica-Bold")
    text(c, "Baby care handover sheet", 34, height - 69, 24, colors.white, "Helvetica-Bold")
    text(c, "One clear page so help can take over the remembering too.", 34, height - 88, 9.5, colors.HexColor("#DCE5F4"))

    y = height - 129
    field(c, "Baby:", 34, y, 250)
    field(c, "Date:", 302, y, 120)
    field(c, "Handover time:", 438, y, 123, 70)
    y -= 25
    field(c, "Parent or carer taking over:", 34, y, 260, 122)
    field(c, "Handing back at:", 315, y, 246, 78)

    y -= 25
    section(c, "What has happened so far", y, 1)
    y -= 38
    text(c, "FEEDS", 40, y, 8, NAVY, "Helvetica-Bold")
    field(c, "Last feed time:", 98, y, 132, 68)
    field(c, "Type / side:", 246, y, 142, 58)
    field(c, "Amount:", 405, y, 156, 43)
    y -= 23
    field(c, "Anything useful about the feed:", 40, y, 521, 136)
    y -= 24
    text(c, "SLEEP", 40, y, 8, NAVY, "Helvetica-Bold")
    field(c, "Last slept from:", 91, y, 153, 75)
    field(c, "Woke at:", 261, y, 122, 44)
    field(c, "Next sleep guide, if used:", 400, y, 161, 111)
    y -= 23
    text(c, "NAPPIES", 40, y, 8, NAVY, "Helvetica-Bold")
    field(c, "Last change:", 105, y, 118, 57)
    checkbox(c, "Wet", 240, y - 1)
    checkbox(c, "Dirty", 299, y - 1)
    checkbox(c, "Both", 363, y - 1)
    field(c, "Anything unusual:", 429, y, 132, 78)

    y -= 28
    section(c, "What the next carer needs to know", y, 2)
    y -= 38
    field(c, "Next likely feed or routine cue:", 40, y, 521, 140)
    y -= 23
    field(c, "What usually helps baby settle:", 40, y, 521, 139)
    y -= 23
    field(c, "Allergies, foods to avoid, or current professional advice:", 40, y, 521, 236)
    y -= 23
    field(c, "Anything different today:", 40, y, 521, 111)

    y -= 28
    section(c, "Medicine and safety", y, 3)
    y -= 38
    field(c, "Medicine name:", 40, y, 168, 76)
    field(c, "Dose exactly as directed:", 225, y, 174, 109)
    field(c, "Last given:", 416, y, 145, 51)
    y -= 23
    field(c, "Next dose only if already directed:", 40, y, 256, 154)
    field(c, "Where instructions are kept:", 315, y, 246, 130)
    y -= 23
    field(c, "Parent contact:", 40, y, 220, 69)
    field(c, "Backup contact:", 278, y, 210, 72)
    field(c, "Emergency number:", 505, y, 56, 83)
    y -= 23
    c.setFillColor(PALE_GOLD)
    c.roundRect(40, y - 14, 521, 27, 6, fill=1, stroke=0)
    text(c, "Use the written medicine plan and label. If baby seems seriously unwell, call emergency services.", 49, y - 3, 8.1, INK, "Helvetica-Bold")

    y -= 36
    section(c, "Hand back without another recap", y, 4)
    y -= 38
    field(c, "Feeds while you were away:", 40, y, 250, 121)
    field(c, "Sleep:", 308, y, 115, 34)
    field(c, "Nappies:", 441, y, 120, 42)
    y -= 23
    field(c, "Medicine given, including exact time:", 40, y, 521, 169)
    y -= 23
    field(c, "One thing the parent should know:", 40, y, 521, 153)

    c.setFillColor(NAVY)
    c.roundRect(34, 31, 527, 43, 10, fill=1, stroke=0)
    text(c, "Prefer a live handover?", 48, 56, 9, GOLD, "Helvetica-Bold")
    text(c, "OBubba keeps feeds, sleep, nappies and carer updates together. obubba.com", 48, 42, 8.4, colors.white)
    text(c, "This sheet supports communication. It is not a medical record or a substitute for professional advice.", 34, 17, 7.3, MUTED)

    c.showPage()
    c.save()


if __name__ == "__main__":
    build()
