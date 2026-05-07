from pathlib import Path
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw"
OUT_DIR = ROOT / "video"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 886, 1920
FPS = 30
SCENE_DUR = 2.55
XFADE = 0.36


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
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except Exception:
            pass
    return ImageFont.load_default()


LOGO = font(25, "bold")
TITLE = font(62, "heavy")
TITLE_SMALL = font(54, "heavy")
SUB = font(28, "bold")
KICKER = font(20, "bold")
CHIP = font(21, "bold")
END_TITLE = font(70, "heavy")


SCENES = [
    {
        "raw": "01-track-day.png",
        "kicker": "Baby rhythm",
        "title": "Your baby's day, lit up",
        "sub": "Feeds, nappies, naps and sleep come together in one calm view.",
        "chips": ["Feeds", "Nappies", "Naps", "Sleep"],
        "mode": "day",
        "accent": "#C07088",
    },
    {
        "raw": "02-track-night.png",
        "kicker": "Fireflies",
        "title": "A little light at 3am",
        "sub": "Night mode, fireflies and Bubba Hug when another parent is awake too.",
        "chips": ["Fireflies", "Bubba Hug", "Night mode"],
        "mode": "night",
        "accent": "#D4A855",
        "extra_fireflies": True,
    },
    {
        "raw": "01-track-day.png",
        "kicker": "One-tap logs",
        "title": "Log it before you forget it",
        "sub": "Tap the moment it happens. Hold when you need the details.",
        "chips": ["Feed", "Sleep", "Pump", "Crying"],
        "mode": "day",
        "accent": "#44C7EA",
        "pan": "bottom",
    },
    {
        "raw": "03-care-tools.png",
        "kicker": "Care toolkit",
        "title": "One calm place for care",
        "sub": "Sleep Coach, Night Weaning, Weaning and Parent Room are ready when you need them.",
        "chips": ["Sleep Coach", "Weaning", "Parent Room"],
        "mode": "day",
        "accent": "#9B8BB8",
    },
    {
        "raw": "04-sleep-insight.png",
        "kicker": "Sleep read",
        "title": "The whole night makes sense",
        "sub": "See what changed, what helped, and what OBubba will watch next.",
        "chips": ["Trends", "Gentle plan", "Patterns"],
        "mode": "day",
        "accent": "#7B68EE",
    },
    {
        "raw": "05-weaning.png",
        "kicker": "Weaning",
        "title": "Food without the panic",
        "sub": "Allergens, recipes, notes and first-food confidence as you log.",
        "chips": ["Allergens", "Recipes", "Notes"],
        "mode": "day",
        "accent": "#D4A855",
    },
    {
        "raw": "06-parent-room.png",
        "kicker": "Parent Room",
        "title": "Parents need care too",
        "sub": "Quick check-ins, breathing space and a softer place to land.",
        "chips": ["Check in", "Breathe", "Support"],
        "mode": "day",
        "accent": "#C07088",
    },
    {
        "raw": "07-grow.png",
        "kicker": "Grow",
        "title": "Tiny wins, remembered",
        "sub": "Milestones, play ideas, growth and memories shaped around your baby.",
        "chips": ["Milestones", "Play ideas", "Growth"],
        "mode": "day",
        "accent": "#6FA898",
    },
    {
        "raw": "03-care-tools.png",
        "kicker": "Shared care",
        "title": "Everyone helping stays aligned",
        "sub": "Bubba Care keeps handovers calmer without repeating yourself.",
        "chips": ["Bubba Care", "Carers", "Family"],
        "mode": "day",
        "accent": "#D4A855",
    },
    {
        "raw": "02-track-night.png",
        "kicker": "Obubba",
        "title": "Your shared baby brain",
        "sub": "Learn the rhythm. Share the care. Breathe a little.",
        "chips": ["Baby rhythm", "3am support", "Shared care"],
        "mode": "night",
        "accent": "#D4A855",
        "extra_fireflies": True,
        "end": True,
    },
]


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def ease_out(t):
    t = max(0, min(1, t))
    return 1 - (1 - t) ** 3


def ease_in_out(t):
    t = max(0, min(1, t))
    return t * t * (3 - 2 * t)


def text_size(draw, text, fnt):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def wrap(draw, text, fnt, width):
    words = text.split()
    lines, line = [], ""
    for word in words:
        test = (line + " " + word).strip()
        if draw.textlength(test, font=fnt) <= width or not line:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_wrapped(draw, text, fnt, y, fill, max_width, center=True, leading=1.04):
    lines = wrap(draw, text, fnt, max_width)
    step = int(getattr(fnt, "size", 24) * leading)
    for line in lines:
        x = (W - draw.textlength(line, font=fnt)) / 2 if center else 48
        draw.text((x, y), line, font=fnt, fill=fill)
        y += step
    return y


def draw_chip(draw, text, x, y, accent, dark):
    tw = draw.textlength(text, font=CHIP)
    bw = int(tw + 34)
    fill = (255, 248, 241, 232) if dark else (255, 255, 255, 218)
    outline = (*accent, 160)
    label = (28, 32, 46) if dark else (48, 39, 52)
    draw.rounded_rectangle((x, y, x + bw, y + 44), radius=22, fill=fill, outline=outline, width=2)
    draw.text((x + 17, y + 10), text, font=CHIP, fill=label)
    return x + bw + 12


def draw_chips(draw, chips, y, accent, dark):
    chip_widths = [draw.textlength(chip, font=CHIP) + 34 for chip in chips]
    total = sum(chip_widths) + 12 * (len(chip_widths) - 1)
    x = (W - total) / 2
    for chip in chips:
        x = draw_chip(draw, chip, x, y, accent, dark)


def base_image_for(scene):
    raw = Image.open(RAW / scene["raw"]).convert("RGB")
    rw, rh = raw.size
    scale = max(W / rw, H / rh)
    resized = raw.resize((int(rw * scale), int(rh * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - W) // 2
    top = (resized.height - H) // 2
    return resized.crop((left, top, left + W, top + H))


def add_fireflies(im, scene_index, scene, global_t, local_t, strength=1.0):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    gd = ImageDraw.Draw(glow)
    colors = [(255, 219, 118), (238, 70, 178), (75, 210, 238), (162, 244, 88)]
    count = 20 if scene.get("extra_fireflies") else 12
    base_y = 0.58 if scene["mode"] == "night" else 0.64
    for i in range(count):
        phase = scene_index * 0.73 + i * 1.91
        angle = global_t * (0.78 + (i % 5) * 0.035) + phase
        rx = W * (0.31 + 0.035 * math.sin(i * 1.7))
        ry = H * (0.22 + 0.04 * math.cos(i * 1.13))
        x = W / 2 + rx * math.cos(angle)
        y = H * base_y + ry * math.sin(angle * 0.83 + phase * 0.31)
        x += 34 * math.sin(global_t * 1.7 + phase)
        y += 24 * math.cos(global_t * 1.25 + phase)
        twinkle = 0.48 + 0.52 * math.sin(global_t * 5.2 + phase)
        alpha = int((70 + 115 * twinkle) * strength)
        core = 4 + (i % 3)
        glow_radius = core * (5 if scene["mode"] == "night" else 4)
        color = colors[(i + scene_index) % len(colors)]
        gd.ellipse((x - glow_radius, y - glow_radius, x + glow_radius, y + glow_radius), fill=(*color, max(20, alpha // 3)))
        d.ellipse((x - core, y - core, x + core, y + core), fill=(*color, alpha))

    glow = glow.filter(ImageFilter.GaussianBlur(10))
    im.alpha_composite(glow)
    im.alpha_composite(layer)


def add_light_trail(im, scene_index, scene, global_t, strength=1.0):
    trail = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(trail)
    accent = hex_rgb(scene["accent"])
    for i in range(34):
        p = i / 33
        x = 78 + p * (W - 156)
        y = H * 0.82 + math.sin(p * math.pi * 2 + global_t * 1.7 + scene_index) * 38
        y -= ease_in_out(p) * 66
        r = 3 + 2 * math.sin(p * math.pi)
        alpha = int((28 + 92 * math.sin(p * math.pi)) * strength)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(*accent, alpha))
    trail = trail.filter(ImageFilter.GaussianBlur(1.1))
    im.alpha_composite(trail)


def add_overlay(raw, scene, scene_index, local_t, global_t):
    dark = scene["mode"] == "night"
    accent = hex_rgb(scene["accent"])
    im = raw.convert("RGBA")

    add_fireflies(im, scene_index, scene, global_t, local_t, 0.95)
    add_light_trail(im, scene_index, scene, global_t, 0.62)

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    if dark:
        top = (7, 16, 31, 236)
        mid = (7, 16, 31, 184)
        text = (255, 248, 241)
        sub = (244, 232, 224)
        logo = text
    else:
        top = (255, 250, 247, 238)
        mid = (255, 250, 247, 174)
        text = (47, 39, 52)
        sub = (88, 73, 88)
        logo = (47, 39, 52)

    od.rectangle((0, 0, W, 392), fill=top)
    for y in range(392, 565):
        alpha = int(mid[3] * (1 - (y - 392) / 173))
        od.line((0, y, W, y), fill=(*mid[:3], alpha))

    bottom = (7, 16, 31, 142) if dark else (255, 250, 247, 116)
    for y in range(H - 320, H):
        alpha = int(bottom[3] * ((y - (H - 320)) / 320))
        od.line((0, y, W, y), fill=(*bottom[:3], alpha))

    im.alpha_composite(overlay)
    draw = ImageDraw.Draw(im)
    fade = min(1.0, local_t / 0.38)
    y_shift = int((1 - ease_out(fade)) * 26)

    draw.text((44, 42 + y_shift), "OBubba", font=LOGO, fill=logo)
    kicker = scene["kicker"].upper()
    kw = draw.textlength(kicker, font=KICKER)
    kicker_fill = (7, 16, 31, 206) if dark else (255, 255, 255, 210)
    kicker_text = (255, 248, 241) if dark else accent
    draw.rounded_rectangle(
        (W - kw - 72, 39 + y_shift, W - 42, 78 + y_shift),
        radius=20,
        fill=kicker_fill,
        outline=(*accent, 132),
        width=1,
    )
    draw.text((W - kw - 56, 49 + y_shift), kicker, font=KICKER, fill=kicker_text)

    title_font = END_TITLE if scene.get("end") else (TITLE_SMALL if len(scene["title"]) > 26 else TITLE)
    y = 108 + y_shift
    y = draw_wrapped(draw, scene["title"], title_font, y, text, W - 86, center=True, leading=0.96)
    y += 12
    y = draw_wrapped(draw, scene["sub"], SUB, y, sub, W - 100, center=True, leading=1.12)
    draw_chips(draw, scene["chips"], 314 + y_shift, accent, dark)

    if scene.get("end"):
        pulse = 0.5 + 0.5 * math.sin(global_t * 4.4)
        ring = int(160 + 55 * pulse)
        cx, cy = W // 2, H - 230
        draw.rounded_rectangle((106, cy - 62, W - 106, cy + 62), radius=40, fill=(255, 248, 241, 232), outline=(*accent, ring), width=3)
        label = "Made for the tired little moments"
        lw, _ = text_size(draw, label, SUB)
        draw.text(((W - lw) / 2, cy - 18), label, font=SUB, fill=(36, 33, 46))

    return im.convert("RGB")


def render_scene_frame(prepared, idx, local_t, global_t):
    scene = SCENES[idx]
    progress = local_t / SCENE_DUR
    scale = 1.0 + 0.024 * ease_in_out(progress)
    src = prepared[idx]
    zw, zh = int(W * scale), int(H * scale)
    zoomed = src.resize((zw, zh), Image.Resampling.BICUBIC)
    left = (zw - W) // 2
    if scene.get("pan") == "bottom":
        top = min(zh - H, int((zh - H) * 0.72))
    else:
        top = int((zh - H) * (0.44 + 0.08 * math.sin(progress * math.pi)))
    src = zoomed.crop((left, top, left + W, top + H))
    return add_overlay(src, scene, idx, local_t, global_t)


def render_frame(prepared, t):
    total = len(SCENES) * SCENE_DUR
    if t >= total:
        t = total - 1 / FPS
    idx = min(len(SCENES) - 1, int(t // SCENE_DUR))
    local_t = t - idx * SCENE_DUR
    frame = render_scene_frame(prepared, idx, local_t, t)
    if idx < len(SCENES) - 1 and local_t > SCENE_DUR - XFADE:
        alpha = (local_t - (SCENE_DUR - XFADE)) / XFADE
        nxt = render_scene_frame(prepared, idx + 1, 0, t)
        frame = Image.blend(frame, nxt, ease_out(alpha))
    return frame


def save_contact_sheet(prepared, output):
    thumb_w, thumb_h = 221, 480
    cols = 5
    rows = 2
    sheet = Image.new("RGB", (cols * thumb_w, rows * thumb_h), (246, 243, 240))
    for idx in range(len(SCENES)):
        frame = render_frame(prepared, idx * SCENE_DUR + SCENE_DUR * 0.52)
        frame = frame.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = (idx % cols) * thumb_w
        y = (idx // cols) * thumb_h
        sheet.paste(frame, (x, y))
    sheet.save(output, quality=92)


def main():
    prepared = [base_image_for(scene) for scene in SCENES]
    total_duration = len(SCENES) * SCENE_DUR
    total_frames = int(total_duration * FPS)
    output = OUT_DIR / "obubba-fireflies-feature-tour-iphone-886x1920.mp4"
    poster = OUT_DIR / "obubba-fireflies-feature-tour-poster-frame.png"
    contact_sheet = OUT_DIR / "obubba-fireflies-feature-tour-contact-sheet.png"

    render_frame(prepared, 3.2).save(poster, quality=95)
    save_contact_sheet(prepared, contact_sheet)

    cmd = [
        "ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}",
        "-r", str(FPS),
        "-i", "-",
        "-f", "lavfi",
        "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-t", f"{total_duration:.2f}",
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level:v", "4.0",
        "-pix_fmt", "yuv420p",
        "-b:v", "10M",
        "-maxrate", "12M",
        "-bufsize", "20M",
        "-r", str(FPS),
        "-c:a", "aac",
        "-b:a", "256k",
        "-ar", "48000",
        "-ac", "2",
        "-movflags", "+faststart",
        "-shortest",
        str(output),
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    try:
        for i in range(total_frames):
            frame = render_frame(prepared, i / FPS)
            proc.stdin.write(frame.tobytes())
    finally:
        proc.stdin.close()
    rc = proc.wait()
    if rc:
        raise SystemExit(rc)
    print(output)
    print(poster)
    print(contact_sheet)


if __name__ == "__main__":
    main()
