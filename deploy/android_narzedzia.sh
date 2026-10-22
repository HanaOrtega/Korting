#!/usr/bin/env bash
# Narzedzia do zbudowania aplikacji na TWOIM komputerze (serwer nie jest potrzebny).
# Jedyne, co instalujesz sam: Java (JDK 17-24), np. na Archu:  sudo pacman -S --needed jdk21-openjdk
# (nowsza domyslna Java nie przeszkadza - skrypt sam wybiera pasujaca)
# Reszte ten skrypt pobiera sam, bez roota, do ~/Android/Sdk (ok. 2 GB, jednorazowo):
#   narzedzia Androida (cmdline-tools), platforme Android 37, build-tools 37, NDK 27 i CMake
#   (React Native kompiluje kod natywny).
# Gradle pobiera sie sam przy pierwszym budowaniu (android/gradlew, ok. 150 MB w ~/.gradle).
# Wypisuje na koncu linie ANDROID_HOME=... (dla deploy/serwer.sh).
set -euo pipefail

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
TOOLS_ZIP="commandlinetools-linux-13114758_latest.zip"
PACKAGES=("platforms;android-37.0" "build-tools;37.0.0" "platform-tools" "ndk;27.1.12297006" "cmake;3.22.1")

# Gradle 8.14 runs on Java 17-24 only: a newer default Java (e.g. 27 on Arch) fails with just "27".
# So a fitting JDK is looked up among the installed ones and used for the build (JAVA_HOME), whatever the
# system default is.
JAVA_MIN=17
JAVA_MAX=24
java_major() {      # $1 = a JDK directory
    "$1/bin/java" -version 2>&1 | awk -F'"' '/version/ {split($2, v, "."); print (v[1] == "1" ? v[2] : v[1]); exit}'
}
fits() { [ -x "$1/bin/java" ] && [ -x "$1/bin/keytool" ] && m="$(java_major "$1")" && [ -n "$m" ] \
    && [ "$m" -ge "$JAVA_MIN" ] && [ "$m" -le "$JAVA_MAX" ]; }
pick_java() {
    local c candidates=()
    [ -n "${JAVA_HOME:-}" ] && candidates+=("$JAVA_HOME")
    command -v java >/dev/null 2>&1 && candidates+=("$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")")
    # preferred: 21, then 17, then the rest of the range
    for v in 21 17 24 23 22; do
        for c in /usr/lib/jvm/java-$v-openjdk /usr/lib/jvm/java-$v-openjdk-* /usr/lib/jvm/jdk-$v* /usr/lib/jvm/temurin-$v*; do
            [ -d "$c" ] && candidates+=("$c")
        done
    done
    for c in "${candidates[@]}"; do fits "$c" && { echo "$c"; return 0; }; done
    return 1
}
if ! JDK="$(pick_java)"; then
    echo "[!] Potrzebna Java (JDK) w wersji $JAVA_MIN-$JAVA_MAX - nowsza nie pasuje do narzedzi Androida. Zainstaluj:"
    if command -v pacman >/dev/null 2>&1; then
        echo "    sudo pacman -S --needed jdk21-openjdk"
        echo "    (domyslnej Javy nie trzeba zmieniac - skrypt sam uzyje 21)"
    elif command -v apt-get >/dev/null 2>&1; then
        echo "    sudo apt-get install openjdk-21-jdk-headless"
    else
        echo "    JDK 21 z menedzera pakietow Twojego systemu"
    fi
    exit 1
fi
export JAVA_HOME="$JDK"
export PATH="$JDK/bin:$PATH"
command -v keytool >/dev/null 2>&1 || { echo "[!] Brak keytool - zainstaluj pelne JDK (nie samo JRE)"; exit 1; }

SDKMANAGER="$SDK/cmdline-tools/latest/bin/sdkmanager"
if [ ! -x "$SDKMANAGER" ]; then
    echo "==> Narzedzia Androida do $SDK (jednorazowo, ok. 150 MB)"
    mkdir -p "$SDK/cmdline-tools"
    tmp="$(mktemp -d)"
    trap 'rm -rf "$tmp"' EXIT
    curl -fL --retry 3 -o "$tmp/tools.zip" "https://dl.google.com/android/repository/$TOOLS_ZIP"
    python3 -c 'import sys, zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' "$tmp/tools.zip" "$tmp"
    rm -rf "$SDK/cmdline-tools/latest"
    mv "$tmp/cmdline-tools" "$SDK/cmdline-tools/latest"
    chmod +x "$SDK/cmdline-tools/latest/bin/"*
fi

missing=()
for p in "${PACKAGES[@]}"; do
    [ -d "$SDK/${p//;//}" ] || missing+=("$p")
done
if [ "${#missing[@]}" -gt 0 ]; then
    echo "==> Platforma Androida, build-tools, NDK i CMake (jednorazowo, ok. 1,5 GB)"
    yes | "$SDKMANAGER" --sdk_root="$SDK" --licenses >/dev/null 2>&1 || true
    "$SDKMANAGER" --sdk_root="$SDK" "${missing[@]}" >/dev/null || true
fi
for p in "${PACKAGES[@]}"; do
    [ -d "$SDK/${p//;//}" ] || { echo "[!] Nie udalo sie zainstalowac $p"; exit 1; }
done
echo "JAVA_HOME=$JDK"
echo "ANDROID_HOME=$SDK"
