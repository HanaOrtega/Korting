# Korting

Aplikacja na telefon (PWA – otwierasz w przeglądarce i „Dodaj do ekranu głównego”), która zbiera
promocje z holenderskich sklepów i pokazuje jedną listę: **produkt, cena, sklep, do kiedy ważna**.
Można szukać, filtrować po sklepie, sortować (najszybciej kończące się / cena / nazwa) i zapisywać
produkty na własną listę zakupów (zapamiętywaną w telefonie).

## Uruchomienie

```bash
npm start            # http://localhost:3000, potem otwórz na telefonie (ta sama sieć Wi‑Fi)
KORTING_SAMPLE=1 npm start   # dane demo, bez internetu
npm test
```

Wymaga Node 20+. Serwer pobiera promocje co godzinę i trzyma je w pamięci.
Do używania poza domem wystaw go na serwerze (np. Fly.io/Render/VPS) i otwórz jego adres na telefonie.

## Źródła

| Sklep | Skąd | Status |
|---|---|---|
| Aldi | JSON osadzony na stronie aanbiedingen | sprawdzone na żywo |
| Lidl | wyszukiwarka lidl.nl (tylko pozycje z datą końca = promocje tygodnia) | sprawdzone na żywo |
| Jumbo | dane Nuxt ze strony /aanbiedingen/nu | sprawdzone na żywo; część promocji to „2 voor 6,49” / „1+1 gratis” – wtedy cena za sztukę jest pusta, pokazujemy opis promocji |
| Dirk | dane Nuxt ze strony /aanbiedingen | sprawdzone na żywo |
| Plus | strona jest za ochroną antybotową, więc używamy Playwright (prawdziwa przeglądarka) | sprawdzone na żywo; wymaga `npm i playwright` i Chromium (`CHROMIUM_PATH=/ścieżka/do/chromium`) |
| Albert Heijn | nieoficjalne API mobilne (token anonimowy + wyszukiwarka bonusów) | **niesprawdzone** – ah.nl blokuje adresy z centrów danych; może wymagać poprawek |

Gdy któryś sklep zawiedzie, reszta działa dalej, a aplikacja pokazuje komunikat, którego sklepu nie udało się pobrać.
Parsery opierają się na strukturze stron, więc jeśli sklep ją zmieni, odpowiedni plik w `providers/` trzeba poprawić.

## Dodanie sklepu

Nowy plik w `providers/` eksportujący `{ name, fetch() }` zwracający listę:
`{ id, store, name, description, unit, price|null, promoText, validFrom, validUntil, image, url }`
i wpis w `providers/index.js`.
