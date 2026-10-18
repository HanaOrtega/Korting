# Korting

Aplikacja na telefon (React Native / Expo), która z listy zakupów szuka promocji w holenderskich
sklepach. **Działa wyłącznie na telefonie** – bez własnego serwera i bez przeglądarki: aplikacja sama
pobiera promocje ze stron sklepów i trzyma je w pamięci telefonu.

## Co robi

- **Lista zakupów jest stroną główną.** Wpisujesz produkty w swoim języku (np. „mleko, chleb, kurczak”),
  a aplikacja szuka dla nich promocji po holendersku i pokazuje od najtańszej: nazwa, cena, sklep, do kiedy.
- **12 języków** (interfejs i rozpoznawanie produktów): PL, EN, NL, DE, FR, ES, IT, PT, TR, UK, RO, RU.
  Możesz wpisać produkt w dowolnym z nich, niezależnie od języka interfejsu.
- **Poprawianie pomyłek:** literówki są korygowane („mlko” → mleko, „kurzcak” → kurczak) i pokazywane jako
  „Czy chodziło o:” z możliwością zmiany. Podpowiedzi pojawiają się już podczas pisania. Rozpoznanie działa też
  dla produktów, których akurat nie ma w promocji (zobaczysz „brak promocji w tym tygodniu”).
  Poprawiane są też holenderskie słowa występujące w promocjach (np. „spekulaas” → speculaas).
- Zakładka **Promocje**: wszystkie promocje, wyszukiwarka, filtr sklepu, sortowanie, „＋” dodaje produkt do listy.
- Dane są zapamiętywane na telefonie (lista, język, ostatnie promocje – działa offline) i odświeżane najwyżej
  co 6 godzin albo po pociągnięciu listy w dół.

## Źródła

| Sklep | Skąd | Status |
|---|---|---|
| Aldi | JSON osadzony na stronie aanbiedingen | sprawdzone na żywo |
| Lidl | wyszukiwarka lidl.nl (tylko pozycje z datą końca = promocje tygodnia) | sprawdzone na żywo |
| Jumbo | dane Nuxt ze strony /aanbiedingen/nu | sprawdzone na żywo; część promocji to „2 voor 6,49” / „1+1 gratis” – wtedy pokazujemy opis promocji zamiast ceny |
| Dirk | dane Nuxt ze strony /aanbiedingen | sprawdzone na żywo |
| Plus | strona ma ochronę antybotową – ładowana w ukrytym WebView, aplikacja przechwytuje odpowiedź API | mechanizm sprawdzony w przeglądarce na komputerze; **w WebView na telefonie niesprawdzony** |
| Albert Heijn | nieoficjalne API mobilne (token anonimowy + wyszukiwarka) | **niesprawdzone** (ah.nl blokuje serwery, z telefonu powinno działać) |

Gdy sklep zawiedzie, reszta działa dalej, a aplikacja pokazuje który się nie załadował i zostawia jego
poprzednie, jeszcze ważne promocje. Parsery opierają się na strukturze stron – jeśli sklep ją zmieni, trzeba
poprawić plik w `src/providers/`. Pełne odświeżenie pobiera kilkanaście MB danych (głównie Lidl, Jumbo i Dirk),
dlatego jest ograniczone do raz na 6 godzin.

## Uruchomienie i instalacja

Potrzebny jest jednorazowo komputer, żeby zbudować aplikację. Potem działa już samodzielnie.

```bash
npm install
npm test                 # testy logiki i parserów (Node)
npm start                # podgląd w Expo Go na telefonie (ta sama sieć Wi‑Fi)
```

Plik instalacyjny Androida (APK) bez Android Studio – w chmurze Expo (wymaga darmowego konta):

```bash
npx eas-cli build -p android --profile preview
```

Pobierz APK z linku i zainstaluj na telefonie. Lokalnie: `npx expo run:android` (wymaga Android Studio).
iOS: `npx eas-cli build -p ios` (wymaga konta Apple Developer).

## Struktura

- `App.js` – stan aplikacji, nagłówek, zakładki, wybór języka
- `src/match.js` – rozpoznawanie produktów (słownik, literówki, podpowiedzi) i dopasowanie do promocji
- `src/data/glossary.js` – słownik ~115 produktów w 12 językach (tłumaczenia warto sprawdzić z natywnymi użytkownikami)
- `src/i18n.js` – teksty interfejsu
- `src/providers/` – po jednym pliku na sklep (`{ name, fetch() }`), rejestr w `index.js`
- `src/components/WebViewHost.js` – ukryty WebView dla Plusa
- `src/deals.js` – pobieranie, pamięć podręczna, błędy per sklep

Dodanie sklepu: nowy plik w `src/providers/` zwracający listę
`{ id, store, name, description, unit, price|null, promoText, validFrom, validUntil, image, url }`
i wpis w `src/providers/index.js`. Dodanie produktu/języka: wiersz w `src/data/glossary.js`.
