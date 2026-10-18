// Teksty interfejsu w 12 językach. Brakujący klucz spada na angielski.
export const LANG_NAMES = {
  pl: 'Polski', en: 'English', nl: 'Nederlands', de: 'Deutsch', fr: 'Français', es: 'Español',
  it: 'Italiano', pt: 'Português', tr: 'Türkçe', uk: 'Українська', ro: 'Română', ru: 'Русский',
};

const T = {
  en: {
    tabList: 'List', tabDeals: 'Deals', addPh: 'Add a product (e.g. milk, bread)…', emptyTitle: 'Your list is empty',
    emptyHint: 'Type products in your own language – I will find deals in Dutch supermarkets.',
    didYouMean: 'Did you mean:', noPromo: 'no deals this week', more: 'Show more ({n})', less: 'Less',
    until: 'until', lastDay: 'last day', unknownItem: 'Not recognised – searching literally',
    searchPh: 'Search deals…', allStores: 'All stores', sortEnd: 'Ending soonest', sortPrice: 'Price',
    sortName: 'Name', loading: 'Loading deals…', failed: 'Could not load: {stores}', noResults: 'No results',
    clearDone: 'Remove bought items', promoCount: '{n} deals', products: '{n} products', refresh: 'Refresh',
    updated: 'Updated {t}', searchingFor: 'Searching:', translated: 'Translated:', details: 'Tap for details', language: 'Language',
  },
  pl: {
    tabList: 'Lista', tabDeals: 'Promocje', addPh: 'Dodaj produkt (np. mleko, chleb)…', emptyTitle: 'Twoja lista jest pusta',
    emptyHint: 'Wpisz produkty w swoim języku – znajdę dla nich promocje w holenderskich sklepach.',
    didYouMean: 'Czy chodziło o:', noPromo: 'brak promocji w tym tygodniu', more: 'Pokaż więcej ({n})', less: 'Mniej',
    until: 'do', lastDay: 'ostatni dzień', unknownItem: 'Nie rozpoznano – szukam dosłownie',
    searchPh: 'Szukaj promocji…', allStores: 'Wszystkie sklepy', sortEnd: 'Najszybciej kończące się', sortPrice: 'Cena',
    sortName: 'Nazwa', loading: 'Pobieram promocje…', failed: 'Nie udało się pobrać: {stores}', noResults: 'Brak wyników',
    clearDone: 'Usuń kupione', promoCount: 'Promocji: {n}', products: 'Produktów: {n}', refresh: 'Odśwież',
    updated: 'Zaktualizowano {t}', searchingFor: 'Szukam:', translated: 'Przetłumaczono:', details: 'Dotknij, by zobaczyć szczegóły', language: 'Język',
  },
  nl: {
    tabList: 'Lijst', tabDeals: 'Aanbiedingen', addPh: 'Voeg product toe (bijv. melk, brood)…', emptyTitle: 'Je lijst is leeg',
    emptyHint: 'Typ producten in je eigen taal – ik zoek de aanbiedingen in Nederlandse supermarkten.',
    didYouMean: 'Bedoelde je:', noPromo: 'geen aanbieding deze week', more: 'Toon meer ({n})', less: 'Minder',
    until: 't/m', lastDay: 'laatste dag', unknownItem: 'Niet herkend – ik zoek letterlijk',
    searchPh: 'Zoek aanbiedingen…', allStores: 'Alle winkels', sortEnd: 'Bijna afgelopen', sortPrice: 'Prijs',
    sortName: 'Naam', loading: 'Aanbiedingen laden…', failed: 'Laden mislukt: {stores}', noResults: 'Geen resultaten',
    clearDone: 'Gekochte items wissen', promoCount: '{n} aanbiedingen', products: '{n} producten', refresh: 'Vernieuwen',
    updated: 'Bijgewerkt {t}', searchingFor: 'Zoeken naar:', translated: 'Vertaald:', details: 'Tik voor details', language: 'Taal',
  },
  de: {
    tabList: 'Liste', tabDeals: 'Angebote', addPh: 'Produkt hinzufügen (z. B. Milch, Brot)…', emptyTitle: 'Deine Liste ist leer',
    emptyHint: 'Tippe Produkte in deiner Sprache ein – ich finde Angebote in niederländischen Supermärkten.',
    didYouMean: 'Meintest du:', noPromo: 'diese Woche kein Angebot', more: 'Mehr anzeigen ({n})', less: 'Weniger',
    until: 'bis', lastDay: 'letzter Tag', unknownItem: 'Nicht erkannt – ich suche wörtlich',
    searchPh: 'Angebote suchen…', allStores: 'Alle Geschäfte', sortEnd: 'Endet bald', sortPrice: 'Preis',
    sortName: 'Name', loading: 'Angebote werden geladen…', failed: 'Laden fehlgeschlagen: {stores}', noResults: 'Keine Ergebnisse',
    clearDone: 'Gekaufte entfernen', promoCount: '{n} Angebote', products: '{n} Produkte', refresh: 'Aktualisieren',
    updated: 'Aktualisiert {t}', searchingFor: 'Suche:', translated: 'Übersetzt:', details: 'Tippen für Details', language: 'Sprache',
  },
  fr: {
    tabList: 'Liste', tabDeals: 'Promos', addPh: 'Ajouter un produit (ex. lait, pain)…', emptyTitle: 'Ta liste est vide',
    emptyHint: 'Écris les produits dans ta langue – je trouve les promos des supermarchés néerlandais.',
    didYouMean: 'Vouliez-vous dire :', noPromo: 'pas de promo cette semaine', more: 'Voir plus ({n})', less: 'Moins',
    until: "jusqu'au", lastDay: 'dernier jour', unknownItem: 'Non reconnu – recherche littérale',
    searchPh: 'Chercher des promos…', allStores: 'Tous les magasins', sortEnd: 'Bientôt terminées', sortPrice: 'Prix',
    sortName: 'Nom', loading: 'Chargement des promos…', failed: 'Échec du chargement : {stores}', noResults: 'Aucun résultat',
    clearDone: 'Retirer les achetés', promoCount: '{n} promos', products: '{n} produits', refresh: 'Actualiser',
    updated: 'Mis à jour {t}', searchingFor: 'Recherche :', translated: 'Traduit :', details: 'Appuyez pour les détails', language: 'Langue',
  },
  es: {
    tabList: 'Lista', tabDeals: 'Ofertas', addPh: 'Añade un producto (p. ej. leche, pan)…', emptyTitle: 'Tu lista está vacía',
    emptyHint: 'Escribe los productos en tu idioma: busco ofertas en los supermercados neerlandeses.',
    didYouMean: '¿Quisiste decir:', noPromo: 'sin ofertas esta semana', more: 'Ver más ({n})', less: 'Menos',
    until: 'hasta', lastDay: 'último día', unknownItem: 'No reconocido – busco literalmente',
    searchPh: 'Buscar ofertas…', allStores: 'Todas las tiendas', sortEnd: 'Terminan antes', sortPrice: 'Precio',
    sortName: 'Nombre', loading: 'Cargando ofertas…', failed: 'No se pudo cargar: {stores}', noResults: 'Sin resultados',
    clearDone: 'Quitar comprados', promoCount: '{n} ofertas', products: '{n} productos', refresh: 'Actualizar',
    updated: 'Actualizado {t}', searchingFor: 'Buscando:', translated: 'Traducido:', details: 'Toca para ver detalles', language: 'Idioma',
  },
  it: {
    tabList: 'Lista', tabDeals: 'Offerte', addPh: 'Aggiungi un prodotto (es. latte, pane)…', emptyTitle: 'La tua lista è vuota',
    emptyHint: 'Scrivi i prodotti nella tua lingua: trovo le offerte nei supermercati olandesi.',
    didYouMean: 'Intendevi:', noPromo: 'nessuna offerta questa settimana', more: 'Mostra altro ({n})', less: 'Meno',
    until: 'fino al', lastDay: 'ultimo giorno', unknownItem: 'Non riconosciuto – cerco alla lettera',
    searchPh: 'Cerca offerte…', allStores: 'Tutti i negozi', sortEnd: 'In scadenza', sortPrice: 'Prezzo',
    sortName: 'Nome', loading: 'Caricamento offerte…', failed: 'Caricamento non riuscito: {stores}', noResults: 'Nessun risultato',
    clearDone: 'Rimuovi acquistati', promoCount: '{n} offerte', products: '{n} prodotti', refresh: 'Aggiorna',
    updated: 'Aggiornato {t}', searchingFor: 'Cerco:', translated: 'Tradotto:', details: 'Tocca per i dettagli', language: 'Lingua',
  },
  pt: {
    tabList: 'Lista', tabDeals: 'Promoções', addPh: 'Adicionar produto (ex. leite, pão)…', emptyTitle: 'A tua lista está vazia',
    emptyHint: 'Escreve os produtos na tua língua – procuro promoções nos supermercados holandeses.',
    didYouMean: 'Querias dizer:', noPromo: 'sem promoção esta semana', more: 'Ver mais ({n})', less: 'Menos',
    until: 'até', lastDay: 'último dia', unknownItem: 'Não reconhecido – procuro à letra',
    searchPh: 'Procurar promoções…', allStores: 'Todas as lojas', sortEnd: 'A terminar', sortPrice: 'Preço',
    sortName: 'Nome', loading: 'A carregar promoções…', failed: 'Falha ao carregar: {stores}', noResults: 'Sem resultados',
    clearDone: 'Remover comprados', promoCount: '{n} promoções', products: '{n} produtos', refresh: 'Atualizar',
    updated: 'Atualizado {t}', searchingFor: 'A procurar:', translated: 'Traduzido:', details: 'Toca para detalhes', language: 'Idioma',
  },
  tr: {
    tabList: 'Liste', tabDeals: 'İndirimler', addPh: 'Ürün ekle (ör. süt, ekmek)…', emptyTitle: 'Listen boş',
    emptyHint: 'Ürünleri kendi dilinde yaz – Hollanda marketlerindeki indirimleri bulurum.',
    didYouMean: 'Şunu mu demek istedin:', noPromo: 'bu hafta indirim yok', more: 'Daha fazla ({n})', less: 'Daha az',
    until: 'şu tarihe kadar:', lastDay: 'son gün', unknownItem: 'Tanınmadı – kelimesi kelimesine arıyorum',
    searchPh: 'İndirim ara…', allStores: 'Tüm mağazalar', sortEnd: 'Yakında bitenler', sortPrice: 'Fiyat',
    sortName: 'Ad', loading: 'İndirimler yükleniyor…', failed: 'Yüklenemedi: {stores}', noResults: 'Sonuç yok',
    clearDone: 'Alınanları sil', promoCount: '{n} indirim', products: '{n} ürün', refresh: 'Yenile',
    updated: 'Güncellendi {t}', searchingFor: 'Aranan:', translated: 'Çevrildi:', details: 'Ayrıntı için dokun', language: 'Dil',
  },
  uk: {
    tabList: 'Список', tabDeals: 'Акції', addPh: 'Додайте товар (напр. молоко, хліб)…', emptyTitle: 'Ваш список порожній',
    emptyHint: 'Пишіть товари своєю мовою – я знайду акції в нідерландських супермаркетах.',
    didYouMean: 'Ви мали на увазі:', noPromo: 'цього тижня немає акцій', more: 'Показати більше ({n})', less: 'Менше',
    until: 'до', lastDay: 'останній день', unknownItem: 'Не розпізнано – шукаю дослівно',
    searchPh: 'Шукати акції…', allStores: 'Усі магазини', sortEnd: 'Скоро закінчаться', sortPrice: 'Ціна',
    sortName: 'Назва', loading: 'Завантаження акцій…', failed: 'Не вдалося завантажити: {stores}', noResults: 'Нічого не знайдено',
    clearDone: 'Видалити куплене', promoCount: 'Акцій: {n}', products: 'Товарів: {n}', refresh: 'Оновити',
    updated: 'Оновлено {t}', searchingFor: 'Шукаю:', translated: 'Перекладено:', details: 'Торкніться для деталей', language: 'Мова',
  },
  ro: {
    tabList: 'Listă', tabDeals: 'Oferte', addPh: 'Adaugă un produs (ex. lapte, pâine)…', emptyTitle: 'Lista ta este goală',
    emptyHint: 'Scrie produsele în limba ta – găsesc oferte în supermarketurile olandeze.',
    didYouMean: 'Ai vrut să spui:', noPromo: 'nicio ofertă săptămâna aceasta', more: 'Arată mai multe ({n})', less: 'Mai puține',
    until: 'până la', lastDay: 'ultima zi', unknownItem: 'Nerecunoscut – caut literal',
    searchPh: 'Caută oferte…', allStores: 'Toate magazinele', sortEnd: 'Se termină curând', sortPrice: 'Preț',
    sortName: 'Nume', loading: 'Se încarcă ofertele…', failed: 'Încărcare eșuată: {stores}', noResults: 'Niciun rezultat',
    clearDone: 'Șterge cumpărate', promoCount: '{n} oferte', products: '{n} produse', refresh: 'Reîmprospătează',
    updated: 'Actualizat {t}', searchingFor: 'Caut:', translated: 'Tradus:', details: 'Atinge pentru detalii', language: 'Limbă',
  },
  ru: {
    tabList: 'Список', tabDeals: 'Акции', addPh: 'Добавьте товар (напр. молоко, хлеб)…', emptyTitle: 'Ваш список пуст',
    emptyHint: 'Пишите товары на своём языке – я найду акции в нидерландских супермаркетах.',
    didYouMean: 'Вы имели в виду:', noPromo: 'на этой неделе акций нет', more: 'Показать ещё ({n})', less: 'Меньше',
    until: 'до', lastDay: 'последний день', unknownItem: 'Не распознано – ищу дословно',
    searchPh: 'Искать акции…', allStores: 'Все магазины', sortEnd: 'Скоро закончатся', sortPrice: 'Цена',
    sortName: 'Название', loading: 'Загрузка акций…', failed: 'Не удалось загрузить: {stores}', noResults: 'Ничего не найдено',
    clearDone: 'Удалить купленное', promoCount: 'Акций: {n}', products: 'Товаров: {n}', refresh: 'Обновить',
    updated: 'Обновлено {t}', searchingFor: 'Ищу:', translated: 'Переведено:', details: 'Нажмите для подробностей', language: 'Язык',
  },
};

export const LANG_CODES = Object.keys(LANG_NAMES);

export function makeT(lang) {
  const dict = T[lang] ?? T.en;
  return (key, vars = {}) =>
    (dict[key] ?? T.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function pickLanguage(deviceCode) {
  return LANG_CODES.includes(deviceCode) ? deviceCode : 'en';
}
