from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
FINAL = ROOT / "final"
FINAL.mkdir(parents=True, exist_ok=True)

W, H = 1290, 2796


def font(size, weight="regular"):
    candidates = {
        "heavy": [
            "/System/Library/Fonts/Supplemental/Avenir Next Condensed.ttc",
            "/System/Library/Fonts/Supplemental/Avenir Next.ttc",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ],
        "bold": [
            "/System/Library/Fonts/Supplemental/Avenir Next.ttc",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ],
        "regular": [
            "/System/Library/Fonts/Supplemental/Avenir Next.ttc",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
        ],
    }.get(weight, [])
    for p in candidates:
        try:
            return ImageFont.truetype(p, size=size)
        except Exception:
            pass
    return ImageFont.load_default()


TITLE = font(92, "heavy")
TITLE_SMALL = font(82, "heavy")
SUB = font(41, "regular")
CHIP = font(28, "bold")
FOOT = font(26, "regular")
LOGO = font(30, "bold")


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))


def vertical_gradient(top, bottom):
    top, bottom = hex_to_rgb(top), hex_to_rgb(bottom)
    img = Image.new("RGB", (W, H), top)
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        col = mix(top, bottom, t)
        for x in range(W):
            px[x, y] = col
    return img


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def wrap(draw, text, fnt, max_width):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        test = (line + " " + word).strip()
        if draw.textlength(test, font=fnt) <= max_width or not line:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_centered_wrapped(draw, text, fnt, y, fill, max_width, leading=1.08):
    lines = wrap(draw, text, fnt, max_width)
    line_h = int(fnt.size * leading)
    for line in lines:
        x = (W - draw.textlength(line, font=fnt)) / 2
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_h
    return y


def draw_chips(draw, chips, y, text_fill, accent, fill=(255, 255, 255, 185)):
    chip_boxes = []
    for text in chips:
        tw = draw.textlength(text, font=CHIP)
        chip_boxes.append((text, int(tw) + 44, 58))
    total = sum(w for _, w, _ in chip_boxes) + 16 * (len(chip_boxes) - 1)
    if total > W - 120:
        rows = []
        current = []
        width = 0
        for item in chip_boxes:
            add = item[1] + (16 if current else 0)
            if current and width + add > W - 120:
                rows.append(current)
                current = [item]
                width = item[1]
            else:
                current.append(item)
                width += add
        if current:
            rows.append(current)
    else:
        rows = [chip_boxes]
    for row in rows:
        total = sum(w for _, w, _ in row) + 16 * (len(row) - 1)
        x = (W - total) / 2
        for text, bw, bh in row:
            draw.rounded_rectangle((x, y, x + bw, y + bh), radius=29, fill=fill, outline=accent, width=2)
            tx = x + (bw - draw.textlength(text, font=CHIP)) / 2
            draw.text((tx, y + 13), text, font=CHIP, fill=text_fill)
            x += bw + 16
        y += 74
    return y


def paste_phone(base, raw_path, x, y, width, border, shadow, dark=False):
    raw = Image.open(raw_path).convert("RGB")
    height = round(width * H / W)
    frame_pad = 22
    frame_size = (width + frame_pad * 2, height + frame_pad * 2)

    shadow_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    sx, sy = x - frame_pad, y - frame_pad
    sd.rounded_rectangle((sx, sy + 18, sx + frame_size[0], sy + frame_size[1] + 24), radius=78, fill=shadow)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(26))
    base.alpha_composite(shadow_layer)

    frame = Image.new("RGBA", frame_size, (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    frame_fill = (10, 16, 30, 255) if dark else (255, 255, 255, 255)
    fd.rounded_rectangle((0, 0, frame_size[0] - 1, frame_size[1] - 1), radius=76, fill=frame_fill, outline=border, width=4)

    screen = raw.resize((width, height), Image.Resampling.LANCZOS).convert("RGBA")
    screen_mask = rounded_mask((width, height), 58)
    frame.alpha_composite(screen, (frame_pad, frame_pad))
    frame.putalpha(rounded_mask(frame_size, 76))

    # Clean screen corners after compositing.
    clean = Image.new("RGBA", frame_size, (0, 0, 0, 0))
    clean.alpha_composite(frame)
    clean_mask = rounded_mask(frame_size, 76)
    clean.putalpha(clean_mask)
    base.alpha_composite(clean, (sx, sy))

    # tiny speaker to sell the device frame, kept outside the app screen
    d = ImageDraw.Draw(base)
    speaker_fill = (234, 238, 244, 220) if not dark else (54, 64, 86, 230)
    d.rounded_rectangle((x + width * 0.39, y - 11, x + width * 0.61, y - 2), radius=6, fill=speaker_fill)


SHOTS = [
    {
        "raw": "01-track-day.png",
        "out": "01-know-what-baby-needs-next.png",
        "title": "Know what baby needs next",
        "sub": "Nap, feed and bedtime predictions that learn their personal rhythm.",
        "chips": ["Nap prediction", "Learns baby", "Personal rhythm"],
        "bg": ("#EAF7FF", "#FFF0E7"),
        "accent": "#C07088",
        "text": "#342D3A",
        "foot": "Personalised around your logs, not generic averages.",
    },
    {
        "raw": "02-track-night.png",
        "out": "02-less-alone-at-3am.png",
        "title": "Less alone at 3am",
        "sub": "Night mode, fireflies and Bubba Hug for the quiet hours.",
        "chips": ["Bubba Hug", "Night mode", "Awake parents"],
        "bg": ("#07101F", "#1D2237"),
        "accent": "#E3A55F",
        "text": "#FFF8F1",
        "foot": "A tiny sign that another parent is awake too.",
        "dark": True,
    },
    {
        "raw": "03-care-tools.png",
        "out": "03-one-calm-place-for-care.png",
        "title": "One calm place for baby care",
        "sub": "Weaning, Parent Room, Sleep Coach and Night Weaning together.",
        "chips": ["Sleep Coach", "Night Weaning", "Parent Room"],
        "bg": ("#FFF6F5", "#EAF7F4"),
        "accent": "#9B8BB8",
        "text": "#3B3140",
        "foot": "Guidance-informed care tools, grouped for tired parents.",
    },
    {
        "raw": "04-sleep-insight.png",
        "out": "04-sleep-advice-that-reads-the-whole-night.png",
        "title": "Sleep advice that reads the whole night",
        "sub": "What went right, what needs watching, and what OBubba will do next.",
        "chips": ["Consultant-style read", "7-14 day trends", "Gentle plan"],
        "bg": ("#F8F7FF", "#EAF7FF"),
        "accent": "#7B68EE",
        "text": "#2E3144",
        "foot": "Uses feeds, nappies, naps, soothing and history before suggesting changes.",
    },
    {
        "raw": "05-weaning.png",
        "out": "05-weaning-without-the-panic.png",
        "title": "Weaning without the panic",
        "sub": "Food recognition, allergen tags, recipes and safety notes as you log.",
        "chips": ["Allergen checks", "Puree + BLW", "Food journal"],
        "bg": ("#FFF5E7", "#EEF8F1"),
        "accent": "#D4A855",
        "text": "#3D3328",
        "foot": "References trusted public-health guidance such as NHS, WHO and AAP.",
    },
    {
        "raw": "06-parent-room.png",
        "out": "06-parents-need-care-too.png",
        "title": "Parents need care too",
        "sub": "Parent Room, check-ins and gentle support when the day is hard.",
        "chips": ["Parent Room", "Check-ins", "Breathe"],
        "bg": ("#FFF2F7", "#EEF6FF"),
        "accent": "#C07088",
        "text": "#40323D",
        "foot": "Because care includes the person doing the caring.",
    },
    {
        "raw": "07-grow.png",
        "out": "07-play-that-fits-their-stage.png",
        "title": "Play that fits their stage",
        "sub": "Growth, milestones and activities shaped around development.",
        "chips": ["Milestones", "Play ideas", "Growth tracking"],
        "bg": ("#EDFBF6", "#FFF2EA"),
        "accent": "#6FA898",
        "text": "#253A34",
        "foot": "Activities grow with baby, not a fixed checklist.",
    },
    {
        "raw": "03-care-tools.png",
        "out": "08-share-care-without-repeating-yourself.png",
        "title": "Share care without repeating yourself",
        "sub": "Bubba Care and Parent Room keep the people helping you aligned.",
        "chips": ["Bubba Care", "Carer handovers", "Parent Room"],
        "bg": ("#F2FAFF", "#FFF4F1"),
        "accent": "#5B8AA0",
        "text": "#2C3440",
        "foot": "One baby rhythm, shared by the people caring for them.",
    },
    {
        "raw": "09-bubba-care.png",
        "out": "09-bubba-care-for-your-village.png",
        "title": "Bubba Care for your village",
        "sub": "A live care guide for grandparents, nursery or whoever is helping.",
        "chips": ["Carer link", "Bigger text", "Live handover"],
        "bg": ("#F0FAFF", "#FFF1EB"),
        "accent": "#5B8AA0",
        "text": "#2F3744",
        "foot": "Share the essentials without typing the same message again.",
    },
    {
        "raw": "10-feeding-insight.png",
        "out": "10-feeding-support-for-every-route.png",
        "title": "Feeding support for every route",
        "sub": "Breast, bottle, combi and solids are read together, not separately.",
        "chips": ["Breastfeeding", "Bottles", "Solids"],
        "bg": ("#FFF7F2", "#ECF9F8"),
        "accent": "#6FA898",
        "text": "#343238",
        "foot": "Looks at intake, nappies, solids and growth before nudging.",
    },
    {
        "raw": "11-travel-help.png",
        "out": "11-travel-with-less-rhythm-chaos.png",
        "title": "Travel with less rhythm chaos",
        "sub": "Timezone shifts, journeys and off-days stay in the plan.",
        "chips": ["Travel help", "Off days", "Gentle shifts"],
        "bg": ("#EFF7FF", "#FFF4EF"),
        "accent": "#6B8EC8",
        "text": "#2D3544",
        "foot": "Keeps the day understandable when normal timing moves.",
    },
    {
        "raw": "12-safe-sleep.png",
        "out": "12-safety-guidance-when-it-matters.png",
        "title": "Safety guidance when it matters",
        "sub": "Safe sleep, weaning and growth checks stay close to the moment.",
        "chips": ["NHS", "WHO", "AAP"],
        "bg": ("#F8F6FF", "#EEF9F2"),
        "accent": "#9B8BB8",
        "text": "#332F42",
        "foot": "Public-health guidance translated into practical parent steps.",
    },
]


def make_shot(spec):
    base_rgb = vertical_gradient(*spec["bg"])
    base = base_rgb.convert("RGBA")
    draw = ImageDraw.Draw(base)
    accent = hex_to_rgb(spec["accent"])
    text = hex_to_rgb(spec["text"])
    dark = spec.get("dark", False)
    muted = (255, 248, 241, 220) if dark else (*text, 205)

    # Soft editorial bands, not decorative blobs.
    band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.rectangle((0, 0, W, 540), fill=(255, 255, 255, 24) if dark else (255, 255, 255, 95))
    bd.rectangle((0, H - 520, W, H), fill=(255, 255, 255, 18) if dark else (255, 255, 255, 70))
    base.alpha_composite(band)

    logo_fill = (255, 248, 241, 190) if dark else (*text, 170)
    draw.text((78, 82), "OBubba", font=LOGO, fill=logo_fill)

    title_font = TITLE_SMALL if len(spec["title"]) > 34 else TITLE
    y = 158
    y = draw_centered_wrapped(draw, spec["title"], title_font, y, text if not dark else (255, 248, 241), W - 150, leading=1.02)
    y += 22
    y = draw_centered_wrapped(draw, spec["sub"], SUB, y, muted, W - 170, leading=1.18)
    y += 34
    chip_fill = (255, 248, 241, 235) if dark else (255, 255, 255, 180)
    chip_text = (24, 31, 48) if dark else text
    y = draw_chips(draw, spec["chips"], y, chip_text, (*accent, 190), chip_fill)

    phone_width = 792
    phone_y = max(805, y + 54)
    phone_h = round(phone_width * H / W)
    if phone_y + phone_h > H - 150:
        phone_width = 748
        phone_h = round(phone_width * H / W)
    phone_x = (W - phone_width) // 2
    border = (*accent, 185)
    shadow = (56, 39, 51, 92) if not dark else (0, 0, 0, 155)
    paste_phone(base, RAW / spec["raw"], phone_x, phone_y, phone_width, border, shadow, dark=dark)

    foot_y = H - 104
    foot_text = spec["foot"]
    foot_w = draw.textlength(foot_text, font=FOOT)
    pill_pad = 28
    pill_h = 58
    pill_x = max(54, (W - foot_w) / 2 - pill_pad)
    pill_w = min(W - 108, foot_w + pill_pad * 2)
    if foot_w > W - 190:
        # keep the footnote legible without forcing a tiny font
        draw_centered_wrapped(draw, foot_text, FOOT, foot_y - 26, muted, W - 150, leading=1.05)
    else:
        draw.rounded_rectangle((pill_x, foot_y - 16, pill_x + pill_w, foot_y - 16 + pill_h), radius=29, fill=(255, 248, 241, 235) if dark else (255, 255, 255, 145), outline=(*accent, 120), width=1)
        draw.text(((W - foot_w) / 2, foot_y - 1), foot_text, font=FOOT, fill=(24, 31, 48) if dark else muted)

    out = FINAL / spec["out"]
    base.convert("RGB").save(out, quality=96)
    return out


def make_contact_sheet(files):
    thumb_w, thumb_h = 220, 478
    label_h = 48
    gap = 18
    cols = 4
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (thumb_w + gap) + gap, rows * (thumb_h + label_h + gap) + gap), "#F6F3F0")
    d = ImageDraw.Draw(sheet)
    label_font = font(18, "bold")
    for i, p in enumerate(files):
        im = Image.open(p).convert("RGB")
        im.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = gap + (i % cols) * (thumb_w + gap)
        y = gap + (i // cols) * (thumb_h + label_h + gap)
        tile = Image.new("RGB", (thumb_w, thumb_h), "white")
        tile.paste(im, ((thumb_w - im.width) // 2, (thumb_h - im.height) // 2))
        sheet.paste(tile, (x, y))
        d.text((x, y + thumb_h + 8), f"{i+1}. {p.stem[:18]}", font=label_font, fill="#4A3F46")
    out = FINAL / "obubba-app-store-contact-sheet.png"
    sheet.save(out, quality=95)
    return out


if __name__ == "__main__":
    files = [make_shot(spec) for spec in SHOTS]
    sheet = make_contact_sheet(files)
    print("Generated:")
    for f in files:
        print(f)
    print(sheet)
