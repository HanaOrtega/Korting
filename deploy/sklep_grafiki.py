#!/usr/bin/env python3
"""Grafiki do Google Play (kanał: holenderski) dla Kortinglijst.

  python3 deploy/sklep_grafiki.py icon          # ikona 512x512 -> store/icoon-512.png
  python3 deploy/sklep_grafiki.py feature       # grafika funkcji 1024x500 -> store/feature-graphic.png
  python3 deploy/sklep_grafiki.py shots         # prawdziwe zrzuty z telefonu przez adb -> store/schermafbeeldingen/
  python3 deploy/sklep_grafiki.py shots --from-dir DIR   # to samo z gotowych zrzutów (01.png … 07.png w DIR)
  python3 deploy/sklep_grafiki.py all           # icon + feature (zrzuty osobno)

Zrzuty są PRAWDZIWE: robi je telefon (`adb exec-out screencap`); skrypt tylko dokłada tło i napis (1080x1920, 9:16).
Wymaga: Pillow (pip install pillow), a dla `shots` bez --from-dir: adb i telefonu z włączonym debugowaniem USB.
"""
import os, subprocess, sys, io
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'store')
TOP, BOT = (224, 107, 2), (178, 52, 2)  # gradient marki (z ikony)

# kolejność = kolejność w Google Play; opis kroku (co ustawić na telefonie) + podpis na grafice
SHOTS = [
    ('01-lijst', 'Zakładka Lista z kilkoma produktami i promocjami (aplikacja po holendersku)', 'Typ in je eigen taal – aanbiedingen vind je vanzelf'),
    ('02-per-winkel', 'Lista → przełącznik „Per winkel”', 'Weet naar welke winkel je moet'),
    ('03-recepten', 'Zakładka Recepten z kilkoma zapisanymi przepisami', 'Jouw receptenboek'),
    ('04-recept', 'Otwarty przepis (składniki, porcje, „Op boodschappenlijst zetten”)', 'Van recept naar boodschappenlijst in één tik'),
    ('05-boodschappenmodus', 'Menu ☰ → Comfort → włącz tryb zakupów; Lista → Boodschappenmodus (ekran produktu)', 'Boodschappenmodus: één product tegelijk'),
    ('06-acties', 'Zakładka Acties z wpisanym wyszukiwaniem (np. „kaas”)', 'Alle aanbiedingen op één plek'),
    ('07-donker', 'Lista w ciemnym motywie (system w trybie ciemnym)', 'Licht en donker thema'),
]


def font(size, bold=True):
    cands = []
    try:
        cands.append(subprocess.check_output(['fc-match', '-f', '%{file}', 'sans:bold' if bold else 'sans']).decode())
    except Exception:
        pass
    cands += ['/usr/share/fonts/TTF/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/System/Library/Fonts/Helvetica.ttc', 'C:/Windows/Fonts/arialbd.ttf']
    for c in cands:
        if c and os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def gradient(w, h):
    img = Image.new('RGB', (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        col = tuple(round(TOP[i] * (1 - t) + BOT[i] * t) for i in range(3))
        for x in range(w):
            px[x, y] = col
    return img


def wrap(draw, text, fnt, width):
    lines, cur = [], ''
    for word in text.split():
        trial = (cur + ' ' + word).strip()
        if draw.textlength(trial, font=fnt) <= width:
            cur = trial
        else:
            lines.append(cur); cur = word
    return lines + [cur]


def icon():
    im = Image.open(os.path.join(ROOT, 'assets/icon.png')).convert('RGBA').resize((512, 512), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, 'icoon-512.png'))  # Play sam zaokrągla rogi – bez własnych cieni i masek
    print('store/icoon-512.png')


def feature():
    W, H = 1024, 500
    bg = gradient(W, H).convert('RGBA')
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.ellipse((560, -180, 1180, 440), fill=(255, 255, 255, 22))
    d.ellipse((700, 200, 1100, 600), fill=(255, 255, 255, 18))
    bg.alpha_composite(ov)
    logo = Image.open(os.path.join(ROOT, 'assets/logo-circle.png')).convert('RGBA').resize((300, 300), Image.LANCZOS)
    sh = Image.new('RGBA', (420, 420), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 100), (60, 60, 360, 360), logo.getchannel('A'))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    bg.alpha_composite(sh, (70 - 60 + 8, 100 - 60 + 14))
    bg.alpha_composite(logo, (70, 100))
    d = ImageDraw.Draw(bg)
    d.text((420, 150), 'Kortinglijst', font=font(92), fill='white')
    d.text((424, 262), 'Slimme Boodschappen', font=font(44, False), fill=(255, 236, 220))
    d.text((424, 340), 'Boodschappenlijst · Aanbiedingen · Recepten', font=font(25, False), fill=(255, 224, 200))
    os.makedirs(OUT, exist_ok=True)
    bg.convert('RGB').save(os.path.join(OUT, 'feature-graphic.png'))
    print('store/feature-graphic.png (1024x500)')


def compose(shot, caption, path):
    W, H = 1080, 1920
    bg = gradient(W, H).convert('RGBA')
    d = ImageDraw.Draw(bg)
    f = font(66)
    lines = wrap(d, caption, f, 900)
    y = 120
    for ln in lines:
        d.text(((W - d.textlength(ln, font=f)) / 2, y), ln, font=f, fill='white')
        y += 84
    top = max(y + 50, 380)
    sw = 860
    s = shot.convert('RGBA')
    s = s.resize((sw, round(s.height * sw / s.width)), Image.LANCZOS)
    mask = Image.new('L', s.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, s.width - 1, s.height + 200), radius=58, fill=255)
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(((W - sw) // 2, top + 14, (W + sw) // 2, H + 300), radius=58, fill=(0, 0, 0, 110))
    bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(22)))
    frame = Image.new('RGBA', (sw + 16, s.height + 16), (255, 255, 255, 255))
    fm = Image.new('L', frame.size, 0)
    ImageDraw.Draw(fm).rounded_rectangle((0, 0, frame.width - 1, frame.height + 200), radius=66, fill=255)
    bg.paste(frame, ((W - sw) // 2 - 8, top - 8), fm)
    bg.paste(s, ((W - sw) // 2, top), mask)
    bg.convert('RGB').save(path)


def adb_shot():
    raw = subprocess.check_output(['adb', 'exec-out', 'screencap', '-p'])
    return Image.open(io.BytesIO(raw))


def shots(from_dir=None):
    out = os.path.join(OUT, 'schermafbeeldingen')
    os.makedirs(out, exist_ok=True)
    for i, (name, step, caption) in enumerate(SHOTS, 1):
        if from_dir:
            cand = [os.path.join(from_dir, f'{i:02d}.png'), os.path.join(from_dir, f'{name}.png')]
            src = next((c for c in cand if os.path.exists(c)), None)
            if not src:
                print(f'brak pliku dla kroku {i} ({name}) – pomijam'); continue
            img = Image.open(src)
        else:
            input(f'\n[{i}/{len(SHOTS)}] Ustaw na telefonie: {step}\n    Enter = zrób zrzut… ')
            img = adb_shot()
        compose(img, caption, os.path.join(out, name + '.png'))
        print('store/schermafbeeldingen/' + name + '.png')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cmd in ('icon', 'all'): icon()
    if cmd in ('feature', 'all'): feature()
    if cmd == 'shots':
        shots(sys.argv[sys.argv.index('--from-dir') + 1] if '--from-dir' in sys.argv else None)
