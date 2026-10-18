// Słownik produktów spożywczych/domowych w 12 językach.
// Każdy wiersz = jeden produkt; kolumny oddzielone ";" w kolejności LANGS,
// synonimy w kolumnie oddzielone "|". Kolumna "nl" to jednocześnie słowa, po których
// szukamy w holenderskich nazwach promocji (rzeczowniki złożone też tu wpisujemy).
// Linie zaczynające się od # są pomijane. Tłumaczenia warto zweryfikować z natywnymi użytkownikami.
export const LANGS = ['nl', 'en', 'pl', 'de', 'fr', 'es', 'it', 'pt', 'tr', 'uk', 'ro', 'ru'];

const RAW = String.raw`
# --- nabiał i jajka ---
melk;milk;mleko;milch;lait;leche;latte;leite;süt;молоко;lapte;молоко
sojamelk|havermelk|amandelmelk|plantaardige melk;plant milk|oat milk|soy milk;mleko roślinne|mleko sojowe|mleko owsiane;pflanzendrink|hafermilch|sojamilch;lait végétal|lait d'avoine|lait de soja;leche vegetal|leche de avena|leche de soja;latte vegetale|latte di soia|latte d'avena;leite vegetal|leite de aveia|leite de soja;bitki sütü|yulaf sütü|soya sütü;рослинне молоко|вівсяне молоко|соєве молоко;lapte vegetal|lapte de ovăz|lapte de soia;растительное молоко|овсяное молоко|соевое молоко
yoghurt|yogurt;yogurt|yoghurt;jogurt;joghurt;yaourt|yogourt;yogur;yogurt;iogurte;yoğurt;йогурт;iaurt;йогурт
kaas|plakken kaas;cheese;ser;käse;fromage;queso;formaggio;queijo;peynir;сир;brânză;сыр
boter;butter;masło;butter;beurre;mantequilla;burro;manteiga;tereyağı;вершкове масло;unt;сливочное масло
eieren|ei;eggs|egg;jajka|jajko|jaja;eier|ei;oeufs|oeuf|œufs;huevos|huevo;uova|uovo;ovos|ovo;yumurta;яйця|яйце;ouă|ou;яйца|яйцо
slagroom|room|kookroom;cream|whipped cream;śmietana|śmietanka;sahne|schlagsahne;crème|creme fraîche;nata;panna;natas|nata;süt kreması|krema;вершки|сметана;smântână|frișcă;сливки|сметана
kwark;quark|curd cheese;twaróg;quark|topfen;fromage blanc;requesón;ricotta|quark;requeijão|queijo fresco;süzme peynir|lor peyniri;кисломолочний сир;brânză de vaci;творог
vla|pudding;custard|pudding;budyń|pudding;pudding|vanillepudding;crème dessert|flan;natillas|flan;budino;pudim;puding|muhallebi;пудинг;budincă;пудинг
margarine;margarine;margaryna;margarine;margarine;margarina;margarina;margarina;margarin;маргарин;margarină;маргарин
# --- mięso i ryby ---
kipfilet|kip|kippenpoot|kippendij;chicken|chicken breast;kurczak|filet z kurczaka|pierś z kurczaka;hähnchen|hühnchen|hähnchenbrust;poulet|blanc de poulet;pollo|pechuga de pollo;pollo|petto di pollo;frango|peito de frango;tavuk|tavuk göğsü;курка|куряче філе|курятина;pui|piept de pui;курица|куриное филе|курятина
gehakt|rundergehakt|half om half;minced meat|ground beef|mince;mięso mielone|mielone;hackfleisch|hack;viande hachée;carne picada;carne macinata|macinato;carne moída|carne picada;kıyma;фарш|м'ясний фарш;carne tocată;фарш|мясной фарш
worst|rookworst|saucijs;sausage;kiełbasa|parówki;wurst|würstchen;saucisse;salchicha|chorizo;salsiccia;salsicha|chouriço;sosis;ковбаса|сосиски;cârnați|crenvurști;колбаса|сосиски
spek|ontbijtspek;bacon;boczek|bekon;speck|bacon;bacon|lard;beicon|panceta;pancetta;bacon|toucinho;domuz pastırması;бекон|сало;bacon|slănină;бекон
ham|achterham|vleeswaren|beleg;ham|cold cuts;szynka|wędlina;schinken|aufschnitt;jambon|charcuterie;jamón|embutido;prosciutto|affettato;fiambre|presunto;jambon|şarküteri;шинка|ковбасні вироби;șuncă|mezeluri;ветчина|колбасные изделия
biefstuk|runderlappen|rundvlees;steak|beef;stek|befsztyk|wołowina;steak|rindfleisch;bifteck|steak|bœuf;filete|bistec|ternera;bistecca|manzo;bife|carne de vaca;biftek|dana eti|sığır eti;стейк|яловичина|говядина;friptură|vită|carne de vită;стейк|говядина
varkensvlees|varkenshaas|spareribs|karbonade;pork;wieprzowina|schab;schweinefleisch|schwein;porc|côtelette de porc;cerdo|carne de cerdo;maiale|carne di maiale;porco|carne de porco;domuz eti;свинина;carne de porc|porc;свинина
lamsvlees|lam;lamb;jagnięcina|baranina;lamm|lammfleisch;agneau;cordero;agnello;cordeiro;kuzu|kuzu eti;баранина|ягнятина;miel|carne de miel;баранина|ягнёнок
kalkoen;turkey;indyk;pute|truthahn;dinde;pavo;tacchino;peru;hindi;індичка;curcan;индейка
hamburger|burger;burger|hamburger;burger|hamburger;burger|hamburger;burger|hamburger;hamburguesa;hamburger;hambúrguer;hamburger;бургер|гамбургер;burger|hamburger;бургер|гамбургер
vlees;meat;mięso;fleisch;viande;carne;carne;carne;et;м'ясо;carne;мясо
vis|visfilet;fish;ryba;fisch;poisson;pescado|pez;pesce;peixe;balık;риба;pește;рыба
zalm|zalmfilet;salmon;łosoś;lachs;saumon;salmón;salmone;salmão;somon;лосось;somon;лосось|сёмга
tonijn;tuna;tuńczyk;thunfisch;thon;atún;tonno;atum;ton balığı;тунець;ton;тунец
garnalen;shrimp|prawns;krewetki;garnelen;crevettes;gambas|camarones;gamberi;camarão|gambas;karides;креветки;creveți;креветки
# --- warzywa ---
aardappelen|aardappel|krieltjes;potatoes|potato;ziemniaki|kartofle|ziemniak;kartoffeln|kartoffel;pommes de terre|pomme de terre;patatas|papas|patata;patate|patata;batatas|batata;patates;картопля;cartofi|cartof;картофель|картошка
tomaten|tomaat|trostomaten;tomatoes|tomato;pomidory|pomidor;tomaten|tomate;tomates|tomate;tomates|tomate;pomodori|pomodoro;tomates|tomate;domates;помідори|помідор;roșii|roșie;помидоры|помидор
uien|ui|rode ui;onions|onion;cebula;zwiebeln|zwiebel;oignons|oignon;cebollas|cebolla;cipolle|cipolla;cebolas|cebola;soğan;цибуля;ceapă;лук
knoflook;garlic;czosnek;knoblauch;ail;ajo;aglio;alho;sarımsak;часник;usturoi;чеснок
wortelen|wortel|peen;carrots|carrot;marchew|marchewka;karotten|möhren|karotte;carottes|carotte;zanahorias|zanahoria;carote|carota;cenouras|cenoura;havuç;морква;morcovi|morcov;морковь
paprika;bell pepper|peppers;papryka;paprika;poivron;pimiento;peperone;pimentão|pimento;dolmalık biber|biber;перець болгарський|паприка;ardei;перец болгарский|паприка
komkommer;cucumber;ogórek;gurke;concombre;pepino;cetriolo;pepino;salatalık;огірок;castravete;огурец
sla|salade|ijsbergsla;lettuce|salad;sałata;salat|kopfsalat;laitue|salade;lechuga|ensalada;lattuga|insalata;alface|salada;marul|salata;салат;salată|salata verde;салат
broccoli;broccoli;brokuł|brokuły;brokkoli;brocoli;brócoli;broccoli;brócolos|brócolis;brokoli;броколі;broccoli;брокколи
bloemkool;cauliflower;kalafior;blumenkohl;chou-fleur;coliflor;cavolfiore;couve-flor;karnabahar;цвітна капуста;conopidă;цветная капуста
spinazie;spinach;szpinak;spinat;épinards|épinard;espinacas;spinaci;espinafres;ıspanak;шпинат;spanac;шпинат
champignons|champignon|paddenstoelen;mushrooms;pieczarki|grzyby;champignons|pilze;champignons;champiñones|setas;funghi|champignon;cogumelos;mantar;печериці|гриби;ciuperci;шампиньоны|грибы
courgette;zucchini|courgette;cukinia;zucchini;courgette;calabacín;zucchine;curgete|courgette;kabak;цукіні|кабачок;dovlecel;кабачок|цуккини
aubergine;eggplant|aubergine;bakłażan;aubergine|eierfrucht;aubergine;berenjena;melanzana;beringela;patlıcan;баклажан;vânătă|pătlăgele vinete;баклажан
prei;leek;por;lauch|porree;poireau;puerro;porro;alho-francês|alho-poró;pırasa;порей;praz;порей
spruitjes;brussels sprouts;brukselka;rosenkohl;choux de bruxelles;coles de bruselas;cavoletti di bruxelles;couves-de-bruxelas;brüksel lahanası;брюссельська капуста;varză de bruxelles;брюссельская капуста
kool|witte kool|rode kool|boerenkool|spitskool;cabbage|kale;kapusta;kohl|weißkohl|grünkohl;chou;col|repollo;cavolo;repolho|couve;lahana;капуста;varză;капуста
mais|maïs;corn|sweetcorn;kukurydza;mais;maïs;maíz;mais;milho;mısır;кукурудза;porumb;кукуруза
avocado;avocado;awokado;avocado;avocat;aguacate;avocado;abacate;avokado;авокадо;avocado;авокадо
pompoen;pumpkin;dynia;kürbis;citrouille|potiron;calabaza;zucca;abóbora;balkabağı;гарбуз;dovleac;тыква
groente|groenten|verse groente;vegetables;warzywa;gemüse;légumes;verduras;verdure;legumes;sebze;овочі;legume;овощи
# --- owoce ---
appels|appel;apples|apple;jabłka|jabłko;äpfel|apfel;pommes|pomme;manzanas|manzana;mele|mela;maçãs|maçã;elma;яблука|яблуко;mere|măr;яблоки|яблоко
bananen|banaan;bananas|banana;banany|banan;bananen|banane;bananes|banane;plátanos|plátano|bananas;banane|banana;bananas|banana;muz;банани|банан;banane|banană;бананы|банан
sinaasappels|sinaasappel|sinaasappelen;oranges|orange;pomarańcze|pomarańcza;orangen|orange;oranges|orange;naranjas|naranja;arance|arancia;laranjas|laranja;portakal;апельсини|апельсин;portocale|portocală;апельсины|апельсин
mandarijnen|mandarijn|clementines;tangerines|mandarins|clementines;mandarynki|mandarynka;mandarinen|klementinen;mandarines|clémentines;mandarinas|clementinas;mandarini|clementine;tangerinas|clementinas;mandalina;мандарини|мандарин;mandarine|clementine;мандарины|мандарин
citroenen|citroen;lemons|lemon;cytryny|cytryna;zitronen|zitrone;citrons|citron;limones|limón;limoni|limone;limões|limão;limon;лимони|лимон;lămâi|lămâie;лимоны|лимон
druiven|druif;grapes|grape;winogrona;trauben|weintrauben;raisins;uvas|uva;uva;uvas|uva;üzüm;виноград;struguri;виноград
aardbeien|aardbei;strawberries|strawberry;truskawki|truskawka;erdbeeren|erdbeere;fraises|fraise;fresas|fresa;fragole|fragola;morangos|morango;çilek;полуниця|суниця;căpșuni|căpșună;клубника|земляника
blauwe bessen|bosbessen;blueberries;borówki|jagody;heidelbeeren|blaubeeren;myrtilles;arándanos;mirtilli;mirtilos;yaban mersini;чорниця|лохина;afine;черника|голубика
peren|peer;pears|pear;gruszki|gruszka;birnen|birne;poires|poire;peras|pera;pere|pera;peras|pera;armut;груші|груша;pere|păr;груши|груша
ananas;pineapple;ananas;ananas;ananas;piña;ananas;ananás;ananas;ананас;ananas;ананас
mango|mango's;mango;mango;mango;mangue;mango;mango;manga;mango;манго;mango;манго
meloen|watermeloen|suikermeloen;melon|watermelon;melon|arbuz;melone|wassermelone;melon|pastèque;melón|sandía;melone|anguria|cocomero;melão|melancia;kavun|karpuz;диня|кавун;pepene;дыня|арбуз
kiwi|kiwi's;kiwi;kiwi;kiwi;kiwi;kiwi;kiwi;kiwi;kivi;ківі;kiwi;киви
fruit;fruit;owoce;obst;fruits;fruta;frutta;fruta;meyve;фрукти;fructe;фрукты
# --- pieczywo i słodkie ---
brood|volkorenbrood|witbrood|bruinbrood;bread;chleb|pieczywo;brot;pain;pan;pane;pão;ekmek;хліб;pâine;хлеб
broodjes|broodje|pistolets;rolls|bread rolls|buns;bułki|bułka;brötchen|semmel;petits pains|pain au lait;panecillos|bollos;panini|panino;pãezinhos;küçük ekmek|sandviç ekmeği;булочки|булка;chifle|chiflă;булочки|булка
croissant|croissants;croissant;rogalik|croissant;croissant;croissant;cruasán|croissant;cornetto|croissant;croissant;kruvasan;круасан;croissant;круассан
crackers|beschuit|toast;crackers|crispbread|rusks;krakersy|sucharki;cracker|zwieback;crackers|biscottes;galletas saladas|tostadas;cracker|fette biscottate;bolachas|tostas;kraker|galeta;крекер|сухарики;biscuiți sărați|pesmeți;крекеры|сухари
koekjes|koek|biscuit;cookies|biscuits;ciasteczka|herbatniki|ciastka;kekse|plätzchen;biscuits|gâteaux secs;galletas;biscotti;bolachas|biscoitos;kurabiye|bisküvi;печиво;biscuiți|fursecuri;печенье
taart|gebak|cake;cake|pie|pastry;ciasto|tort;kuchen|torte;gâteau|tarte;pastel|tarta;torta|dolce;bolo|torta;kek|pasta;торт|пиріг;tort|prăjitură;торт|пирог
# --- produkty suche i sosy ---
pasta|spaghetti|macaroni|penne;pasta|spaghetti|noodles;makaron|spaghetti;nudeln|pasta|spaghetti;pâtes|spaghetti;pasta|espaguetis|macarrones;pasta|spaghetti;massa|esparguete|macarrão;makarna|spagetti;макарони|паста|спагеті;paste|spaghete|macaroane;макароны|паста|спагетти
rijst;rice;ryż;reis;riz;arroz;riso;arroz;pirinç|pilav;рис;orez;рис
bloem|meel|tarwebloem;flour;mąka;mehl;farine;harina;farina;farinha;un;борошно;făină;мука
suiker;sugar;cukier;zucker;sucre;azúcar;zucchero;açúcar;şeker;цукор;zahăr;сахар
zout;salt;sól;salz;sel;sal;sale;sal;tuz;сіль;sare;соль
peper|zwarte peper;pepper|black pepper;pieprz;pfeffer;poivre;pimienta;pepe;pimenta;karabiber;перець;piper;перец
olie|olijfolie|zonnebloemolie|bakolie;oil|olive oil|sunflower oil;olej|oliwa;öl|olivenöl|speiseöl;huile|huile d'olive;aceite|aceite de oliva;olio|olio d'oliva;óleo|azeite;yağ|zeytinyağı|ayçiçek yağı;олія|оливкова олія;ulei|ulei de măsline;масло растительное|оливковое масло|подсолнечное масло
azijn;vinegar;ocet;essig;vinaigre;vinagre;aceto;vinagre;sirke;оцет;oțet;уксус
mayonaise|mayo;mayonnaise;majonez;mayonnaise|mayo;mayonnaise;mayonesa;maionese;maionese;mayonez;майонез;maioneză;майонез
ketchup|tomatenketchup;ketchup;keczup;ketchup;ketchup;kétchup|ketchup;ketchup;ketchup;ketçap;кетчуп;ketchup;кетчуп
mosterd;mustard;musztarda;senf;moutarde;mostaza;senape;mostarda;hardal;гірчиця;muștar;горчица
pindakaas;peanut butter;masło orzechowe;erdnussbutter;beurre de cacahuète;mantequilla de cacahuete|crema de cacahuete;burro di arachidi;manteiga de amendoim;fıstık ezmesi;арахісова паста|арахісове масло;unt de arahide;арахисовая паста|арахисовое масло
jam|confituur|appelstroop;jam;dżem|konfitura;marmelade|konfitüre;confiture;mermelada;marmellata|confettura;compota|doce;reçel;джем|варення;gem|dulceață;джем|варенье
honing;honey;miód;honig;miel;miel;miele;mel;bal;мед;miere;мед
hagelslag|chocopasta|nutella;chocolate sprinkles|chocolate spread|nutella;posypka czekoladowa|krem czekoladowy|nutella;schokostreusel|nuss-nougat-creme|nutella;vermicelles au chocolat|pâte à tartiner|nutella;virutas de chocolate|crema de cacao|nutella;codette al cioccolato|crema spalmabile|nutella;granulado de chocolate|creme de chocolate|nutella;çikolata draje|çikolatalı krem|nutella;шоколадна посипка|шоколадна паста|нутелла;fulgi de ciocolată|cremă de ciocolată|nutella;шоколадная посыпка|шоколадная паста|нутелла
muesli|cornflakes|granola|ontbijtgranen;muesli|cereal|cornflakes;muesli|płatki śniadaniowe|płatki kukurydziane;müsli|cornflakes|frühstücksflocken;céréales|muesli;cereales|muesli;cereali|muesli;cereais|muesli;mısır gevreği|müsli;мюслі|пластівці;cereale|musli;мюсли|хлопья|кукурузные хлопья
havermout;oatmeal|oats|porridge;płatki owsiane;haferflocken;flocons d'avoine;copos de avena|avena;fiocchi d'avena;flocos de aveia|aveia;yulaf ezmesi|yulaf;вівсянка|вівсяні пластівці;fulgi de ovăz;овсянка|овсяные хлопья
soep|tomatensoep|erwtensoep;soup;zupa;suppe;soupe;sopa;zuppa|minestra;sopa;çorba;суп;supă;суп
saus|pastasaus|tomatensaus|sojasaus;sauce|pasta sauce|tomato sauce;sos|sos do makaronu|sos pomidorowy;soße|sauce|tomatensoße;sauce|sauce tomate;salsa|salsa de tomate;salsa|sugo|passata;molho|molho de tomate;sos|domates sosu;соус;sos|sos de roșii;соус
bonen|kidneybonen|witte bonen;beans;fasola|fasolka;bohnen;haricots;judías|frijoles|alubias;fagioli;feijão|feijões;fasulye;квасоля;fasole;фасоль
linzen;lentils;soczewica;linsen;lentilles;lentejas;lenticchie;lentilhas;mercimek;сочевиця;linte;чечевица
kikkererwten;chickpeas;ciecierzyca|cieciorka;kichererbsen;pois chiches;garbanzos;ceci;grão-de-bico;nohut;нут;năut;нут
noten|pinda's|amandelen|walnoten|cashewnoten;nuts|peanuts|almonds|walnuts;orzechy|migdały|orzeszki;nüsse|mandeln|walnüsse|erdnüsse;noix|amandes|cacahuètes;frutos secos|nueces|almendras|cacahuetes;noci|mandorle|arachidi;frutos secos|nozes|amêndoas|amendoins;fındık|ceviz|badem|kuruyemiş;горіхи|мигдаль|арахіс;nuci|migdale|alune;орехи|миндаль|арахис
chips|zoutjes|crisps;chips|crisps;chipsy|chrupki;chips|kartoffelchips;chips;patatas fritas de bolsa|papas fritas de bolsa;patatine in busta|chips;batatas fritas de pacote|chips;cips|patates cipsi;чіпси;chipsuri;чипсы
chocolade|chocoladereep|reep;chocolate|chocolate bar;czekolada;schokolade;chocolat;chocolate;cioccolato|cioccolata;chocolate;çikolata;шоколад;ciocolată;шоколад
snoep|drop|winegums|gummy;sweets|candy|gummy bears;słodycze|cukierki|żelki;süßigkeiten|bonbons|gummibärchen;bonbons|confiserie;dulces|caramelos|golosinas;caramelle|dolciumi;doces|rebuçados|gomas;şekerleme|bonbon;цукерки|солодощі;bomboane|dulciuri;конфеты|сладости
ijs|roomijs|ijsjes;ice cream;lody;eis|speiseeis;glace|crème glacée;helado;gelato;gelado|sorvete;dondurma;морозиво;înghețată;мороженое
pizza|diepvriespizza;pizza;pizza;pizza;pizza;pizza;pizza;pizza;pizza;піца;pizza;пицца
friet|frites|patat|oven friet;fries|french fries;frytki;pommes|pommes frites;frites;patatas congeladas|patatas fritas congeladas;patatine fritte|patate fritte;batata frita|batatas fritas congeladas;patates kızartması;картопля фрі|смажена картопля;cartofi prăjiți|cartofi pai;картофель фри
diepvries|diepvriesmaaltijd;frozen food|frozen;mrożonki|mrożonka;tiefkühlkost|tiefkühl;surgelés;congelados;surgelati;congelados;dondurulmuş gıda|donmuş;заморожені продукти|заморозка;congelate;замороженные продукты|заморозка
# --- napoje ---
water|mineraalwater|bruiswater;water|mineral water|sparkling water;woda|woda mineralna;wasser|mineralwasser;eau|eau minérale;agua|agua mineral;acqua|acqua minerale;água|água mineral;su|maden suyu;вода|мінеральна вода;apă|apă minerală;вода|минеральная вода
sap|vruchtensap|appelsap|sinaasappelsap;juice|orange juice|apple juice;sok|sok pomarańczowy|sok jabłkowy;saft|orangensaft|apfelsaft;jus|jus d'orange;zumo|jugo|zumo de naranja;succo|succo d'arancia;sumo|suco|sumo de laranja;meyve suyu|portakal suyu;сік|апельсиновий сік;suc|suc de portocale;сок|апельсиновый сок
frisdrank|cola|fanta|sprite|limonade;soft drink|soda|cola|lemonade;napój gazowany|cola|lemoniada|napoje;limonade|cola|softdrink|erfrischungsgetränk;boisson gazeuse|soda|cola|limonade;refresco|gaseosa|cola;bibita|cola|aranciata|bevanda gassata;refrigerante|cola;gazlı içecek|kola|meşrubat;газований напій|кола|лимонад;suc acidulat|cola|băutură răcoritoare;газировка|кола|лимонад|напиток
bier|pils|speciaalbier;beer;piwo;bier;bière;cerveza;birra;cerveja;bira;пиво;bere;пиво
wijn|rode wijn|witte wijn|rosé;wine|red wine|white wine;wino|czerwone wino|białe wino;wein|rotwein|weißwein;vin|vin rouge|vin blanc;vino|vino tinto|vino blanco;vino|vino rosso|vino bianco;vinho|vinho tinto|vinho branco;şarap;вино;vin;вино
koffie|koffiebonen|koffiecups|koffiepads;coffee|coffee beans;kawa|kawa ziarnista|kawa mielona;kaffee|kaffeebohnen;café|café en grains;café|café en grano;caffè|caffè in grani;café|grãos de café;kahve|çekirdek kahve;кава|кавові зерна;cafea|boabe de cafea;кофе|кофе в зёрнах
thee;tea;herbata;tee;thé;té;tè;chá;çay;чай;ceai;чай
energiedrank|red bull;energy drink|red bull;napój energetyczny|red bull;energydrink|red bull;boisson énergisante|red bull;bebida energética|red bull;bevanda energetica|red bull;bebida energética|red bull;enerji içeceği|red bull;енергетик|енергетичний напій;băutură energizantă|red bull;энергетик|энергетический напиток
# --- dom i higiena ---
wc-papier|toiletpapier;toilet paper;papier toaletowy;toilettenpapier|klopapier;papier toilette|papier hygiénique;papel higiénico;carta igienica;papel higiénico;tuvalet kağıdı;туалетний папір;hârtie igienică;туалетная бумага
keukenrol|keukenpapier;paper towels|kitchen roll;ręcznik papierowy;küchenrolle|küchenpapier;essuie-tout|papier absorbant;papel de cocina|rollo de cocina;carta da cucina|scottex;papel de cozinha;kağıt havlu;паперовий рушник;prosop de hârtie|hârtie de bucătărie;бумажные полотенца
afwasmiddel|afwas;dish soap|washing-up liquid;płyn do naczyń;spülmittel;liquide vaisselle;lavavajillas|detergente para vajilla;detersivo per piatti|lavapiatti;detergente da loiça|detergente da louça;bulaşık deterjanı|bulaşık sabunu;засіб для миття посуду;detergent de vase;средство для мытья посуды
wasmiddel|wasverzachter|waspoeder;laundry detergent|fabric softener;proszek do prania|płyn do prania|płyn do płukania;waschmittel|waschpulver|weichspüler;lessive|adoucissant;detergente|suavizante;detersivo per lavatrice|ammorbidente;detergente para a roupa|amaciador;çamaşır deterjanı|yumuşatıcı;пральний порошок|засіб для прання;detergent de rufe|balsam de rufe;стиральный порошок|средство для стирки
shampoo;shampoo;szampon;shampoo;shampoing;champú;shampoo;champô|shampoo;şampuan;шампунь;șampon;шампунь
tandpasta;toothpaste;pasta do zębów;zahnpasta;dentifrice|pâte dentifrice;pasta de dientes|dentífrico;dentifricio;pasta de dentes|dentífrico;diş macunu;зубна паста;pastă de dinți;зубная паста
zeep|handzeep|douchegel;soap|hand soap|shower gel;mydło|żel pod prysznic;seife|duschgel;savon|gel douche;jabón|gel de ducha;sapone|bagnoschiuma;sabonete|gel de duche;sabun|duş jeli;мило|гель для душу;săpun|gel de duș;мыло|гель для душа
vuilniszakken|afvalzakken;garbage bags|bin bags;worki na śmieci;müllbeutel|müllsäcke;sacs poubelle;bolsas de basura;sacchi della spazzatura|sacchetti per l'immondizia;sacos do lixo;çöp poşeti;мішки для сміття;saci de gunoi;мусорные пакеты
luiers|pampers;diapers|nappies;pieluchy|pampersy;windeln;couches;pañales;pannolini;fraldas;bebek bezi;підгузки;scutece;подгузники
kattenvoer|kattenbrokken;cat food;karma dla kota|jedzenie dla kota;katzenfutter;nourriture pour chat|croquettes pour chat;comida para gatos;cibo per gatti;ração para gatos|comida para gatos;kedi maması;корм для кішок;mâncare pentru pisici;корм для кошек
hondenvoer|hondenbrokken;dog food;karma dla psa|jedzenie dla psa;hundefutter;nourriture pour chien|croquettes pour chien;comida para perros;cibo per cani;ração para cães|comida para cães;köpek maması;корм для собак;mâncare pentru câini;корм для собак
`;

export const ROWS = RAW.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
