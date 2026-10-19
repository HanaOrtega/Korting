# Korting

Aplikacja na telefon (React Native / Expo), która z listy zakupów szuka promocji w holenderskich
sklepach. **Działa wyłącznie na telefonie** – bez własnego serwera i bez przeglądarki: aplikacja sama
pobiera promocje ze stron sklepów i trzyma je w pamięci telefonu.

## Co robi

- **Najpierw wybór sklepów.** Przy pierwszym uruchomieniu wybierasz sieci (albo „Znajdź sklepy w pobliżu”
  po lokalizacji) i dopiero potem dostajesz listę. Promocje pokazywane są tylko z wybranych sklepów, a dane
  z pozostałych nie są nawet pobierane (mniej transferu). Wybór zmienisz w zakładce Sklepy.
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
  - **produkty o podobnych nazwach są rozdzielone** i przy niejednoznacznym słowie aplikacja pyta, o który chodzi
    (z holenderską nazwą): „śmietana” → zure room / crème fraîche / kookroom, „śmietanka” → slagroom / kookroom /
    koffiemelk; osobno szynka i wędlina, kiełbasa i parówki, olej i oliwa, kasze, kefir, limonka i cytryna;
    słowa wspólne dla kilku języków („pasta”, „miel”, „pommes”) rozstrzyga język interfejsu;
  - rozpoznanie działa też dla produktów, których akurat nie ma w promocji („brak promocji w tym tygodniu”);
  - poprawiane są też holenderskie słowa z promocji (np. „spekulaas” → speculaas).
- **Lista wg sklepów:** przełącznik „Produkty / Wg sklepów” dzieli listę na sklepy: do którego pojechać i co tam
  kupić (z ceną, sumą orientacyjną i przyciskiem „Nawiguj” do map). Produkt trafia tam, gdzie jest najtańszy,
  a jeśli masz ulubione sieci – najpierw do nich. Produkty bez żadnej promocji są w osobnej sekcji „Bez promocji”.
- **Moje sklepy (zakładka Sklepy):** wybierasz sieci jednym dotknięciem, „Znajdź sklepy w pobliżu” (lokalizacja,
  tylko za zgodą) albo **„Wybierz na mapie”**: mapa OpenStreetMap, na której wyszukujesz dowolne miasto lub adres
  (albo przesuwasz mapę), dotykasz „Szukaj sklepów tutaj” i zaznaczasz pinezki konkretnych sklepów – także w innym
  mieście niż to, w którym jesteś. Wybrany konkretny sklep jest celem nawigacji.
- **Ile taniej i gdzie:** przy każdej ofercie widać oszczędność względem zwykłej ceny („−20% (−€0,40)”, gdy sklep ją
  podaje; dla Aldi liczona z „−33%”) oraz cenę za kg/l, z oznaczeniem najtańszej oferty. Widok **Porównanie** na liście
  zestawia sklepy: koszt tych samych produktów w każdym sklepie (przy znanej gramaturze – tej samej ilości) i zdanie typu
  „te same produkty kosztują o X% mniej w Lidlu niż w Jumbo”. Porównywane są tylko produkty z ceną w obu sklepach,
  a w tabeli widać, jaka oferta za tym stoi.
- **Zakładka Słownik** (osobno, żeby nie zaśmiecać listy): kondycja słownika – ile rozpoznano z Twojej listy (z poprawką
  literówki, przetłumaczonych online, nierozpoznanych), słowa niejednoznaczne, produkty bez ofert w tym tygodniu
  i takie z podejrzanie dużo ofert (możliwe fałszywe trafienia), słowa wspólne dla kilku języków oraz nauczone
  tłumaczenia. Słowa, z którymi słownik miał problem, zapisują się w telefonie, a przyciskiem „Wyślij listę słów” możesz
  je komuś przekazać (np. żeby je dopisać do słownika).
- **Lista z przepisu:** przycisk „📋 Z przepisu” – wklejasz składniki (jeden lub kilka przepisów naraz), a aplikacja robi
  z nich listę zakupów: rozumie ilości i jednostki w 12 językach („1 ½ szklanki”, „2 ząbki”, „200g”, „2 x 200 g”,
  „pół pęczka”, „sól do smaku”), pomija tytuły i nagłówki („Składniki:”), **sumuje te same produkty** („2 jajka” + „3 jajka”
  = 5 szt., „1 kg” + „500 g” = 1,5 kg) i łączy je z tym, co już masz na liście. Podgląd pokazuje wynik przed dodaniem,
  a przycisk ± skaluje porcje. Niejednoznaczne słowa („śmietanka”) zostają z wyborem.
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
- `src/stores.js` – sieci, sklepy w pobliżu (Overpass/OpenStreetMap), wyszukiwanie miejsc (Nominatim), nawigacja
- `src/mapHtml.js`, `src/components/MapPicker.js` – wybór sklepów na mapie (Leaflet w WebView, bez kluczy API)
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

## Ograniczenia porównania cen

- Porównujemy **najtańszą ofertę pasującą do produktu** w każdym sklepie – to nie zawsze ten sam artykuł (np. „kawa”
  może być rozpuszczalna w jednym sklepie i mrożona w drugim); dlatego w tabeli widać nazwę oferty.
- **Zwykłych cen (bez promocji) prawie nie mamy**: lidl.nl poza promocjami pokazuje tylko sprzęt, a Aldi, Jumbo, Dirk i Plus
  nie wystawiają ich w tych samych danych. Zwykłe ceny pobieramy tylko z Albert Heijn (niesprawdzone na żywo).
- Jumbo często podaje tylko mechanizm („25% korting”, „1+1 gratis”) bez ceny bazowej – takie oferty nie mają ceny,
  więc nie wchodzą do porównania („2 voor 6,49” liczymy jako 3,25 za sztukę).

## Składniki z przepisu: zasady sumowania

- Sumowane są ilości w tej samej jednostce; masa (g, kg, oz, lb) i objętość (ml, l, dl, cl) są przeliczane na g i ml.
- Miary kuchenne zależą od kraju, więc przepis w obcym języku jest przeliczany według regionu: angielskie `tbsp/tsp/cup/pint/
  quart/gallon/fl oz` mają inną wielkość w metrycznym (łyżka 15 ml, szklanka 250 ml), USA (14,79 ml, 236,6 ml), UK
  (szklanka 284 ml) i Australii (łyżka 20 ml). „Auto” wykrywa region po tekście (cups, sticks, oz, lb, °F → USA), a w oknie
  przepisu można go ustawić ręcznie. Łyżki/szklanki w innych językach używają wartości stałych (15/5/250 ml).
- Przeliczone na g/ml są oz, lb, stick oraz – dla produktów ze znaną gęstością (mąka, cukier, masło, mleko, olej…) – także
  łyżki i szklanki. Takie wartości są przybliżone i oznaczone „≈” (zaokrąglone, np. do 5 g).
- Sztuki, ząbki, puszki itd. to osobne jednostki i zostają obok siebie.
- Ten sam produkt rozpoznaję po słowniku (także w innym języku i w odmianie) albo, dla nieznanych słów, po podobnym początku
  nazwy („parmezan” ≈ „parmezanu”).

## Produkty ogólne i szczegółowe

- Słownik ma hierarchię (`PARENT_OF` w `src/match.js`): „olej”, „ser”, „mleko”, „makaron”, „orzechy”, „mięso”, „kurczak”… obejmują
  odmiany, ale odmiana nie obejmuje ogólnego produktu: „olej rzepakowy”, „filet z piersi kurczaka”, „czerwona cebula”,
  „ser parmezan”, „cukier puder” to osobne pozycje, szukane i sumowane osobno.
- Wpis, który jest dokładniejszy niż znalezione pojęcie, a nie ma go w słowniku („olej arganowy”), jest oznaczany jako
  szczegółowy: w przepisie zostaje osobną pozycją, a na liście aplikacja tłumaczy całą frazę na holenderski (online, wynik
  zapamiętany) i szuka dokładnie tego. Bez internetu szuka ogólnie i pokazuje o tym informację.
- Pomijane są słowa, które nie zmieniają produktu (świeży, duży, posiekany, natka, listki…).

## Ilości z przepisu a zakupy

- Ilość z przepisu (np. „500 g”) jest wyróżniona kolorem przy pozycji na liście i w widoku „Wg sklepów”. Aplikacja niczego
  nie przelicza na gramatury promocji – pokazuje tylko to, co wynika z przepisu (po zsumowaniu).

## Odporność wklejania przepisów

Tekst jest najpierw ujednolicany (Unicode NFKC, twarde/wąskie spacje, niewidoczne znaki, HTML, markdown, wypełniacze
„.....”), potem: usuwane są puste linie między każdymi dwiema liniami, a linie z samą ilością („500 gramów”, „2”) są
doklejane do najbliższej nazwy (poprzedniej albo następnej). Ilość może też stać na końcu linii („kurczak: 500 g”,
„kurczak – 500 g”, „kurczak (500 g)”, „jajka 3”). Linie, których nie da się odczytać, są wypisane w oknie przepisu,
a nie gubione po cichu.
