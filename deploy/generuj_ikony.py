#!/usr/bin/env python3
"""Generuje wszystkie ikony aplikacji z assets/source/logo-circle-crop.png (wycinek logo Kortinglijst).
Wydobywa białą ikonę (wózek z metką %) jako przezroczysty glif i składa ją na pomarańczowym gradiencie.
Uruchom: python3 deploy/generuj_ikony.py   (wymaga Pillow i numpy)"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'assets/source/logo-circle-crop.png')
UP = 4

def smooth(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)

def load():
    im = Image.open(SRC).convert('RGB')
    big = im.resize((im.width * UP, im.height * UP), Image.LANCZOS)
    a = np.asarray(big).astype(float)
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w]
    cx = cy = w / 2
    R = w / 2 - 6 * UP
    inside = ((xx - cx) ** 2 + (yy - cy) ** 2) <= (R * 0.99) ** 2
    alpha = smooth(a.min(axis=2), 118, 215) * inside
    glyph_mask = alpha > 0.04
    rows = np.where(inside & ~glyph_mask)
    def band(lo, hi):
        sel = (rows[0] > cy - R + 2 * R * lo) & (rows[0] < cy - R + 2 * R * hi)
        px = a[rows[0][sel], rows[1][sel]]
        return tuple(int(v) for v in np.median(px, axis=0))
    top, bot = band(0.10, 0.22), band(0.78, 0.90)
    ys, xs = np.where(alpha > 0.3)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    g = Image.new('RGBA', big.size, (255, 255, 255, 0))
    g.putalpha(Image.fromarray((alpha * 255).astype('uint8')))
    return g.crop(box), top, bot

GLYPH, TOP, BOT = load()

def gradient(size):
    t = np.linspace(0, 1, size)[:, None, None]
    top = np.array(TOP, float); bot = np.array(BOT, float)
    arr = (top * (1 - t) + bot * t) * np.ones((1, size, 1))
    return Image.fromarray(arr.astype('uint8'), 'RGB').convert('RGBA')

def glyph_on(canvas, frac, white=True):
    size = canvas.width
    g = GLYPH.copy()
    k = frac * size / max(g.size)
    g = g.resize((max(1, round(g.width * k)), max(1, round(g.height * k))), Image.LANCZOS)
    if not white:
        g = Image.merge('RGBA', (Image.new('L', g.size, 0),) * 3 + (g.getchannel('A'),))
    canvas.alpha_composite(g, ((size - g.width) // 2, (size - g.height) // 2))
    return canvas

def disc(size, frac=1.0):
    ss = size * 4
    base = gradient(ss)
    mask = Image.new('L', (ss, ss), 0)
    d = int(ss * frac); o = (ss - d) // 2
    ImageDraw.Draw(mask).ellipse((o, o, o + d, o + d), fill=255)
    base.putalpha(mask)
    return base.resize((size, size), Image.LANCZOS)

def rounded(size, radius=0.22):
    ss = size * 4
    base = gradient(ss)
    mask = Image.new('L', (ss, ss), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, ss - 1, ss - 1), radius=int(ss * radius), fill=255)
    base.putalpha(mask)
    return base.resize((size, size), Image.LANCZOS)

def save(img, path, **kw):
    path = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, **kw)

# --- pliki Expo (assets/) ---
save(glyph_on(gradient(1024), 0.60).convert('RGB'), 'assets/icon.png')
save(gradient(512), 'assets/android-icon-background.png')
save(glyph_on(Image.new('RGBA', (512, 512), (0, 0, 0, 0)), 0.52), 'assets/android-icon-foreground.png')
save(glyph_on(Image.new('RGBA', (432, 432), (0, 0, 0, 0)), 0.52), 'assets/android-icon-monochrome.png')
save(glyph_on(disc(1024, 0.62), 0.38), 'assets/splash-icon.png')
save(glyph_on(rounded(48), 0.62), 'assets/favicon.png')
save(glyph_on(disc(512), 0.62), 'assets/logo-circle.png')

# --- zasoby natywne Androida (android/app/src/main/res) ---
RES = 'android/app/src/main/res'
dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for name, m in dens.items():
    ad = round(108 * m); lg = round(48 * m)
    save(gradient(ad), f'{RES}/mipmap-{name}/ic_launcher_background.webp', lossless=True)
    save(glyph_on(Image.new('RGBA', (ad, ad), (0, 0, 0, 0)), 0.52), f'{RES}/mipmap-{name}/ic_launcher_foreground.webp', lossless=True)
    save(glyph_on(Image.new('RGBA', (ad, ad), (0, 0, 0, 0)), 0.52), f'{RES}/mipmap-{name}/ic_launcher_monochrome.webp', lossless=True)
    save(glyph_on(rounded(lg), 0.62), f'{RES}/mipmap-{name}/ic_launcher.webp', lossless=True)
    save(glyph_on(disc(lg), 0.62), f'{RES}/mipmap-{name}/ic_launcher_round.webp', lossless=True)
    sp = round(288 * m)
    save(glyph_on(disc(sp, 0.62), 0.38), f'{RES}/drawable-{name}/splashscreen_logo.png')
print('gradient', TOP, BOT, 'glyph', GLYPH.size)
