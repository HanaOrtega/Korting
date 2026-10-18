#!/usr/bin/env bash
# Korting: aplikacja na Androida (.apk do telefonu i .aab do Google Play), budowana na TYM komputerze
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
        -validity 10000 -dname "CN=Korting"
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
cp "$apk" android/dist/Korting.apk
cp "$aab" android/dist/Korting.aab
echo "Gotowe: android/dist/Korting.apk (na telefon) i android/dist/Korting.aab (do Google Play Console)"
echo "Instalacja przez USB (debugowanie USB wlaczone):  adb install -r android/dist/Korting.apk"
