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
eieren|ei;eggs|egg;jajka|jajko|jaja|jajek|jajkiem;eier|ei;oeufs|oeuf|œufs;huevos|huevo;uova|uovo;ovos|ovo;yumurta;яйця|яйце;ouă|ou;яйца|яйцо
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
# --- dodatkowe: owoce i warzywa ---
framboos|frambozen;raspberries|raspberry;maliny|malina;himbeeren|himbeere;framboises|framboise;frambuesas|frambuesa;lamponi|lampone;framboesas|framboesa;ahududu;малина;zmeură;малина
kersen|kers;cherries|cherry;wiśnie|czereśnie|wiśnia;kirschen|kirsche;cerises|cerise;cerezas|cereza;ciliegie|ciliegia;cerejas|cereja;kiraz|vişne;вишня|черешня;cireșe|cireașă;вишня|черешня
perziken|perzik|nectarines|nectarine;peaches|peach|nectarines;brzoskwinie|brzoskwinia|nektarynki;pfirsiche|pfirsich|nektarinen;pêches|pêche|nectarines;melocotones|melocotón|nectarinas;pesche|pesca|nettarine;pêssegos|pêssego|nectarinas;şeftali|nektarin;персики|персик|нектарини;piersici|piersică|nectarine;персики|персик|нектарины
pruimen|pruim;plums|plum;śliwki|śliwka;pflaumen|pflaume|zwetschgen;prunes|prune;ciruelas|ciruela;prugne|prugna|susine;ameixas|ameixa;erik;сливи|слива;prune|prună;сливы|слива
grapefruit|pompelmoes;grapefruit;grejpfrut;grapefruit|pampelmuse;pamplemousse;pomelo;pompelmo;toranja;greyfurt;грейпфрут;grepfrut;грейпфрут
rucola;rocket|arugula;rukola;rucola|rauke;roquette;rúcula;rucola;rúcula;roka;рукола;rucola;руккола
radijs|radijsjes;radish|radishes;rzodkiewka|rzodkiewki;radieschen;radis;rábano|rábanos;ravanello|ravanelli;rabanete|rabanetes;turp;редиска;ridichi|ridiche;редис
bieten|biet|rode biet;beetroot|beets;burak|buraki;rote bete|rote beete;betterave|betteraves;remolacha;barbabietola;beterraba;pancar;буряк;sfeclă roșie|sfeclă;свёкла|свекла
selderij|bleekselderij|knolselderij;celery;seler;sellerie;céleri;apio;sedano;aipo;kereviz;селера;țelină;сельдерей
venkel;fennel;koper włoski|fenkuł;fenchel;fenouil;hinojo;finocchio;funcho;rezene;фенхель;fenicul;фенхель
asperges|asperge;asparagus;szparagi|szparag;spargel;asperges|asperge;espárragos|espárrago;asparagi|asparago;espargos|espargo;kuşkonmaz;спаржа;sparanghel;спаржа
erwten|doperwten|tuinerwten;peas;groszek|groch;erbsen;petits pois|pois;guisantes;piselli;ervilhas;bezelye;горошок;mazăre;горошек
zoete aardappel|zoete aardappelen|bataat;sweet potato|sweet potatoes;batat|słodkie ziemniaki;süßkartoffel|süßkartoffeln;patate douce|patates douces;batata|boniato;patate dolci|patata dolce;batata-doce;tatlı patates;батат|солодка картопля;cartof dulce|cartofi dulci;батат|сладкий картофель
gember;ginger;imbir;ingwer;gingembre;jengibre;zenzero;gengibre;zencefil;імбир;ghimbir;имбирь
peterselie;parsley;pietruszka;petersilie;persil;perejil;prezzemolo;salsa|salsinha;maydanoz;петрушка;pătrunjel;петрушка
basilicum;basil;bazylia;basilikum;basilic;albahaca;basilico;manjericão;fesleğen;базилік;busuioc;базилик
olijven|olijf;olives|olive;oliwki;oliven|olive;olives|olive;aceitunas|olivas;olive|oliva;azeitonas;zeytin;оливки|маслини;măsline;оливки|маслины
# --- dodatkowe: mięso, ryby, nabiał ---
salami;salami;salami;salami;salami;salami;salame;salame;salam;салямі;salam;салями
leverworst|paté|smeerleverworst;liverwurst|pâté|liver sausage;pasztetowa|pasztet;leberwurst|pastete;pâté;paté;paté|patè;patê;ezme|ciğer ezmesi;паштет;pateu;паштет
braadworst|bratwurst;bratwurst;kiełbasa biała|kiełbasa do smażenia;bratwurst;saucisse à rôtir|bratwurst;salchicha para asar|bratwurst;salsiccia|bratwurst;salsicha para assar|bratwurst;kızartmalık sosis|bratwurst;братвурст|ковбаски для смаження;bratwurst|cârnați pentru prăjit;братвурст|колбаски для жарки
gehaktballen|gehaktbal;meatballs|meatball;klopsiki|pulpety;frikadellen|hackbällchen;boulettes de viande|boulettes;albóndigas;polpette;almôndegas;köfte;фрикадельки|тефтелі;chifteluțe|chiftele;фрикадельки|тефтели
schnitzel|schnitzels|kipschnitzel;schnitzel|cutlet;sznycel|kotlet schabowy;schnitzel;escalope;escalope|milanesa;cotoletta|scaloppina;escalope|panado;şnitzel;шніцель|відбивна;șnițel;шницель|отбивная
kabeljauw;cod;dorsz;kabeljau|dorsch;cabillaud|morue;bacalao;merluzzo|baccalà;bacalhau;morina;тріска;cod|batog;треска
haring;herring;śledź;hering;hareng;arenque;aringa;arenque;ringa;оселедець;hering;сельдь|селедка
makreel;mackerel;makrela;makrele;maquereau;caballa|escombro;sgombro;cavala|sarda;uskumru;скумбрія;macrou;скумбрия
mosselen|mossel;mussels;małże|omułki;muscheln|miesmuscheln;moules;mejillones;cozze;mexilhões;midye;мідії;midii;мидии
roomkaas|smeerkaas;cream cheese;serek śmietankowy|serek do smarowania;frischkäse;fromage frais|fromage à tartiner;queso crema;formaggio spalmabile;queijo creme;krem peynir;вершковий сир;brânză cremă;сливочный сыр
mozzarella;mozzarella;mozzarella;mozzarella;mozzarella;mozzarella;mozzarella;mozzarella;mozzarella;моцарела;mozzarella;моцарелла
feta;feta|greek cheese;feta;feta|schafskäse;feta;queso feta|feta;feta;queijo feta|feta;beyaz peynir|feta;фета;feta;фета
karnemelk;buttermilk;maślanka;buttermilch;babeurre|lait ribot;suero de leche|suero de mantequilla;latticello;leitelho;ayran|çalkanmış süt;маслянка|пахта;zară;пахта|маслянка
drinkyoghurt|yoghurtdrank;drinking yoghurt|yogurt drink;jogurt pitny;trinkjoghurt;yaourt à boire;yogur líquido|yogur para beber;yogurt da bere;iogurte líquido;ayran|içilebilir yoğurt;питний йогурт;iaurt de băut;питьевой йогурт
chocolademelk;chocolate milk;mleko czekoladowe;schokomilch|kakao;lait chocolaté;leche con chocolate|batido de chocolate;latte al cioccolato;leite com chocolate|chocolate frio;çikolatalı süt;шоколадне молоко;lapte cu ciocolată;шоколадное молоко
# --- dodatkowe: pieczywo, słodkie, spiżarnia ---
pannenkoeken|pannenkoek|poffertjes;pancakes|pancake;naleśniki|naleśnik|racuchy;pfannkuchen;crêpes|crêpe|pancakes;tortitas|crepes|panqueques;pancake|crêpe;panquecas|crepes;krep|pankek;млинці|млинець;clătite|clătită;блины|блин|оладьи
wafels|wafel;waffles|waffle;gofry|gofr;waffeln|waffel;gaufres|gaufre;gofres|gofre;waffle|cialde;waffles|waffle;waffle|gofret;вафлі|вафля;vafe|vafă;вафли|вафля
muffins|muffin|cupcakes;muffins|muffin|cupcakes;muffinki|muffin;muffins|muffin;muffins|muffin;magdalenas|muffins;muffin|plumcake;queques|muffins;muffin|kek;мафіни|кекс;brioșe|muffins;маффины|кекс
rozijnen;raisins;rodzynki;rosinen;raisins secs;pasas;uvetta|uva passa;passas|uvas passas;kuru üzüm;родзинки|ізюм;stafide;изюм
gedroogd fruit|dadels|vijgen|abrikozen;dried fruit|dates|figs|apricots;suszone owoce|daktyle|figi|morele;trockenfrüchte|datteln|feigen;fruits secs|dattes|figues;fruta seca|dátiles|higos;frutta secca|datteri|fichi;fruta seca|tâmaras|figos;kuru meyve|hurma|incir|kayısı;сухофрукти|фініки|інжир;fructe uscate|curmale|smochine;сухофрукты|финики|инжир
popcorn;popcorn;popcorn;popcorn;pop-corn|popcorn;palomitas;popcorn;pipocas;patlamış mısır|popcorn;попкорн;floricele|popcorn;попкорн
rijstwafels|rijstwafel;rice cakes;wafle ryżowe|chrupki ryżowe;reiswaffeln;galettes de riz;tortitas de arroz;gallette di riso;bolachas de arroz;pirinç patlağı;рисові хлібці;turte de orez;рисовые хлебцы
tomatenpuree;tomato paste|tomato puree;koncentrat pomidorowy;tomatenmark;concentré de tomate;concentrado de tomate;concentrato di pomodoro;concentrado de tomate;domates salçası;томатна паста;pastă de tomate;томатная паста
gepelde tomaten|tomatenblokjes|passata;canned tomatoes|chopped tomatoes|passata;pomidory w puszce|passata;dosentomaten|passata;tomates pelées|tomates concassées|passata;tomate triturado|tomate pelado|passata;pomodori pelati|polpa di pomodoro|passata;tomate pelado|polpa de tomate|passata;konserve domates|passata;консервовані помідори|пасата;roșii în conservă|passata;консервированные помидоры|пассата
couscous;couscous;kuskus;couscous;couscous|semoule;cuscús;couscous;cuscuz;kuskus;кускус;cuscus;кускус
quinoa;quinoa;komosa ryżowa|quinoa;quinoa;quinoa;quinoa;quinoa;quinoa;kinoa;кіноа;quinoa;киноа
noedels|mie;noodles;makaron chiński|noodle;nudeln|asia-nudeln;nouilles;fideos chinos|noodles;noodles;talharim|noodles;erişte|noodle;локшина;tăiței|noodles;лапша
wraps|tortilla|tortilla's;wraps|tortillas;tortille|wrapy;wraps|tortillas;wraps|tortillas;tortillas|wraps;piadine|tortillas|wrap;tortilhas|wraps;dürüm|tortilla|lavaş;тортильї|лаваш;tortilla|wrap;тортильи|лаваш
pesto;pesto;pesto;pesto;pesto;pesto;pesto;pesto;pesto;песто;pesto;песто
appelmoes;apple sauce|applesauce;mus jabłkowy;apfelmus;compote de pommes;compota de manzana;composta di mele;compota de maçã;elma püresi;яблучне пюре;compot de mere;яблочное пюре
augurken|augurk;pickles|gherkins;ogórki konserwowe|korniszony;gewürzgurken|essiggurken;cornichons;pepinillos;cetriolini;pepinos em conserva;kornişon|turşu;мариновані огірки;murături|castraveți murați;маринованные огурцы
zuurkool;sauerkraut;kapusta kiszona;sauerkraut;choucroute;chucrut;crauti;chucrute;lahana turşusu;квашена капуста;varză murată;квашеная капуста
bouillon|bouillonblokjes;stock cube|bouillon;kostka rosołowa|bulion;brühwürfel|brühe;bouillon cube|bouillon;caldo en cubitos|caldo;dado|brodo;caldo|cubos de caldo;et suyu tableti|bulyon;бульйонний кубик|бульйон;cub de supă|supă concentrată;бульонный кубик|бульон
kaneel;cinnamon;cynamon;zimt;cannelle;canela;cannella;canela;tarçın;кориця;scorțișoară;корица
bakpoeder;baking powder;proszek do pieczenia;backpulver;levure chimique;levadura química;lievito in polvere;fermento em pó;kabartma tozu;розпушувач;praf de copt;разрыхлитель
gist;yeast;drożdże;hefe;levure;levadura;lievito;fermento;maya;дріжджі;drojdie;дрожжи
# --- dodatkowe: napoje i dom ---
whisky|wodka|gin|rum|jenever|sterke drank;whisky|vodka|gin|rum|spirits;whisky|wódka|gin|rum|alkohol;whisky|wodka|gin|rum|spirituosen;whisky|vodka|gin|rhum|spiritueux;whisky|vodka|ginebra|ron|licor;whisky|vodka|gin|rum|liquori;whisky|vodka|gin|rum|bebidas espirituosas;viski|votka|cin|rom|içki;віскі|горілка|джин|ром|міцний алкоголь;whisky|vodcă|gin|rom|băuturi spirtoase;виски|водка|джин|ром|крепкий алкоголь
prosecco|champagne|mousserende wijn|cava;prosecco|champagne|sparkling wine|cava;prosecco|szampan|wino musujące|cava;prosecco|champagner|sekt|schaumwein;prosecco|champagne|vin mousseux|cava;prosecco|champán|cava|vino espumoso;prosecco|champagne|spumante;prosecco|champanhe|espumante;prosecco|şampanya|köpüklü şarap;просекко|шампанське|ігристе вино;prosecco|șampanie|vin spumant;просекко|шампанское|игристое вино
cider;cider;cydr;cidre|apfelwein;cidre;sidra;sidro;sidra;elma şarabı;сидр;cidru;сидр
ijsthee;iced tea|ice tea;mrożona herbata|ice tea;eistee;thé glacé|ice tea;té helado|ice tea;tè freddo|ice tea;chá gelado|ice tea;buzlu çay|ice tea;холодний чай|айс ті;ceai rece|ice tea;холодный чай|айс ти
smoothie|smoothies;smoothie|smoothies;smoothie|koktajl owocowy;smoothie|smoothies;smoothie|smoothies;batido|smoothie;frullato|smoothie;batido|smoothie;smoothie;смузі;smoothie;смузи
tissues|zakdoekjes|papieren zakdoekjes;tissues|paper tissues;chusteczki|chusteczki higieniczne;taschentücher|tempo;mouchoirs|mouchoirs en papier;pañuelos|pañuelos de papel;fazzoletti|fazzoletti di carta;lenços|lenços de papel;mendil|kağıt mendil;серветки|паперові хустинки;șervețele|batiste de hârtie;салфетки|бумажные платочки
maandverband|tampons|inlegkruisjes;sanitary pads|tampons|panty liners;podpaski|tampony|wkładki higieniczne;binden|tampons|slipeinlagen;serviettes hygiéniques|tampons|protège-slips;compresas|tampones|salvaslips;assorbenti|tamponi|proteggislip;pensos higiénicos|tampões|protetores diários;hijyenik ped|tampon|günlük ped;прокладки|тампони;absorbante|tampoane;прокладки|тампоны
deodorant|deo;deodorant;dezodorant;deo|deodorant;déodorant;desodorante;deodorante;desodorizante|desodorante;deodorant;дезодорант;deodorant;дезодорант
scheermesjes|scheerschuim|scheergel;razors|shaving foam|shaving gel;maszynki do golenia|pianka do golenia|żel do golenia;rasierer|rasierklingen|rasierschaum|rasiergel;rasoirs|mousse à raser|gel à raser;cuchillas de afeitar|espuma de afeitar|gel de afeitar;rasoi|schiuma da barba|gel da barba;lâminas de barbear|espuma de barbear|gel de barbear;tıraş bıçağı|tıraş köpüğü|tıraş jeli;леза для гоління|піна для гоління|гель для гоління;lame de ras|spumă de ras|gel de ras;лезвия для бритья|пена для бритья|гель для бритья
aluminiumfolie|bakpapier|vershoudfolie;aluminium foil|baking paper|cling film;folia aluminiowa|papier do pieczenia|folia spożywcza;alufolie|backpapier|frischhaltefolie;papier aluminium|papier cuisson|film alimentaire;papel de aluminio|papel de horno|film transparente;carta stagnola|carta forno|pellicola trasparente;papel de alumínio|papel vegetal|película aderente;alüminyum folyo|yağlı kâğıt|streç film;алюмінієва фольга|пергамент для випічки|харчова плівка;folie de aluminiu|hârtie de copt|folie alimentară;алюминиевая фольга|пергамент для выпечки|пищевая пленка
schoonmaakmiddel|allesreiniger|wc reiniger|schoonmaakmiddelen;cleaning product|all-purpose cleaner|toilet cleaner;środek czystości|płyn do czyszczenia|środek do wc;reiniger|allzweckreiniger|wc-reiniger;produit nettoyant|nettoyant multi-usage|nettoyant wc;producto de limpieza|limpiador multiusos|limpiador wc;detergente|multiuso|detergente wc;produto de limpeza|multiusos|limpa wc;temizlik ürünü|çok amaçlı temizleyici|tuvalet temizleyici;засіб для прибирання|універсальний очисник|засіб для wc;produs de curățenie|soluție universală|soluție wc;чистящее средство|универсальный очиститель|средство для туалета
kokosmelk;coconut milk;mleko kokosowe;kokosmilch;lait de coco;leche de coco;latte di cocco;leite de coco;hindistan cevizi sütü;кокосове молоко;lapte de cocos;кокосовое молоко
tofu;tofu;tofu;tofu;tofu;tofu;tofu;tofu;tofu;тофу;tofu;тофу
hummus;hummus;hummus;hummus;houmous|hummus;hummus;hummus;húmus|hummus;humus;хумус;hummus;хумус
boekweit|gort|gierst|grutten;buckwheat|barley|millet|groats;kasza|kasza gryczana|kasza jaglana;buchweizen|graupen|hirse|grütze;sarrasin|orge|millet|semoule;trigo sarraceno|cebada|mijo;grano saraceno|orzo|miglio;trigo sarraceno|cevada|milho miúdo;karabuğday|arpa|darı;гречка|крупа|пшоно;hrișcă|orz|mei;гречка|крупа|пшено
puddingpoeder|gelatinepoeder;jelly dessert|pudding mix;kisiel|budyń w proszku;götterspeise|puddingpulver;gelée dessert|préparation pour flan;gelatina|preparado para flan;budino istantaneo|gelatina;gelatina|preparado para pudim;jöle|puding tozu;кисіль|пудинг у порошку;jeleu|budincă la plic;кисель|пудинг в порошке
`;

export const ROWS = RAW.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
