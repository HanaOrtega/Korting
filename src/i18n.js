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
    updated: 'Updated {t}', searchingFor: 'Searching:', translated: 'Translated:', details: 'Tap for details', tabStores: 'Stores', viewItems: 'Items', viewStores: 'By store', noPromoSection: 'No deal', noPromoHint: 'buy at any store', navigate: 'Navigate', alsoAt: 'Also at:', estTotal: 'total approx. {sum}', sortStore: 'Store', favChains: 'My chains', favStores: 'My stores', findNearby: 'Find stores nearby', locating: 'Looking for stores nearby…', locDenied: 'Location permission denied – pick favourite chains manually.', noStoresFound: 'No stores found nearby', storesError: 'Could not load stores: {err}', nearby: 'Nearby', noFavs: 'No stores selected yet.', language: 'Language', pickTitle: 'First, choose your stores', pickHint: 'I will only show deals from the stores you choose – pick chains or find stores in your area. You can change this anytime in the Stores tab.', selectAll: 'All chains', continueBtn: 'Continue',
  },
  pl: {
    tabList: 'Lista', tabDeals: 'Promocje', addPh: 'Dodaj produkt (np. mleko, chleb)…', emptyTitle: 'Twoja lista jest pusta',
    emptyHint: 'Wpisz produkty w swoim języku – znajdę dla nich promocje w holenderskich sklepach.',
    didYouMean: 'Czy chodziło o:', noPromo: 'brak promocji w tym tygodniu', more: 'Pokaż więcej ({n})', less: 'Mniej',
    until: 'do', lastDay: 'ostatni dzień', unknownItem: 'Nie rozpoznano – szukam dosłownie',
    searchPh: 'Szukaj promocji…', allStores: 'Wszystkie sklepy', sortEnd: 'Najszybciej kończące się', sortPrice: 'Cena',
    sortName: 'Nazwa', loading: 'Pobieram promocje…', failed: 'Nie udało się pobrać: {stores}', noResults: 'Brak wyników',
    clearDone: 'Usuń kupione', promoCount: 'Promocji: {n}', products: 'Produktów: {n}', refresh: 'Odśwież',
    updated: 'Zaktualizowano {t}', searchingFor: 'Szukam:', translated: 'Przetłumaczono:', details: 'Dotknij, by zobaczyć szczegóły', tabStores: 'Sklepy', viewItems: 'Produkty', viewStores: 'Wg sklepów', noPromoSection: 'Bez promocji', noPromoHint: 'kup w dowolnym sklepie', navigate: 'Nawiguj', alsoAt: 'Też w:', estTotal: 'razem ok. {sum}', sortStore: 'Sklep', favChains: 'Moje sieci', favStores: 'Moje sklepy', findNearby: 'Znajdź sklepy w pobliżu', locating: 'Szukam sklepów w pobliżu…', locDenied: 'Brak zgody na lokalizację – wybierz ulubione sieci ręcznie.', noStoresFound: 'Nie znaleziono sklepów w pobliżu', storesError: 'Nie udało się pobrać sklepów: {err}', nearby: 'W pobliżu', noFavs: 'Nie wybrano jeszcze sklepów.', language: 'Język', pickTitle: 'Najpierw wybierz sklepy', pickHint: 'Pokażę promocje tylko z wybranych sklepów – wybierz sieci albo znajdź sklepy w swojej okolicy. Zmienisz to w każdej chwili w zakładce Sklepy.', selectAll: 'Wszystkie sieci', continueBtn: 'Dalej',
  },
  nl: {
    tabList: 'Lijst', tabDeals: 'Aanbiedingen', addPh: 'Voeg product toe (bijv. melk, brood)…', emptyTitle: 'Je lijst is leeg',
    emptyHint: 'Typ producten in je eigen taal – ik zoek de aanbiedingen in Nederlandse supermarkten.',
    didYouMean: 'Bedoelde je:', noPromo: 'geen aanbieding deze week', more: 'Toon meer ({n})', less: 'Minder',
    until: 't/m', lastDay: 'laatste dag', unknownItem: 'Niet herkend – ik zoek letterlijk',
    searchPh: 'Zoek aanbiedingen…', allStores: 'Alle winkels', sortEnd: 'Bijna afgelopen', sortPrice: 'Prijs',
    sortName: 'Naam', loading: 'Aanbiedingen laden…', failed: 'Laden mislukt: {stores}', noResults: 'Geen resultaten',
    clearDone: 'Gekochte items wissen', promoCount: '{n} aanbiedingen', products: '{n} producten', refresh: 'Vernieuwen',
    updated: 'Bijgewerkt {t}', searchingFor: 'Zoeken naar:', translated: 'Vertaald:', details: 'Tik voor details', tabStores: 'Winkels', viewItems: 'Producten', viewStores: 'Per winkel', noPromoSection: 'Zonder aanbieding', noPromoHint: 'koop bij een willekeurige winkel', navigate: 'Navigeer', alsoAt: 'Ook bij:', estTotal: 'totaal ca. {sum}', sortStore: 'Winkel', favChains: 'Mijn ketens', favStores: 'Mijn winkels', findNearby: 'Zoek winkels in de buurt', locating: 'Winkels in de buurt zoeken…', locDenied: 'Geen toestemming voor locatie – kies favoriete ketens handmatig.', noStoresFound: 'Geen winkels in de buurt gevonden', storesError: 'Winkels laden mislukt: {err}', nearby: 'In de buurt', noFavs: 'Nog geen winkels gekozen.', language: 'Taal', pickTitle: 'Kies eerst je winkels', pickHint: 'Ik toon alleen aanbiedingen van de gekozen winkels – kies ketens of zoek winkels in de buurt. Je kunt dit altijd wijzigen op het tabblad Winkels.', selectAll: 'Alle ketens', continueBtn: 'Verder',
  },
  de: {
    tabList: 'Liste', tabDeals: 'Angebote', addPh: 'Produkt hinzufügen (z. B. Milch, Brot)…', emptyTitle: 'Deine Liste ist leer',
    emptyHint: 'Tippe Produkte in deiner Sprache ein – ich finde Angebote in niederländischen Supermärkten.',
    didYouMean: 'Meintest du:', noPromo: 'diese Woche kein Angebot', more: 'Mehr anzeigen ({n})', less: 'Weniger',
    until: 'bis', lastDay: 'letzter Tag', unknownItem: 'Nicht erkannt – ich suche wörtlich',
    searchPh: 'Angebote suchen…', allStores: 'Alle Geschäfte', sortEnd: 'Endet bald', sortPrice: 'Preis',
    sortName: 'Name', loading: 'Angebote werden geladen…', failed: 'Laden fehlgeschlagen: {stores}', noResults: 'Keine Ergebnisse',
    clearDone: 'Gekaufte entfernen', promoCount: '{n} Angebote', products: '{n} Produkte', refresh: 'Aktualisieren',
    updated: 'Aktualisiert {t}', searchingFor: 'Suche:', translated: 'Übersetzt:', details: 'Tippen für Details', tabStores: 'Geschäfte', viewItems: 'Produkte', viewStores: 'Nach Geschäft', noPromoSection: 'Ohne Angebot', noPromoHint: 'in einem beliebigen Geschäft kaufen', navigate: 'Navigieren', alsoAt: 'Auch bei:', estTotal: 'gesamt ca. {sum}', sortStore: 'Geschäft', favChains: 'Meine Ketten', favStores: 'Meine Geschäfte', findNearby: 'Geschäfte in der Nähe finden', locating: 'Suche Geschäfte in der Nähe…', locDenied: 'Standortzugriff verweigert – wähle Lieblingsketten manuell.', noStoresFound: 'Keine Geschäfte in der Nähe gefunden', storesError: 'Geschäfte konnten nicht geladen werden: {err}', nearby: 'In der Nähe', noFavs: 'Noch keine Geschäfte gewählt.', language: 'Sprache', pickTitle: 'Wähle zuerst deine Geschäfte', pickHint: 'Ich zeige nur Angebote der gewählten Geschäfte – wähle Ketten oder finde Geschäfte in deiner Nähe. Du kannst das jederzeit im Tab Geschäfte ändern.', selectAll: 'Alle Ketten', continueBtn: 'Weiter',
  },
  fr: {
    tabList: 'Liste', tabDeals: 'Promos', addPh: 'Ajouter un produit (ex. lait, pain)…', emptyTitle: 'Ta liste est vide',
    emptyHint: 'Écris les produits dans ta langue – je trouve les promos des supermarchés néerlandais.',
    didYouMean: 'Vouliez-vous dire :', noPromo: 'pas de promo cette semaine', more: 'Voir plus ({n})', less: 'Moins',
    until: "jusqu'au", lastDay: 'dernier jour', unknownItem: 'Non reconnu – recherche littérale',
    searchPh: 'Chercher des promos…', allStores: 'Tous les magasins', sortEnd: 'Bientôt terminées', sortPrice: 'Prix',
    sortName: 'Nom', loading: 'Chargement des promos…', failed: 'Échec du chargement : {stores}', noResults: 'Aucun résultat',
    clearDone: 'Retirer les achetés', promoCount: '{n} promos', products: '{n} produits', refresh: 'Actualiser',
    updated: 'Mis à jour {t}', searchingFor: 'Recherche :', translated: 'Traduit :', details: 'Appuyez pour les détails', tabStores: 'Magasins', viewItems: 'Produits', viewStores: 'Par magasin', noPromoSection: 'Sans promo', noPromoHint: 'à acheter dans n\'importe quel magasin', navigate: 'Naviguer', alsoAt: 'Aussi chez :', estTotal: 'total env. {sum}', sortStore: 'Magasin', favChains: 'Mes enseignes', favStores: 'Mes magasins', findNearby: 'Trouver des magasins à proximité', locating: 'Recherche de magasins à proximité…', locDenied: 'Localisation refusée – choisissez les enseignes favorites manuellement.', noStoresFound: 'Aucun magasin trouvé à proximité', storesError: 'Impossible de charger les magasins : {err}', nearby: 'À proximité', noFavs: 'Aucun magasin choisi pour l\'instant.', language: 'Langue', pickTitle: 'Choisissez d\'abord vos magasins', pickHint: 'Je n\'afficherai que les promos des magasins choisis – choisissez des enseignes ou trouvez des magasins près de chez vous. Modifiable à tout moment dans l\'onglet Magasins.', selectAll: 'Toutes les enseignes', continueBtn: 'Continuer',
  },
  es: {
    tabList: 'Lista', tabDeals: 'Ofertas', addPh: 'Añade un producto (p. ej. leche, pan)…', emptyTitle: 'Tu lista está vacía',
    emptyHint: 'Escribe los productos en tu idioma: busco ofertas en los supermercados neerlandeses.',
    didYouMean: '¿Quisiste decir:', noPromo: 'sin ofertas esta semana', more: 'Ver más ({n})', less: 'Menos',
    until: 'hasta', lastDay: 'último día', unknownItem: 'No reconocido – busco literalmente',
    searchPh: 'Buscar ofertas…', allStores: 'Todas las tiendas', sortEnd: 'Terminan antes', sortPrice: 'Precio',
    sortName: 'Nombre', loading: 'Cargando ofertas…', failed: 'No se pudo cargar: {stores}', noResults: 'Sin resultados',
    clearDone: 'Quitar comprados', promoCount: '{n} ofertas', products: '{n} productos', refresh: 'Actualizar',
    updated: 'Actualizado {t}', searchingFor: 'Buscando:', translated: 'Traducido:', details: 'Toca para ver detalles', tabStores: 'Tiendas', viewItems: 'Productos', viewStores: 'Por tienda', noPromoSection: 'Sin oferta', noPromoHint: 'comprar en cualquier tienda', navigate: 'Navegar', alsoAt: 'También en:', estTotal: 'total aprox. {sum}', sortStore: 'Tienda', favChains: 'Mis cadenas', favStores: 'Mis tiendas', findNearby: 'Buscar tiendas cercanas', locating: 'Buscando tiendas cercanas…', locDenied: 'Sin permiso de ubicación: elige las cadenas favoritas manualmente.', noStoresFound: 'No se encontraron tiendas cercanas', storesError: 'No se pudieron cargar las tiendas: {err}', nearby: 'Cerca', noFavs: 'Aún no has elegido tiendas.', language: 'Idioma', pickTitle: 'Primero elige tus tiendas', pickHint: 'Solo mostraré ofertas de las tiendas elegidas: elige cadenas o busca tiendas cerca de ti. Puedes cambiarlo cuando quieras en la pestaña Tiendas.', selectAll: 'Todas las cadenas', continueBtn: 'Continuar',
  },
  it: {
    tabList: 'Lista', tabDeals: 'Offerte', addPh: 'Aggiungi un prodotto (es. latte, pane)…', emptyTitle: 'La tua lista è vuota',
    emptyHint: 'Scrivi i prodotti nella tua lingua: trovo le offerte nei supermercati olandesi.',
    didYouMean: 'Intendevi:', noPromo: 'nessuna offerta questa settimana', more: 'Mostra altro ({n})', less: 'Meno',
    until: 'fino al', lastDay: 'ultimo giorno', unknownItem: 'Non riconosciuto – cerco alla lettera',
    searchPh: 'Cerca offerte…', allStores: 'Tutti i negozi', sortEnd: 'In scadenza', sortPrice: 'Prezzo',
    sortName: 'Nome', loading: 'Caricamento offerte…', failed: 'Caricamento non riuscito: {stores}', noResults: 'Nessun risultato',
    clearDone: 'Rimuovi acquistati', promoCount: '{n} offerte', products: '{n} prodotti', refresh: 'Aggiorna',
    updated: 'Aggiornato {t}', searchingFor: 'Cerco:', translated: 'Tradotto:', details: 'Tocca per i dettagli', tabStores: 'Negozi', viewItems: 'Prodotti', viewStores: 'Per negozio', noPromoSection: 'Senza offerta', noPromoHint: 'da comprare in qualsiasi negozio', navigate: 'Naviga', alsoAt: 'Anche da:', estTotal: 'totale circa {sum}', sortStore: 'Negozio', favChains: 'Le mie catene', favStores: 'I miei negozi', findNearby: 'Trova negozi vicini', locating: 'Cerco negozi vicini…', locDenied: 'Permesso di posizione negato: scegli le catene preferite a mano.', noStoresFound: 'Nessun negozio trovato nelle vicinanze', storesError: 'Impossibile caricare i negozi: {err}', nearby: 'Vicino a te', noFavs: 'Nessun negozio scelto.', language: 'Lingua', pickTitle: 'Prima scegli i tuoi negozi', pickHint: 'Mostrerò solo le offerte dei negozi scelti: scegli le catene o trova negozi vicino a te. Puoi cambiare in qualsiasi momento nella scheda Negozi.', selectAll: 'Tutte le catene', continueBtn: 'Continua',
  },
  pt: {
    tabList: 'Lista', tabDeals: 'Promoções', addPh: 'Adicionar produto (ex. leite, pão)…', emptyTitle: 'A tua lista está vazia',
    emptyHint: 'Escreve os produtos na tua língua – procuro promoções nos supermercados holandeses.',
    didYouMean: 'Querias dizer:', noPromo: 'sem promoção esta semana', more: 'Ver mais ({n})', less: 'Menos',
    until: 'até', lastDay: 'último dia', unknownItem: 'Não reconhecido – procuro à letra',
    searchPh: 'Procurar promoções…', allStores: 'Todas as lojas', sortEnd: 'A terminar', sortPrice: 'Preço',
    sortName: 'Nome', loading: 'A carregar promoções…', failed: 'Falha ao carregar: {stores}', noResults: 'Sem resultados',
    clearDone: 'Remover comprados', promoCount: '{n} promoções', products: '{n} produtos', refresh: 'Atualizar',
    updated: 'Atualizado {t}', searchingFor: 'A procurar:', translated: 'Traduzido:', details: 'Toca para detalhes', tabStores: 'Lojas', viewItems: 'Produtos', viewStores: 'Por loja', noPromoSection: 'Sem promoção', noPromoHint: 'comprar em qualquer loja', navigate: 'Navegar', alsoAt: 'Também em:', estTotal: 'total aprox. {sum}', sortStore: 'Loja', favChains: 'As minhas cadeias', favStores: 'As minhas lojas', findNearby: 'Encontrar lojas perto', locating: 'A procurar lojas perto…', locDenied: 'Sem permissão de localização – escolhe as cadeias favoritas manualmente.', noStoresFound: 'Não foram encontradas lojas perto', storesError: 'Não foi possível carregar as lojas: {err}', nearby: 'Perto', noFavs: 'Ainda não escolheste lojas.', language: 'Idioma', pickTitle: 'Primeiro escolhe as tuas lojas', pickHint: 'Só vou mostrar promoções das lojas escolhidas – escolhe cadeias ou procura lojas perto de ti. Podes mudar isto quando quiseres no separador Lojas.', selectAll: 'Todas as cadeias', continueBtn: 'Continuar',
  },
  tr: {
    tabList: 'Liste', tabDeals: 'İndirimler', addPh: 'Ürün ekle (ör. süt, ekmek)…', emptyTitle: 'Listen boş',
    emptyHint: 'Ürünleri kendi dilinde yaz – Hollanda marketlerindeki indirimleri bulurum.',
    didYouMean: 'Şunu mu demek istedin:', noPromo: 'bu hafta indirim yok', more: 'Daha fazla ({n})', less: 'Daha az',
    until: 'şu tarihe kadar:', lastDay: 'son gün', unknownItem: 'Tanınmadı – kelimesi kelimesine arıyorum',
    searchPh: 'İndirim ara…', allStores: 'Tüm mağazalar', sortEnd: 'Yakında bitenler', sortPrice: 'Fiyat',
    sortName: 'Ad', loading: 'İndirimler yükleniyor…', failed: 'Yüklenemedi: {stores}', noResults: 'Sonuç yok',
    clearDone: 'Alınanları sil', promoCount: '{n} indirim', products: '{n} ürün', refresh: 'Yenile',
    updated: 'Güncellendi {t}', searchingFor: 'Aranan:', translated: 'Çevrildi:', details: 'Ayrıntı için dokun', tabStores: 'Mağazalar', viewItems: 'Ürünler', viewStores: 'Mağazaya göre', noPromoSection: 'İndirimsiz', noPromoHint: 'herhangi bir mağazadan al', navigate: 'Yol tarifi', alsoAt: 'Ayrıca:', estTotal: 'toplam yakl. {sum}', sortStore: 'Mağaza', favChains: 'Zincirlerim', favStores: 'Mağazalarım', findNearby: 'Yakındaki mağazaları bul', locating: 'Yakındaki mağazalar aranıyor…', locDenied: 'Konum izni verilmedi – favori zincirleri elle seç.', noStoresFound: 'Yakında mağaza bulunamadı', storesError: 'Mağazalar yüklenemedi: {err}', nearby: 'Yakında', noFavs: 'Henüz mağaza seçilmedi.', language: 'Dil', pickTitle: 'Önce mağazalarını seç', pickHint: 'Yalnızca seçtiğin mağazaların indirimlerini göstereceğim – zincir seç veya yakındaki mağazaları bul. Bunu istediğin zaman Mağazalar sekmesinden değiştirebilirsin.', selectAll: 'Tüm zincirler', continueBtn: 'Devam',
  },
  uk: {
    tabList: 'Список', tabDeals: 'Акції', addPh: 'Додайте товар (напр. молоко, хліб)…', emptyTitle: 'Ваш список порожній',
    emptyHint: 'Пишіть товари своєю мовою – я знайду акції в нідерландських супермаркетах.',
    didYouMean: 'Ви мали на увазі:', noPromo: 'цього тижня немає акцій', more: 'Показати більше ({n})', less: 'Менше',
    until: 'до', lastDay: 'останній день', unknownItem: 'Не розпізнано – шукаю дослівно',
    searchPh: 'Шукати акції…', allStores: 'Усі магазини', sortEnd: 'Скоро закінчаться', sortPrice: 'Ціна',
    sortName: 'Назва', loading: 'Завантаження акцій…', failed: 'Не вдалося завантажити: {stores}', noResults: 'Нічого не знайдено',
    clearDone: 'Видалити куплене', promoCount: 'Акцій: {n}', products: 'Товарів: {n}', refresh: 'Оновити',
    updated: 'Оновлено {t}', searchingFor: 'Шукаю:', translated: 'Перекладено:', details: 'Торкніться для деталей', tabStores: 'Магазини', viewItems: 'Товари', viewStores: 'За магазинами', noPromoSection: 'Без акції', noPromoHint: 'купіть у будь-якому магазині', navigate: 'Маршрут', alsoAt: 'Також у:', estTotal: 'разом бл. {sum}', sortStore: 'Магазин', favChains: 'Мої мережі', favStores: 'Мої магазини', findNearby: 'Знайти магазини поруч', locating: 'Шукаю магазини поруч…', locDenied: 'Немає дозволу на геолокацію – оберіть улюблені мережі вручну.', noStoresFound: 'Поруч магазинів не знайдено', storesError: 'Не вдалося завантажити магазини: {err}', nearby: 'Поруч', noFavs: 'Магазини ще не обрано.', language: 'Мова', pickTitle: 'Спершу оберіть магазини', pickHint: 'Показуватиму акції лише з обраних магазинів – оберіть мережі або знайдіть магазини поруч. Змінити можна будь-коли у вкладці Магазини.', selectAll: 'Усі мережі', continueBtn: 'Далі',
  },
  ro: {
    tabList: 'Listă', tabDeals: 'Oferte', addPh: 'Adaugă un produs (ex. lapte, pâine)…', emptyTitle: 'Lista ta este goală',
    emptyHint: 'Scrie produsele în limba ta – găsesc oferte în supermarketurile olandeze.',
    didYouMean: 'Ai vrut să spui:', noPromo: 'nicio ofertă săptămâna aceasta', more: 'Arată mai multe ({n})', less: 'Mai puține',
    until: 'până la', lastDay: 'ultima zi', unknownItem: 'Nerecunoscut – caut literal',
    searchPh: 'Caută oferte…', allStores: 'Toate magazinele', sortEnd: 'Se termină curând', sortPrice: 'Preț',
    sortName: 'Nume', loading: 'Se încarcă ofertele…', failed: 'Încărcare eșuată: {stores}', noResults: 'Niciun rezultat',
    clearDone: 'Șterge cumpărate', promoCount: '{n} oferte', products: '{n} produse', refresh: 'Reîmprospătează',
    updated: 'Actualizat {t}', searchingFor: 'Caut:', translated: 'Tradus:', details: 'Atinge pentru detalii', tabStores: 'Magazine', viewItems: 'Produse', viewStores: 'După magazin', noPromoSection: 'Fără ofertă', noPromoHint: 'cumpără din orice magazin', navigate: 'Navighează', alsoAt: 'Și la:', estTotal: 'total aprox. {sum}', sortStore: 'Magazin', favChains: 'Rețelele mele', favStores: 'Magazinele mele', findNearby: 'Găsește magazine în apropiere', locating: 'Caut magazine în apropiere…', locDenied: 'Permisiune de localizare refuzată – alege manual rețelele favorite.', noStoresFound: 'Nu s-au găsit magazine în apropiere', storesError: 'Nu s-au putut încărca magazinele: {err}', nearby: 'În apropiere', noFavs: 'Niciun magazin ales încă.', language: 'Limbă', pickTitle: 'Mai întâi alege magazinele', pickHint: 'Voi arăta doar ofertele magazinelor alese – alege rețele sau găsește magazine în apropiere. Poți schimba oricând în fila Magazine.', selectAll: 'Toate rețelele', continueBtn: 'Continuă',
  },
  ru: {
    tabList: 'Список', tabDeals: 'Акции', addPh: 'Добавьте товар (напр. молоко, хлеб)…', emptyTitle: 'Ваш список пуст',
    emptyHint: 'Пишите товары на своём языке – я найду акции в нидерландских супермаркетах.',
    didYouMean: 'Вы имели в виду:', noPromo: 'на этой неделе акций нет', more: 'Показать ещё ({n})', less: 'Меньше',
    until: 'до', lastDay: 'последний день', unknownItem: 'Не распознано – ищу дословно',
    searchPh: 'Искать акции…', allStores: 'Все магазины', sortEnd: 'Скоро закончатся', sortPrice: 'Цена',
    sortName: 'Название', loading: 'Загрузка акций…', failed: 'Не удалось загрузить: {stores}', noResults: 'Ничего не найдено',
    clearDone: 'Удалить купленное', promoCount: 'Акций: {n}', products: 'Товаров: {n}', refresh: 'Обновить',
    updated: 'Обновлено {t}', searchingFor: 'Ищу:', translated: 'Переведено:', details: 'Нажмите для подробностей', tabStores: 'Магазины', viewItems: 'Товары', viewStores: 'По магазинам', noPromoSection: 'Без акции', noPromoHint: 'купите в любом магазине', navigate: 'Маршрут', alsoAt: 'Также в:', estTotal: 'итого ок. {sum}', sortStore: 'Магазин', favChains: 'Мои сети', favStores: 'Мои магазины', findNearby: 'Найти магазины рядом', locating: 'Ищу магазины рядом…', locDenied: 'Нет разрешения на геолокацию – выберите любимые сети вручную.', noStoresFound: 'Рядом магазинов не найдено', storesError: 'Не удалось загрузить магазины: {err}', nearby: 'Рядом', noFavs: 'Магазины ещё не выбраны.', language: 'Язык', pickTitle: 'Сначала выберите магазины', pickHint: 'Буду показывать акции только из выбранных магазинов – выберите сети или найдите магазины рядом. Изменить можно в любое время во вкладке Магазины.', selectAll: 'Все сети', continueBtn: 'Далее',
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
