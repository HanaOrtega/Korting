# Kortinglijst

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
  podaje; dla Aldi liczona z „−33%”) oraz cenę za kg/l, z oznaczeniem najtańszej oferty.
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
5. kopiuje wyniki do `android/dist/`: `Kortinglijst.apk` (na telefon) i `Kortinglijst.aab` (do Google Play Console).

Instalacja przez USB (z włączonym debugowaniem): `adb install -r android/dist/Kortinglijst.apk`.
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

## Interfejs

Dolny pasek zakładek z ikonami (Lista, Promocje, Sklepy, Słownik) uwzględnia pasek nawigacji systemu
(`react-native-safe-area-context`), ikony rysuje `react-native-svg`. Kolory, typografia, promienie i cienie są w
`src/theme.js` (jasny i ciemny motyw), wspólne klocki w `src/components/ui.js`. Sieci mają własne barwy.
Widok porównania cen został usunięty.

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

## Edycja pozycji

Przy każdej pozycji na liście jest ✎: pozwala zmienić nazwę i ilość (np. „500 g”, „2 szt + 30 ml”, „1,5 l”). Zmiana nazwy
uruchamia rozpoznawanie od nowa; pusta ilość usuwa ilość.

## Automatyczne odświeżanie i motyw

- Promocje odświeżają się same: przy starcie, po powrocie do aplikacji i co 15 minut, gdy jest otwarta. Pobierane są tylko
  dane starsze niż 6 godzin (osobno dla każdego sklepu) albo brakujące, więc nie ma zbędnego transferu. Czas ostatniej
  aktualizacji widać pod nazwą aplikacji; w zakładce Promocje działa też przeciągnięcie listy w dół. Odświeżanie działa
  tylko przy otwartej aplikacji (bez zadań w tle).
- Motyw jasny/ciemny podąża za ustawieniem telefonu i zmienia się na bieżąco. W menu języka (🌐) można wymusić „Jasny” lub
  „Ciemny”; wybór jest zapamiętany.

## Wspólna lista (rodzina)

Lista może być współdzielona przez zaszyfrowany plik na Dysku Google osoby „głównej” (ikona 👥 w nagłówku). Nie ma żadnego
serwera: każdy telefon rozmawia bezpośrednio z Dyskiem Google.

**Jak to działa**
- Plik `korting-…` na Dysku zawiera całą listę zaszyfrowaną XChaCha20-Poly1305 kluczem grupy (256 bit). Google widzi
  tylko szyfrogram. Klucz jest w zaproszeniu i w Android Keystore telefonu – nigdy na Dysku (poza opakowaniem przy rotacji).
- **Odczyt na bieżąco:** telefon z otwartą aplikacją pyta Dysk co 8 s o numer wersji pliku (jedno tanie zapytanie) i pobiera
  plik tylko, gdy się zmienił; własne zmiany wysyła ~1,2 s po edycji. Dysk Google nie ma powiadomień push bez serwera,
  więc to odpytywanie – opóźnienie zwykle kilka sekund; przy zamkniętej aplikacji synchronizacja nie działa.
- **Równoczesne edycje:** każda pozycja ma czas ostatniej zmiany, usunięcia to znaczniki (30 dni). Scalanie jest
  przemienne i idempotentne, a każdy telefon podtrzymuje swój stan, więc wszystkie zbiegają się do tej samej listy nawet
  bez blokad (testy: `tests/share.test.js`). Przy sprzecznych zmianach tej samej pozycji wygrywa późniejsza.
- **Dodawanie osoby:** właściciel wpisuje jej e-mail Google → aplikacja udostępnia plik (rola edytora; Google wysyła
  powiadomienie) i generuje kod `korting://join/…` (id pliku + klucz + Client ID). Kod wysyłasz prywatnie (np. komunikatorem);
  druga osoba otwiera link albo wkleja kod w Wspólna lista → Dołącz, loguje się do Google i jej lista łączy się z grupową.
- **Usunięcie osoby:** cofnięcie dostępu do pliku + rotacja klucza (nowy klucz opakowany starym w nagłówku pliku, więc
  pozostali członkowie przechodzą na niego automatycznie). Osoba usunięta zachowuje tylko to, co już miała na telefonie.
- **Opuszczenie grupy** odłącza telefon (lista zostaje); właściciel może też rozwiązać grupę (usuwa plik).

**Dla użytkownika: tylko logowanie do Google.** Tworzenie grupy to nazwa + „Kontynuuj z Google”; dołączanie to dotknięcie
linku z zaproszeniem + logowanie do Google. Zaproszenie domyślnie działa samym kodem („każdy z kodem może dołączyć” –
plik ma dostęp „każdy z linkiem”, ale jest zaszyfrowany, więc link niczego nie ujawnia); nie trzeba wpisywać e-maili.
Przełącznik w oknie grupy przełącza na tryb „tylko osoby dodane e-mailem” (zmienia klucz szyfrujący).

**Jednorazowo dla Ciebie jako twórcy aplikacji (~5 min, potem nikt już nic nie konfiguruje)**
1. console.cloud.google.com → nowy projekt → *APIs & Services* → włącz **Google Drive API**.
2. *OAuth consent screen* → External; dodaj zakres `.../auth/drive`; ustaw *Publishing status: In production*
   (aplikacja „niezweryfikowana” – dla rodziny to tylko jeden dodatkowy ekran; w trybie Testing Google wylogowuje co 7 dni).
3. *Credentials* → *Create OAuth client ID* → typ **Android**, pakiet `com.gokhstudio.kortinglijst`, SHA-1 wypisany przez
   `./deploy/aplikacja.sh`; w *Advanced settings* włącz **Custom URI scheme**.
4. `./deploy/aplikacja.sh` zapyta o Client ID (raz; zapisze w `.google-client-id`, poza repozytorium) i wbuduje go w
   aplikację. Wszyscy instalują ten sam APK (podpisany Twoim kluczem – Google sprawdza podpis).

**Zakres `drive`:** pozwala otworzyć plik udostępniony przez właściciela (węższy `drive.file` nie dotyka plików
udostępnionych przez kogoś innego). Aplikacja używa wyłącznie pliku, którego id zna z zaproszenia.

**Niesprawdzone na żywo:** logowanie OAuth, wywołania Dysku i rotacja klucza zostały sprawdzone testami z atrapą Dysku,
ale nie z prawdziwym kontem Google (w środowisku budowania nie ma dostępu do Google).

## Historia listy i „Cofnij”

- Każda zmiana listy (usunięcie, dodanie, edycja, odhaczenie, import przepisu, „Usuń kupione”) zapisuje w historii stan
  *sprzed* zmiany; zmiany w ciągu 10 s łączą się w jeden wpis (do 40 wpisów, zapamiętane w telefonie).
- Po usunięciu pozycji albo wklejeniu przepisu na dole pojawia się pasek **Cofnij** (7 s).
- Ikona historii w nagłówku: dla każdego wpisu **Przywróć usunięte** (dokłada tylko brakujące pozycje, nowsze zmiany
  zostają) albo **Przywróć całą listę**. Przywrócenie samo trafia do historii, więc też można je cofnąć.
- Zmiany przychodzące od grupy (wspólna lista) nie trafiają do „cofania” tego telefonu; przywrócone pozycje wracają do
  grupy jako nowsza zmiana. Napisy wspólnej listy i historii są we wszystkich 12 językach (test `tests/i18n.test.js`
  pilnuje kompletności i zmiennych `{n}`, `{name}`…).

## Nazwa i ikona

Nazwa aplikacji to **Kortinglijst** („Slimme Boodschappen”). Ikona (wózek z listą i metką %) pochodzi z dostarczonej
grafiki: `assets/source/logo-circle-crop.png`; wszystkie rozmiary (ikona Expo, adaptacyjna, monochromatyczna, ekran startowy,
mipmapy Androida) generuje `python3 deploy/generuj_ikony.py` (Pillow + numpy). Identyfikator pakietu (`com.gokhstudio.kortinglijst`)
i klucz podpisu zostają bez zmian, więc aktualizacja instaluje się na istniejącej aplikacji.

## Komfort i skupienie

Menu (☰ w nagłówku) → **Komfort i skupienie**. Wszystko jest opcjonalne i domyślnie wyłączone; ustawienia są zapamiętane.

**Skupienie i planowanie**
- **Tryb zakupów:** jeden produkt naraz, duże „Kupione” / „Później”, pasek postępu, podgląd następnego produktu. Najpierw
  wybierasz sklep („Dokąd jedziesz?” – produkty tylko tego sklepu + te bez promocji) albo „Gdziekolwiek”.
- **Lista „przed wyjściem”** (torba, portfel i telefon, klucze, słuchawki – edytowalna) przed startem trybu zakupów.
- **Sortowanie wg działów sklepu:** warzywa → pieczywo → mięso → nabiał → suche → mrożonki → napoje → dom, czyli
  w kolejności marszruty po sklepie (dział wynika ze słownika, produkty szczegółowe dziedziczą dział po nadrzędnym).
- **Prosta lista:** szczegóły promocji pod pozycją są zwinięte (jedna linia „Promocji: 3 · €1,59”).

**Komfort sensoryczny**
- **Spokojne kolory** (przygaszona zieleń/szarość zamiast jaskrawej pomarańczy; kontrast sprawdzany testem WCAG AA),
  **większy tekst** (normalny / duży / bardzo duży w całej aplikacji), **bez animacji i znikających komunikatów**
  (ekrany pojawiają się od razu, „Cofnij” zostaje do zamknięcia).

**Przypomnienia** (lokalne powiadomienia systemu, bez serwera i internetu, działają przy zamkniętej aplikacji)
- cotygodniowe „czas na zakupy” w wybrany dzień i o wybranej godzinie (z liczbą pozycji na liście),
- „jutro kończy się promocja” dzień przed końcem najwcześniej kończącej się promocji na produkt z listy (godzina do wyboru),
  przeliczane po każdej zmianie listy i odświeżeniu promocji.
Przy pierwszym włączeniu Android poprosi o zgodę na powiadomienia.

## Książka przepisów

Zakładka **Przepisy**: zapisane przepisy (tytuł, porcje, składniki, przygotowanie, link do źródła) z wyszukiwaniem po tytule,
składnikach i krokach oraz ulubionymi; dane tylko w telefonie.
- **Dodawanie:** „Nowy przepis” albo „Z przepisu” na liście → **Zapisz w książce przepisów** (tytuł z pierwszej linii
  wklejonego tekstu i składniki trafiają do formularza). Wklejanie ze stron działa tak samo jak przy imporcie na listę.
- **Z przepisu do listy zakupów jednym dotknięciem:** w przepisie ustawiasz **porcje** (ilości przeliczają się, także
  jednostki regionalne), odznaczasz to, co **masz w domu**, i „Dodaj do listy zakupów (n)”. Składniki sumują się z tym, co już
  jest na liście, a pozycje dostają podpis „Z przepisu: …” (także przy wspólnej liście).
- **Dalej:** edycja, duplikowanie, udostępnianie jako tekst, usuwanie z „Cofnij”, otwarcie źródła.

## Lista jak w Google Keep i dolne menu

- Odhaczona pozycja **przechodzi na dół** do zwijanej sekcji „Kupione · n” (przekreślona, z możliwością cofnięcia
  odhaczenia dotknięciem kółka i usunięcia); odznaczona wraca na swoje miejsce. W widokach „Wg sklepów” i „Działy”
  odhaczone lądują na końcu swojej grupy. Przejście jest animowane (wyłączone w trybie „bez animacji”).
- Dolne menu: większe pola dotyku (min. 56 px), ikony 24 px w „pigułce” zaznaczenia, plakietka z liczbą pozycji do kupienia
  na „Liście”, etykiety dopasowują rozmiar (nie rosną z opcją „większy tekst”), pasek chowa się, gdy otwarta jest klawiatura.

## Reklamy (Google AdMob)

- Jeden **baner adaptacyjny z podpisem „Reklama”** nad dolnym menu, tylko na zakładkach Lista, Przepisy i Promocje. Nie ma go
  w trybie zakupów, w oknach (przepis, historia, wspólna lista, komfort), na Sklepach i w Słowniku, ani przy otwartej
  klawiaturze; gdy reklama się nie załaduje, nie zostaje puste miejsce. Treść listy zakupów nie jest wysyłana do reklamodawców.
- **Zgoda (RODO/UMP):** przy pierwszym uruchomieniu Google pokazuje formularz zgody tam, gdzie prawo tego wymaga (EOG);
  reklamy ładują się dopiero po zgodzie. W EOG w menu ☰ pojawia się „Prywatność reklam” (zmiana zgody). Reklamy mają
  ograniczenie treści do „G” (ogólne).
- **Domyślnie reklamy TESTOWE Google** (bezpieczne, nic nie zarabiają). Żeby zarabiać: konto na admob.google.com → dodaj
  aplikację Android → skopiuj *ID aplikacji* (`ca-app-pub-…~…`) i utwórz blok **Baner** (`ca-app-pub-…/…`); wpisz je, gdy
  `./deploy/aplikacja.sh` zapyta (zapisują się w `.admob-app-id` i `.admob-banner-id`, poza repozytorium). W AdMob →
  *Privacy & messaging* utwórz formularz zgody dla EOG (UMP) i włącz go dla aplikacji.
- **Przed publikacją w Google Play:** polityka prywatności z informacją o reklamach (identyfikator reklamowy, dane
  urządzenia), wypełniona sekcja *Data safety* i deklaracja „aplikacja zawiera reklamy”. Nie klikaj własnych reklam
  (z identyfikatorami produkcyjnymi grozi to blokadą konta) – do testów zostaw reklamy testowe.
- Niesprawdzone na urządzeniu: w środowisku budowania nie ma telefonu ani dostępu do AdMob; sprawdzono pakowanie (bundle)
  i regułę, gdzie baner wolno pokazać (`tests/ads.test.js`).

## Płatność za usunięcie reklam

- Jednorazowy zakup w aplikacji **„Usuń reklamy”** (Google Play Billing przez `expo-iap`, bez subskrypcji): link „Usuń reklamy”
  przy podpisie „Reklama” oraz wiersz w menu ☰ (z ceną z Google Play, „Przywróć zakup”). Po zakupie baner znika, a SDK reklam
  nie jest już inicjalizowany ani nie pyta o zgodę.
- Prawo do wersji bez reklam wynika z konta Google (zakup wraca po reinstalacji i na innym telefonie z tym kontem). Stan
  jest pamiętany lokalnie (bez mignięcia reklam offline); po połączeniu decyduje sklep – zwrot środków odbiera prawo.
  Oczekująca płatność (np. gotówką) liczy się dopiero po zaksięgowaniu. Zakup jest potwierdzany (acknowledge) od razu,
  inaczej Google zwróciłby pieniądze po 3 dniach.
- **Konfiguracja w Google Play Console (raz):** Monetyzacja → *Produkty* → *Produkty w aplikacji* → utwórz produkt o ID
  **`remove_ads`** (zarządzany, jednorazowy), ustaw cenę i aktywuj; profil płatności musi być uzupełniony. Zakupy działają
  dopiero w aplikacji wgranej do Play (wystarczy ścieżka testów wewnętrznych) i zainstalowanej z Play – APK zainstalowany
  przez USB nie kupi („Zakupy działają tylko w wersji z Google Play”). Do testów dodaj konta w *Testerzy licencji*.
  Inne ID produktu: zmienna `EXPO_PUBLIC_REMOVE_ADS_SKU` przy budowaniu.
- Weryfikacja odbywa się na telefonie (bez serwera), więc na zrootowanym urządzeniu da się ją obejść – to typowy kompromis
  aplikacji bez backendu. Niesprawdzone na żywo (brak Play Store w środowisku budowania); sprawdzono logikę uprawnień
  (`tests/ads.test.js`) i pakowanie.

## Bramka zgody na reklamy („zgoda albo wersja bez reklam”)

Bez zgody na reklamy aplikacja nie działa: zamiast ekranów pojawia się bramka z trzema wyjściami – **„Akceptuję i przechodzę
dalej”** (ponownie pokazuje formularz zgody Google), **„Usuń reklamy · cena”** (jednorazowy zakup) i **„Przywróć zakup”**.
- Bramka dotyczy tylko miejsc, gdzie prawo wymaga zgody (EOG/UMP); poza nimi Google nie pokazuje formularza i aplikacja działa
  od razu. Właściciel wersji bez reklam nie widzi bramki (stan zakupu jest pamiętany lokalnie, żeby nie mignęła).
- Jeśli zgoda była już udzielona, brak internetu nie blokuje aplikacji; przy pierwszym uruchomieniu offline bramka prosi
  o połączenie („Spróbuj ponownie”).
- **Uwaga prawna:** model „zgoda albo zapłać” jest stosowany przez wiele aplikacji, ale organy ochrony danych w UE oceniają go
  różnie; zgoda jest uznawana za dobrowolną tylko przy realnej, rozsądnie wycenionej alternatywie bez reklam (tu: jednorazowy
  zakup). Ustaw cenę proporcjonalną i opisz to w polityce prywatności; w razie wątpliwości skonsultuj się z prawnikiem.

## Wydawca i pakiet

Wydawca: **GOKH Studio**. Identyfikator pakietu (Android `applicationId`, schemat logowania Google, AdMob, Play Console):
`com.gokhstudio.kortinglijst`. Po publikacji w Google Play nie można go zmienić. Nowy klucz podpisu tworzony przez
`./deploy/aplikacja.sh` ma w certyfikacie `CN=GOKH Studio`.

## Grafiki do Google Play

Folder `store/`: `icoon-512.png` (ikona 512×512), `feature-graphic.png` (1024×500) i `listing.md` (opis po holendersku –
język domyślny – oraz angielsku i polsku, z limitami znaków). **Zrzuty ekranu muszą pochodzić z prawdziwej aplikacji**, więc
robisz je telefonem, a skrypt tylko dokłada tło i napis (1080×1920):
```
pip install pillow
./deploy/emulator.sh --zrzuty                  # wersja BEZ reklam (tylko do zrzutów; do sklepu wysyłasz zwykły build z aplikacja.sh)
python3 deploy/sklep_grafiki.py shots          # 3 rozmiary: telefon 1080x1920, tablet 7" 1200x1920, tablet 10" 1600x2560 (emulator sam zmienia rozdzielczość)
python3 deploy/sklep_grafiki.py shots --profile tablet-7   # tylko jeden rozmiar
python3 deploy/sklep_grafiki.py shots --from-dir ~/zrzuty  # albo z gotowych: ~/zrzuty/<rozmiar>/01.png … 07.png
```
Wynik: `store/schermafbeeldingen/01-lijst.png` … (7 ekranów z holenderskimi podpisami). Przed zrzutami ustaw w aplikacji
holenderski, dodaj kilka produktów i przepisów, a ekran odśwież (najlepiej z kilkoma aktualnymi promocjami).
Ikonę i grafikę funkcji odtworzysz poleceniem `python3 deploy/sklep_grafiki.py all`.

## Skalowanie tekstu i język domyślny

- Rozmiar tekstu = rozmiar czcionki systemowej × opcja „Rozmiar tekstu” (menu ☰ → Komfort), z limitem 0,85–1,75×, żeby
  układ się nie rozsypał; dotyczy tekstu i pól wpisywania. Logo i nazwa w nagłówku nie rosną; przyciski i przełączniki
  zmniejszają napis zamiast go ucinać.
- **Językiem domyślnym jest holenderski** (nie język telefonu); inny język wybierasz przyciskiem w nagłówku, wybór jest
  zapamiętany. Brakujące klucze tłumaczeń spadają na holenderski, potem angielski.

## Polityka prywatności (darmowy hosting)

Plik `docs/index.html` zawiera politykę po holendersku, angielsku i polsku (opisuje dokładnie, co robi aplikacja: dane tylko w
telefonie, winkels/tłumacz/OSM, Dysk Google, reklamy AdMob, zakup w Play, brak własnych serwerów).
1. Adres kontaktowy w pliku: studiogokh@gmail.com (zmiana: podmień go w całym `docs/index.html`).
2. Opublikuj za darmo na **GitHub Pages**: repozytorium → *Settings → Pages → Deploy from a branch →* gałąź `main`, folder
   `/docs`. Adres: `https://<użytkownik>.github.io/<repozytorium>/` (dla prywatnego repozytorium Pages wymaga płatnego planu –
   wtedy użyj Cloudflare Pages / Netlify Drop (przeciągnij folder `docs`) albo Google Sites, wklejając treść).
3. Ten adres wpisz w Google Play Console (*Treść aplikacji → Polityka prywatności*) oraz w AdMob/Google Cloud (ekran zgody).
Po zmianach w działaniu aplikacji (nowe usługi, dane) zaktualizuj politykę i datę.
