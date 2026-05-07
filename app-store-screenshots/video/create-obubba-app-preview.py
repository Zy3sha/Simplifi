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
SCENE_DUR = 3.0
XFADE = 0.42


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


LOGO = font(25, "bold")
TITLE = font(64, "heavy")
TITLE_SMALL = font(56, "heavy")
SUB = font(30, "bold")
KICKER = font(22, "bold")
CHIP = font(22, "bold")


SCENES = [
    {
        "raw": "01-track-day.png",
        "kicker": "Personal rhythm",
        "title": "Know what baby needs next",
        "sub": "Nap, feed and bedtime predictions that learn your baby.",
        "chips": ["Nap prediction", "Learns every day"],
        "mode": "day",
        "accent": "#C07088",
    },
    {
        "raw": "02-track-night.png",
        "kicker": "3am support",
        "title": "Less alone overnight",
        "sub": "Night mode, fireflies and Bubba Hug when another parent is awake too.",
        "chips": ["Bubba Hug", "Fireflies"],
        "mode": "night",
        "accent": "#D4A855",
    },
    {
        "raw": "03-care-tools.png",
        "kicker": "Care toolkit",
        "title": "Everything baby care needs",
        "sub": "Weaning, Parent Room, Sleep Coach and Night Weaning in one calm tab.",
        "chips": ["Sleep Coach", "Night Weaning"],
        "mode": "day",
        "accent": "#9B8BB8",
    },
    {
        "raw": "04-sleep-insight.png",
        "kicker": "Sleep insight",
        "title": "A consultant-style sleep read",
        "sub": "What went right, what stood out, and what OBubba will do next.",
        "chips": ["Whole-night analysis", "Gentle plan"],
        "mode": "day",
        "accent": "#7B68EE",
    },
    {
        "raw": "05-weaning.png",
        "kicker": "Weaning support",
        "title": "Log food without the panic",
        "sub": "Food recognition, allergen tags, recipes and safety notes as you log.",
        "chips": ["Allergen checks", "Puree + BLW"],
        "mode": "day",
        "accent": "#D4A855",
        "foot": "References NHS, WHO and AAP guidance where relevant.",
    },
    {
        "raw": "06-parent-room.png",
        "kicker": "Parent Room",
        "title": "Parents need care too",
        "sub": "Quick check-ins and support when the day is hard.",
        "chips": ["Breathe", "Check in"],
        "mode": "day",
        "accent": "#C07088",
    },
    {
        "raw": "07-grow.png",
        "kicker": "Growth and play",
        "title": "Play that fits their stage",
        "sub": "Milestones, activities and growth tracking shaped around development.",
        "chips": ["Milestones", "Play ideas"],
        "mode": "day",
        "accent": "#6FA898",
    },
]


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def ease_out(t):
    return 1 - (1 - t) ** 3


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


def draw_wrapped(draw, text, fnt, y, fill, max_width, center=True, leading=1.05):
    lines = wrap(draw, text, fnt, max_width)
    for line in lines:
        x = (W - draw.textlength(line, font=fnt)) / 2 if center else 48
        draw.text((x, y), line, font=fnt, fill=fill)
        y += int(fnt.size * leading)
    return y


def draw_chip(draw, text, x, y, accent, dark):
    tw = draw.textlength(text, font=CHIP)
    bw = int(tw + 34)
    fill = (255, 248, 241, 235) if dark else (255, 255, 255, 215)
    outline = (*accent, 160)
    label = (28, 32, 46) if dark else (48, 39, 52)
    draw.rounded_rectangle((x, y, x + bw, y + 46), radius=23, fill=fill, outline=outline, width=2)
    draw.text((x + 17, y + 11), text, font=CHIP, fill=label)
    return x + bw + 12


def base_image_for(scene):
    raw = Image.open(RAW / scene["raw"]).convert("RGB")
    raw = raw.resize((W, H), Image.Resampling.LANCZOS)
    return raw


def add_overlay(raw, scene, local_t):
    dark = scene["mode"] == "night"
    accent = hex_rgb(scene["accent"])
    im = raw.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    if dark:
        top = (7, 16, 31, 232)
        mid = (7, 16, 31, 182)
        text = (255, 248, 241)
        sub = (245, 232, 222)
    else:
        top = (255, 250, 247, 236)
        mid = (255, 250, 247, 178)
        text = (47, 39, 52)
        sub = (89, 75, 88)

    # top readability veil
    od.rectangle((0, 0, W, 375), fill=top)
    for y in range(375, 560):
        a = int(mid[3] * (1 - (y - 375) / 185))
        od.line((0, y, W, y), fill=(*mid[:3], a))
    # bottom mild veil for final note
    if scene.get("foot"):
        od.rounded_rectangle((58, H - 112, W - 58, H - 42), radius=35, fill=(255, 255, 255, 224) if not dark else (255, 248, 241, 232), outline=(*accent, 110), width=2)

    im.alpha_composite(overlay)
    draw = ImageDraw.Draw(im)
    fade = min(1.0, local_t / 0.42)
    y_shift = int((1 - ease_out(fade)) * 24)

    draw.text((44, 42 + y_shift), "OBubba", font=LOGO, fill=text)
    kicker = scene["kicker"].upper()
    kw = draw.textlength(kicker, font=KICKER)
    draw.rounded_rectangle((W - kw - 72, 39 + y_shift, W - 42, 79 + y_shift), radius=20, fill=(*accent, 32), outline=(*accent, 120), width=1)
    draw.text((W - kw - 56, 50 + y_shift), kicker, font=KICKER, fill=accent)

    title_font = TITLE_SMALL if len(scene["title"]) > 27 else TITLE
    y = 108 + y_shift
    y = draw_wrapped(draw, scene["title"], title_font, y, text, W - 86, center=True, leading=0.96)
    y += 12
    y = draw_wrapped(draw, scene["sub"], SUB, y, sub, W - 98, center=True, leading=1.12)

    chip_widths = [draw.textlength(c, font=CHIP) + 34 for c in scene["chips"]]
    total = sum(chip_widths) + 12 * (len(chip_widths) - 1)
    x = (W - total) / 2
    for chip in scene["chips"]:
        x = draw_chip(draw, chip, x, 308 + y_shift, accent, dark)

    if scene.get("foot"):
        fw = draw.textlength(scene["foot"], font=KICKER)
        draw.text(((W - fw) / 2, H - 91), scene["foot"], font=KICKER, fill=(48, 39, 52))

    return im.convert("RGB")


def render_scene_frame(prepared, idx, local_t):
    scene = SCENES[idx]
    progress = local_t / SCENE_DUR
    # pre-rendered screenshot base, gently zoomed in toward the parent-facing UI
    max_zoom = 1.018
    scale = 1.0 + (max_zoom - 1.0) * progress
    src = prepared[idx]
    if scale > 1.001:
        zw, zh = int(W * scale), int(H * scale)
        zoomed = src.resize((zw, zh), Image.Resampling.BICUBIC)
        # Slightly favor top so the main app controls remain visible.
        left = (zw - W) // 2
        top = min((zh - H) // 2, int((zh - H) * 0.42))
        src = zoomed.crop((left, top, left + W, top + H))
    return add_overlay(src, scene, local_t)


def blend(a, b, alpha):
    return Image.blend(a, b, alpha)


def render_frame(prepared, t):
    total = len(SCENES) * SCENE_DUR
    if t >= total:
        t = total - 1 / FPS
    idx = min(len(SCENES) - 1, int(t // SCENE_DUR))
    local_t = t - idx * SCENE_DUR
    frame = render_scene_frame(prepared, idx, local_t)
    if idx < len(SCENES) - 1 and local_t > SCENE_DUR - XFADE:
        alpha = (local_t - (SCENE_DUR - XFADE)) / XFADE
        alpha = max(0, min(1, alpha))
        nxt = render_scene_frame(prepared, idx + 1, 0)
        frame = blend(frame, nxt, ease_out(alpha))
    return frame


def main():
    prepared = [base_image_for(scene) for scene in SCENES]
    total_frames = int(len(SCENES) * SCENE_DUR * FPS)
    output = OUT_DIR / "obubba-app-preview-iphone-886x1920-v2-no-signin.mp4"
    poster = OUT_DIR / "obubba-app-preview-poster-frame-5s.png"

    # Save the default 5-second poster frame as a convenient App Store Connect pick.
    render_frame(prepared, 5.0).save(poster, quality=95)

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
        "-t", f"{len(SCENES) * SCENE_DUR:.2f}",
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


if __name__ == "__main__":
    main()
