#!/usr/bin/env bash
# Kortinglijst: aplikacja na Androida (.apk do telefonu i .aab do Google Play), budowana na TYM komputerze
# (serwer nie jest potrzebny - aplikacja sama pobiera promocje na telefonie).
#
#   ./deploy/aplikacja.sh
#
# Sam instalujesz tylko Jave (JDK 17-24) i Node.js, np. na Archu:
#   sudo pacman -S --needed jdk21-openjdk nodejs npm
# Narzedzia Androida pobiera deploy/android_narzedzia.sh (do ~/Android/Sdk), biblioteki JS - npm ci.
# Podpis: android/korting-upload.keystore (tworzony za pierwszym razem; NIE trafia do repozytorium -
# zrob kopie! Bez klucza i hasla nie zainstalujesz aktualizacji na telefonie ani nie wydasz jej w Google Play).
set -euo pipefail
cd "$(dirname "$0")/.."

command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 || {
    echo "[!] Potrzebny Node.js z npm:  sudo pacman -S --needed nodejs npm"; exit 1; }

sdk_out="$(bash deploy/android_narzedzia.sh | tee /dev/stderr)"
ANDROID_HOME="$(printf '%s\n' "$sdk_out" | sed -n 's/^ANDROID_HOME=//p' | tail -1)"
JAVA_HOME="$(printf '%s\n' "$sdk_out" | sed -n 's/^JAVA_HOME=//p' | tail -1)"
export ANDROID_HOME JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

# Gradle pakuje JavaScript i bierze wtyczki z node_modules. Biblioteki sa doinstalowywane za kazdym razem,
# gdy zmieni sie package-lock.json (np. po git pull z nowa zaleznoscia) - nie tylko gdy brakuje folderu.
lock_hash="$(sha256sum package-lock.json | cut -d' ' -f1)"
if [ ! -d node_modules ] || [ "$(cat node_modules/.korting-lock 2>/dev/null || true)" != "$lock_hash" ]; then
    echo "==> Biblioteki JavaScript (npm ci)"
    npm ci --no-audit --no-fund
    echo "$lock_hash" > node_modules/.korting-lock
fi

KEYSTORE=android/korting-upload.keystore
if [ ! -f "$KEYSTORE" ]; then
    echo "==> Klucz podpisu aplikacji (jednorazowo)."
    echo "    Wymysl haslo (min. 6 znakow) i ZAPAMIETAJ je - bez klucza i hasla nie zrobisz aktualizacji."
    keytool -genkeypair -keystore "$KEYSTORE" -alias korting -keyalg RSA -keysize 4096 \
        -validity 10000 -dname "CN=GOKH Studio, O=GOKH Studio"
    chmod 600 "$KEYSTORE"
fi
read -r -s -p "Haslo klucza ($KEYSTORE): " KORTING_KEY_PASSWORD; echo
export KORTING_KEY_PASSWORD
# klucz i haslo sprawdzane najpierw (ta sama Java co przy budowaniu) - czytelny komunikat zamiast stosu bledow
if ! key_check="$(keytool -list -keystore "$KEYSTORE" -storepass:env KORTING_KEY_PASSWORD -alias korting 2>&1)"; then
    if printf '%s' "$key_check" | grep -qiE "password was incorrect|tampered|BadPadding"; then
        echo "[!] Zle haslo klucza - uruchom ponownie i wpisz haslo podane przy tworzeniu klucza."
    else
        echo "[!] Java $JAVA_HOME nie umie odczytac klucza: $(printf '%s' "$key_check" | tail -1)"
        echo "    Jesli tego klucza NIGDY nigdzie nie uzyto: usun $KEYSTORE i uruchom ponownie."
    fi
    exit 1
fi

sha1="$(keytool -list -v -keystore "$KEYSTORE" -storepass:env KORTING_KEY_PASSWORD -alias korting 2>/dev/null | sed -n 's/^ *SHA1: *//p' | head -1)"
[ -n "$sha1" ] && echo "==> SHA-1 certyfikatu (do klienta OAuth 'Android' w Google Cloud - Wspolna lista): $sha1"

# Client ID Google wbudowany w aplikacje: uzytkownicy Wspolnej listy tylko loguja sie do Google, nic nie konfiguruja.
CLIENT_FILE=.google-client-id
if [ -z "${EXPO_PUBLIC_GOOGLE_CLIENT_ID:-}" ] && [ -f "$CLIENT_FILE" ]; then
    EXPO_PUBLIC_GOOGLE_CLIENT_ID="$(tr -d ' \r\n' < "$CLIENT_FILE")"
fi
if [ -z "${EXPO_PUBLIC_GOOGLE_CLIENT_ID:-}" ]; then
    echo "==> Wspolna lista (Dysk Google): jednorazowo potrzebny Client ID. Console.cloud.google.com -> projekt -> wlacz Google Drive API"
    echo "    -> OAuth consent screen (zakres .../auth/drive, 'In production') -> Credentials -> OAuth client ID typu Android:"
    echo "    pakiet com.gokhstudio.kortinglijst, SHA-1 jak wyzej, w Advanced wlacz 'Custom URI scheme'. Szczegoly: README."
    read -r -p "Client ID Google (Enter = pomin; wtedy Wspolna lista poprosi o wpisanie): " cid || cid=""
    cid="$(printf '%s' "$cid" | tr -d ' \r\n')"
    if [ -n "$cid" ]; then printf '%s\n' "$cid" > "$CLIENT_FILE"; EXPO_PUBLIC_GOOGLE_CLIENT_ID="$cid"; fi
fi
export EXPO_PUBLIC_GOOGLE_CLIENT_ID="${EXPO_PUBLIC_GOOGLE_CLIENT_ID:-}"

# Reklamy (AdMob): bez wlasnych identyfikatorow wyswietlaja sie reklamy TESTOWE Google. Identyfikatory zapisuja sie w
# .admob-app-id i .admob-banner-id (poza repozytorium); wpisz 'test' lub Enter, aby zostac przy reklamach testowych.
ask_id() { # plik, pytanie
    if [ ! -f "$1" ]; then
        read -r -p "$2" v || v=""
        v="$(printf '%s' "$v" | tr -d ' \r\n')"; printf '%s\n' "${v:-test}" > "$1"
    fi
    tr -d ' \r\n' < "$1"
}
admob_app="$(ask_id .admob-app-id "AdMob: ID aplikacji (ca-app-pub-XXXX~YYYY; Enter = reklamy testowe): ")"
admob_banner="$(ask_id .admob-banner-id "AdMob: ID banera (ca-app-pub-XXXX/ZZZZ; Enter = testowy): ")"
if printf '%s' "$admob_app" | grep -qE '^ca-app-pub-[0-9]+~[0-9]+$' && printf '%s' "$admob_banner" | grep -qE '^ca-app-pub-[0-9]+/[0-9]+$'; then
    cp app.json app.json.korting-bak
    trap 'mv -f app.json.korting-bak app.json 2>/dev/null || true' EXIT
    node -e "const fs=require('fs');const a=JSON.parse(fs.readFileSync('app.json','utf8'));a['react-native-google-mobile-ads'].android_app_id=process.argv[1];fs.writeFileSync('app.json',JSON.stringify(a,null,2))" "$admob_app"
    export EXPO_PUBLIC_ADMOB_BANNER_ID="$admob_banner"
    echo "==> Reklamy: wlasne identyfikatory AdMob"
else
    echo "==> Reklamy: testowe (podaj ID w .admob-app-id i .admob-banner-id, zeby zarabiac)"
fi

# Po zmianie nazwy pakietu w android/app/build zostaja stare, wygenerowane pliki (np. autolinking z poprzednim pakietem)
# i kompilacja konczy sie bledem "package ... does not exist" - czyscimy je, gdy pakiet sie zmienil.
pkg="$(sed -n "s/^[[:space:]]*applicationId '\(.*\)'/\1/p" android/app/build.gradle | head -1)"
if [ -d android/app/build ] && [ "$(cat android/app/build/.korting-package 2>/dev/null || true)" != "$pkg" ]; then
    echo "==> Zmienil sie pakiet ($pkg) - czyszcze stare pliki budowania"
    rm -rf android/app/build android/.gradle
fi
rm -rf android/app/build/generated/autolinking  # zawsze odtwarzane od zera
mkdir -p android/app/build && printf '%s' "$pkg" > android/app/build/.korting-package

echo "sdk.dir=$ANDROID_HOME" > android/local.properties
echo "==> Buduje aplikacje (pierwszy raz kilkanascie minut - pobiera Gradle, biblioteki i kompiluje kod natywny)"
if ! (cd android && ./gradlew -q --no-daemon :app:bundleRelease :app:assembleRelease); then
    echo "[!] Budowanie nieudane - przyczyna wyzej (\"What went wrong\"); przy"
    echo "    'Keystore was tampered with' / 'password was incorrect' to zle haslo klucza"
    exit 1
fi

apk=android/app/build/outputs/apk/release/app-release.apk
aab=android/app/build/outputs/bundle/release/app-release.aab
[ -f "$apk" ] || { echo "[!] Brak pliku $apk"; exit 1; }
mkdir -p android/dist
cp "$apk" android/dist/Kortinglijst.apk
cp "$aab" android/dist/Kortinglijst.aab
echo "Gotowe: android/dist/Kortinglijst.apk (na telefon) i android/dist/Kortinglijst.aab (do Google Play Console)"
echo "Instalacja przez USB (debugowanie USB wlaczone):  adb install -r android/dist/Kortinglijst.apk"
