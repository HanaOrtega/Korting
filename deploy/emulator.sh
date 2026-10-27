#!/usr/bin/env bash
# Kortinglijst na emulatorze Androida na TWOIM komputerze (Linux/Arch) - jednym poleceniem:
#
#   ./deploy/emulator.sh            # instaluje narzedzia, tworzy emulator, buduje aplikacje i ja uruchamia
#   ./deploy/emulator.sh --reinstall  # tylko przebuduj aplikacje i wgraj ja do dzialajacego emulatora
#   ./deploy/emulator.sh --zrzuty     # wersja BEZ reklam i bramki zgody - do zrzutow na Google Play (potem: python3 deploy/sklep_grafiki.py shots)
#                                     # (wariant tylko do zrzutow - nie wysylaj go do sklepu; zwykle ./deploy/emulator.sh przywraca reklamy)
#   EMULATOR_ARGS="-no-window" ./deploy/emulator.sh   # dodatkowe opcje emulatora
#
# Wymaga wirtualizacji (KVM) - bez niej emulator x86 jest bardzo wolny. Na Archu (jednorazowo):
#   sudo pacman -S --needed jdk21-openjdk nodejs npm qemu-base libpulse libxkbcommon-x11 nss
#   sudo usermod -aG kvm "$USER"    # potem wyloguj sie i zaloguj
# Do emulatora (x86_64) budowany jest osobny wariant aplikacji; podpis: debug (hasla nie trzeba).
# Obraz systemu ma Google Play, wiec dziala logowanie do Google, reklamy testowe i zakupy testowe.
set -euo pipefail
cd "$(dirname "$0")/.."

SHOTS_MODE=0
for a in "$@"; do [ "$a" = "--zrzuty" ] && SHOTS_MODE=1; done
[ "${1:-}" = "--zrzuty" ] && set -- --reinstall   # zrzuty: tylko przebuduj i wgraj
AVD_NAME="${AVD_NAME:-korting}"
IMAGE="system-images;android-35;google_apis_playstore;x86_64"
PKG="com.gokhstudio.kortinglijst"

command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 || {
    echo "[!] Potrzebny Node.js z npm:  sudo pacman -S --needed nodejs npm"; exit 1; }

sdk_out="$(bash deploy/android_narzedzia.sh | tee /dev/stderr)"
ANDROID_HOME="$(printf '%s\n' "$sdk_out" | sed -n 's/^ANDROID_HOME=//p' | tail -1)"
JAVA_HOME="$(printf '%s\n' "$sdk_out" | sed -n 's/^JAVA_HOME=//p' | tail -1)"
export ANDROID_HOME JAVA_HOME ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

# --- wirtualizacja ---
if [ ! -e /dev/kvm ]; then
    echo "[!] Brak /dev/kvm - wlacz wirtualizacje (VT-x/AMD-V) w BIOS-ie i zaladuj modul: sudo modprobe kvm_intel (albo kvm_amd)"; exit 1
fi
if [ ! -r /dev/kvm ] || [ ! -w /dev/kvm ]; then
    echo "[!] Brak dostepu do /dev/kvm - dodaj siebie do grupy kvm i zaloguj sie ponownie:  sudo usermod -aG kvm \"$USER\""; exit 1
fi

if [ "${1:-}" != "--reinstall" ]; then
    # --- emulator i obraz systemu ---
    if [ ! -x "$ANDROID_HOME/emulator/emulator" ] || [ ! -d "$ANDROID_HOME/system-images/android-35/google_apis_playstore/x86_64" ]; then
        echo "==> Emulator i obraz Androida 35 z Google Play (jednorazowo, ok. 2 GB)"
        yes | sdkmanager --licenses >/dev/null 2>&1 || true
        sdkmanager --install "emulator" "$IMAGE"
    fi
    if ! avdmanager list avd -c 2>/dev/null | grep -qx "$AVD_NAME"; then
        echo "==> Tworze urzadzenie wirtualne '$AVD_NAME' (Pixel 6)"
        echo no | avdmanager create avd -n "$AVD_NAME" -k "$IMAGE" -d pixel_6 --force >/dev/null
        cfg="$HOME/.android/avd/$AVD_NAME.avd/config.ini"
        { echo "hw.keyboard=yes"; echo "hw.ramSize=3072"; echo "disk.dataPartition.size=6G"; } >> "$cfg"
    fi
fi

# --- start emulatora ---
if ! adb devices | grep -q "^emulator-.*device$"; then
    echo "==> Uruchamiam emulator (pierwszy start trwa kilka minut)"
    # shellcheck disable=SC2086
    nohup emulator -avd "$AVD_NAME" -gpu auto -no-snapshot-save -netdelay none -netspeed full ${EMULATOR_ARGS:-} >/tmp/korting-emulator.log 2>&1 &
    adb wait-for-device
    printf '    czekam na system'
    until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do printf '.'; sleep 3; done
    echo
fi

# --- biblioteki JS (tak jak w aplikacja.sh) ---
lock_hash="$(sha256sum package-lock.json | cut -d' ' -f1)"
if [ ! -d node_modules ] || [ "$(cat node_modules/.korting-lock 2>/dev/null || true)" != "$lock_hash" ]; then
    echo "==> Biblioteki JavaScript (npm ci)"
    npm ci --no-audit --no-fund
    echo "$lock_hash" > node_modules/.korting-lock
fi

# --- Client ID Google / reklamy z plikow, jesli sa (bez pytan) ---
[ -f .google-client-id ] && export EXPO_PUBLIC_GOOGLE_CLIENT_ID="$(tr -d ' \r\n' < .google-client-id)"
if [ -f .admob-banner-id ] && grep -qE '^ca-app-pub-[0-9]+/[0-9]+$' .admob-banner-id; then
    echo "==> Uwaga: masz wlasne ID AdMob - w emulatorze zostaja reklamy TESTOWE (nie klikaj prawdziwych reklam)"
fi

# --- budowanie wariantu x86_64 ---
pkg_arch="$PKG|x86_64"
if [ "$SHOTS_MODE" = 1 ]; then export EXPO_PUBLIC_STORE_SHOTS=1; fi
# zmiana trybu zrzutow zmienia wartosc wstawiana do JS - wymus ponowne zbudowanie paczki JS
if [ "$(cat android/app/build/.korting-shots 2>/dev/null || echo 0)" != "$SHOTS_MODE" ]; then
    rm -rf android/app/build/generated/assets android/app/build/intermediates/assets android/app/build/intermediates/merged_assets node_modules/.cache "${TMPDIR:-/tmp}"/metro-* 2>/dev/null || true
fi
if [ -d android/app/build ] && [ "$(cat android/app/build/.korting-emulator 2>/dev/null || true)" != "$pkg_arch" ]; then
    echo "==> Zmiana pakietu/architektury - czyszcze stare pliki budowania"
    rm -rf android/app/build android/build android/.gradle
fi
rm -rf android/app/build/generated/autolinking android/build/generated/autolinking
mkdir -p android/app/build && printf '%s' "$pkg_arch" > android/app/build/.korting-emulator && printf '%s' "$SHOTS_MODE" > android/app/build/.korting-shots
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
echo "==> Buduje aplikacje na emulator (x86_64; pierwszy raz kilkanascie minut)"
(cd android && ./gradlew -q --no-daemon :app:assembleRelease -PreactNativeArchitectures=x86_64)
apk="android/app/build/outputs/apk/release/app-release.apk"
[ -f "$apk" ] || { echo "[!] Nie znaleziono $apk"; exit 1; }
# po zmianie architektury ten plik jest wariantem x86_64, wiec NIE nadaje sie na telefon - do telefonu uzyj ./deploy/aplikacja.sh

echo "==> Instaluje i uruchamiam"
adb install -r "$apk"
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
echo "Gotowe: Kortinglijst dziala na emulatorze. Logi aplikacji:  adb logcat --pid=\$(adb shell pidof $PKG)"
