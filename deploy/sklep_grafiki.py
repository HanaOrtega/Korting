#!/usr/bin/env python3
"""Grafiki do Google Play (kanał: holenderski) dla Kortinglijst.

  python3 deploy/sklep_grafiki.py icon          # ikona 512x512 -> store/icoon-512.png
  python3 deploy/sklep_grafiki.py feature       # grafika funkcji 1024x500 -> store/feature-graphic.png
  python3 deploy/sklep_grafiki.py shots         # prawdziwe zrzuty przez adb w 3 rozmiarach -> store/schermafbeeldingen/{telefon,tablet-7,tablet-10}/
  python3 deploy/sklep_grafiki.py shots --profile telefon      # tylko jeden rozmiar (telefon | tablet-7 | tablet-10)
  python3 deploy/sklep_grafiki.py shots --from-dir DIR   # z gotowych zrzutów (DIR/<rozmiar>/01.png … 07.png albo DIR/01.png dla telefonu)

Zrzuty bez reklam: zbuduj emulatorową wersję poleceniem ./deploy/emulator.sh --zrzuty (reklamy i bramka zgody są w niej wyłączone).
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


# rozmiary wymagane przez Google Play: telefon, tablet 7", tablet 10". Ekran emulatora jest zmieniany przez `adb shell wm size/density`,
# więc aplikacja naprawdę układa się pod dany ekran (to nie jest przeskalowany zrzut z telefonu).
# nazwa: (szerokość grafiki, wysokość grafiki, ekran emulatora WxH albo None, gęstość)
PROFILES = {
    'telefon': (1080, 1920, None, None),
    'tablet-7': (1200, 1920, '1200x1920', 240),
    'tablet-10': (1600, 2560, '1600x2560', 280),
}


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


def compose(shot, caption, path, W=1080, H=1920):
    k = W / 1080
    bg = gradient(W, H).convert('RGBA')
    d = ImageDraw.Draw(bg)
    f = font(round(66 * k))
    lines = wrap(d, caption, f, round(W * 0.83))
    y = round(120 * k)
    for ln in lines:
        d.text(((W - d.textlength(ln, font=f)) / 2, y), ln, font=f, fill='white')
        y += round(84 * k)
    top = max(y + round(50 * k), round(380 * k))
    sw = round(W * 0.8)
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


def adb(*a):
    return subprocess.run(['adb', *a], check=False, capture_output=True)


def adb_shot():
    raw = subprocess.check_output(['adb', 'exec-out', 'screencap', '-p'])
    return Image.open(io.BytesIO(raw))


def clean_statusbar(on):
    """Tryb demo Androida: stała godzina, pełna bateria, brak powiadomień na pasku (jak w zrzutach ze sklepu)."""
    if on:
        adb('shell', 'settings', 'put', 'global', 'sysui_demo_allowed', '1')
        for cmd in (['enter'], ['clock', '-e', 'hhmm', '1000'], ['battery', '-e', 'level', '100', '-e', 'plugged', 'false'],
                    ['network', '-e', 'wifi', 'show', '-e', 'level', '4'], ['notifications', '-e', 'visible', 'false']):
            adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', *cmd)
    else:
        adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'exit')


def shots(from_dir=None, only=None):
    base = os.path.join(OUT, 'schermafbeeldingen')
    names = [only] if only else list(PROFILES)
    for prof in names:
        W, H, wm, dpi = PROFILES[prof]
        out = os.path.join(base, prof)
        os.makedirs(out, exist_ok=True)
        if not from_dir:
            print(f'\n=== Rozmiar: {prof} ({W}x{H}) ===')
            if wm:
                adb('shell', 'wm', 'size', wm); adb('shell', 'wm', 'density', str(dpi))
            else:
                adb('shell', 'wm', 'size', 'reset'); adb('shell', 'wm', 'density', 'reset')
            clean_statusbar(True)
        try:
            for i, (name, step, caption) in enumerate(SHOTS, 1):
                if from_dir:
                    dirs = [os.path.join(from_dir, prof)] + ([from_dir] if prof == 'telefon' else [])
                    cand = [os.path.join(d, f) for d in dirs for f in (f'{i:02d}.png', f'{name}.png')]
                    src = next((c for c in cand if os.path.exists(c)), None)
                    if not src:
                        print(f'[{prof}] brak pliku dla kroku {i} ({name}) – pomijam'); continue
                    img = Image.open(src)
                else:
                    input(f'\n[{prof} {i}/{len(SHOTS)}] Ustaw w aplikacji: {step}\n    Enter = zrób zrzut… ')
                    img = adb_shot()
                compose(img, caption, os.path.join(out, name + '.png'), W, H)
                print(f'store/schermafbeeldingen/{prof}/{name}.png')
        finally:
            if not from_dir:
                clean_statusbar(False)
                adb('shell', 'wm', 'size', 'reset'); adb('shell', 'wm', 'density', 'reset')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cmd in ('icon', 'all'): icon()
    if cmd in ('feature', 'all'): feature()
    if cmd == 'shots':
        arg = lambda k: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else None
        if arg('--profile') and arg('--profile') not in PROFILES:
            sys.exit('--profile: ' + ' | '.join(PROFILES))
        shots(arg('--from-dir'), arg('--profile'))
