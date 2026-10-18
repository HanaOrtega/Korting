# Korting

Aplikacja na telefon (React Native / Expo), która z listy zakupów szuka promocji w holenderskich
sklepach. **Działa wyłącznie na telefonie** – bez własnego serwera i bez przeglądarki: aplikacja sama
pobiera promocje ze stron sklepów i trzyma je w pamięci telefonu.

## Co robi

- **Lista zakupów jest stroną główną.** Wpisujesz produkty w swoim języku (np. „mleko, chleb, kurczak”),
  a aplikacja szuka dla nich promocji po holendersku i pokazuje od najtańszej: nazwa, miniaturka, cena, sklep,
  do kiedy ważna promocja.
- **12 języków** (interfejs i rozpoznawanie produktów): PL, EN, NL, DE, FR, ES, IT, PT, TR, UK, RO, RU.
  Produkt można wpisać w dowolnym z nich, niezależnie od języka interfejsu.
- **Rozpoznawanie i poprawianie pomyłek:**
  - słownik ~185 produktów w 12 językach, także w odmienionej formie („pomidorów”, „masła”, „jabłek”, „kurczaka”);
  - literówki są korygowane („mlko” → mleko, „kurzcak” → kurczak) i pokazywane jako „Czy chodziło o:”
    z możliwością zmiany; podpowiedzi pojawiają się już podczas pisania;
  - słowa spoza słownika są tłumaczone w tle na holenderski (MyMemory, a w razie awarii Google Translate),
    a wynik zapamiętywany w telefonie – wymaga internetu tylko za pierwszym razem;
  - rozpoznanie działa też dla produktów, których akurat nie ma w promocji („brak promocji w tym tygodniu”);
  - poprawiane są też holenderskie słowa z promocji (np. „spekulaas” → speculaas).
- **Lista wg sklepów:** przełącznik „Produkty / Wg sklepów” dzieli listę na sklepy: do którego pojechać i co tam
  kupić (z ceną, sumą orientacyjną i przyciskiem „Nawiguj” do map). Produkt trafia tam, gdzie jest najtańszy,
  a jeśli masz ulubione sieci – najpierw do nich. Produkty bez żadnej promocji są w osobnej sekcji „Bez promocji”.
- **Ulubione sklepy (zakładka Sklepy):** wybierasz sieci jednym dotknięciem albo „Znajdź sklepy w pobliżu” –
  aplikacja pobiera lokalizację (tylko wtedy, za zgodą) i szuka sklepów w OpenStreetMap; ulubiony konkretny sklep
  jest celem nawigacji.
- Zakładka **Promocje**: wszystkie promocje, wyszukiwarka, filtr sklepu, sortowanie (koniec promocji, cena,
  sklep, nazwa), „＋” dodaje produkt do listy.
- Dane są zapamiętywane na telefonie (lista, język, ulubione, ostatnie promocje – działa offline) i odświeżane
  najwyżej co 6 godzin albo po pociągnięciu listy Promocje w dół.

## Źródła promocji

| Sklep | Skąd | Status |
|---|---|---|
| Aldi | JSON osadzony na stronie aanbiedingen | sprawdzone na żywo |
| Lidl | wyszukiwarka lidl.nl (tylko pozycje z datą końca = promocje tygodnia) | sprawdzone na żywo |
| Jumbo | dane Nuxt ze strony /aanbiedingen/nu | sprawdzone na żywo; część promocji to „2 voor 6,49” / „1+1 gratis” – wtedy pokazujemy opis promocji zamiast ceny |
| Dirk | dane Nuxt ze strony /aanbiedingen | sprawdzone na żywo |
| Plus | strona ma ochronę antybotową – ładowana w ukrytym WebView, aplikacja przechwytuje odpowiedź API | mechanizm sprawdzony w przeglądarce na komputerze; w WebView na telefonie niesprawdzony |
| Albert Heijn | nieoficjalne API mobilne (token anonimowy + wyszukiwarka), parametry dobierane automatycznie | **niesprawdzone na żywo** (ah.nl blokuje serwery, a tam powstawał kod). Jeśli nie działa, dotknij żółtego komunikatu u góry – pokaże dokładny błąd, z którym da się go naprawić |

Gdy sklep zawiedzie, reszta działa dalej, a aplikacja pokazuje który się nie załadował i zostawia jego
poprzednie, jeszcze ważne promocje. Parsery opierają się na strukturze stron – jeśli sklep ją zmieni, trzeba
poprawić plik w `src/providers/`. Pełne odświeżenie pobiera kilkanaście MB danych (głównie Lidl, Jumbo i Dirk),
dlatego jest ograniczone do raz na 6 godzin.

## Budowanie aplikacji (Linux, jedno polecenie)

Na komputerze, z katalogu głównego repozytorium (serwer nie jest potrzebny):

```bash
./deploy/aplikacja.sh
```

Sam instalujesz tylko Javę (JDK 17–24) i Node.js, np. na Archu: `sudo pacman -S --needed jdk21-openjdk nodejs npm`.
Skrypt:

1. `deploy/android_narzedzia.sh` pobiera Android SDK, NDK i CMake do `~/Android/Sdk` (ok. 2,5 GB, jednorazowo)
   i ustawia `ANDROID_HOME` / `JAVA_HOME`;
2. za pierwszym razem robi `npm ci`;
3. za pierwszym razem tworzy klucz `android/korting-upload.keystore` (zrób kopię i zapamiętaj hasło – bez nich
   nie zainstalujesz aktualizacji ani nie wydasz jej w Google Play); przy każdym budowaniu pyta o hasło
   i je sprawdza;
4. buduje `./gradlew :app:bundleRelease :app:assembleRelease` (pierwszy raz kilkanaście minut);
5. kopiuje wyniki do `android/dist/`: `Korting.apk` (na telefon) i `Korting.aab` (do Google Play Console).

Instalacja przez USB (z włączonym debugowaniem): `adb install -r android/dist/Korting.apk`.
Budowany jest tylko `arm64-v8a` (współczesne telefony); inne architektury w `android/gradle.properties`
(`reactNativeArchitectures`). Alternatywnie można otworzyć folder `android/` w Android Studio.

Testy logiki i parserów: `npm test`.

## Struktura

- `App.js` – stan aplikacji, nagłówek, zakładki, wybór języka
- `src/match.js` – rozpoznawanie produktów (słownik, odmiana, literówki, podpowiedzi) i dopasowanie do promocji
- `src/plan.js` – podział listy na sklepy
- `src/stores.js` – sieci, sklepy w pobliżu (Overpass/OpenStreetMap), nawigacja
- `src/translate.js` – zapasowe tłumaczenie na holenderski
- `src/data/glossary.js` – słownik produktów w 12 językach (tłumaczenia warto sprawdzić z natywnymi użytkownikami)
- `src/i18n.js` – teksty interfejsu
- `src/providers/` – po jednym pliku na sklep (`{ name, fetch() }`), rejestr w `index.js`
- `src/components/`, `src/screens/` – interfejs; `WebViewHost.js` to ukryty WebView dla Plusa
- `src/deals.js` – pobieranie, pamięć podręczna, błędy per sklep
- `deploy/` – skrypty budowania

Dodanie sklepu: nowy plik w `src/providers/` zwracający listę
`{ id, store, name, description, unit, price|null, promoText, validFrom, validUntil, image, url }`
i wpis w `src/providers/index.js`; sieć dopisz też w `CHAINS` w `src/stores.js`.
Dodanie produktu/języka: wiersz w `src/data/glossary.js`.

## Sklepy w pobliżu

Lokalizacja jest używana wyłącznie po dotknięciu „Znajdź sklepy w pobliżu”. Dane o sklepach pochodzą z
OpenStreetMap (Overpass API; kilka serwerów zapasowych); rozpoznawane są sieci Albert Heijn, Aldi, Lidl, Jumbo,
Dirk i Plus. Promocje są ogólnokrajowe, więc ulubiony sklep służy do wyboru sieci i nawigacji.
