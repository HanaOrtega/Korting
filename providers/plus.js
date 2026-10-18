// PLUS jest za ochroną antybotową (Imperva) i ładuje oferty przez OutSystems, więc zwykły
// fetch dostaje blokadę. Otwieramy stronę w prawdziwej przeglądarce (Playwright) i
// przechwytujemy odpowiedź, którą sama strona pobiera. Playwright jest opcjonalny.
const PAGE = 'https://www.plus.nl/aanbiedingen';
const CALL = 'DataActionGetPromotionList_Optimization';

const num = (s) => {
  const n = Number.parseFloat(s);
  return n > 0 ? n : null;
};

export function parsePlus(json) {
  const groups = json?.data?.PromotionOfferList?.List;
  if (!Array.isArray(groups)) throw new Error('PLUS: nieoczekiwana odpowiedź (zmieniło się API?)');
  const period = json.data.PromotionPeriod ?? {};
  const byId = new Map();
  for (const g of groups) {
    for (const o of g.Category?.Offers?.List ?? []) {
      if (o.IsFreeDeliveryOffer) continue; // „Gratis bezorging” to nie produkt
      const id = `plus-${o.PromotionID}-${o.Offer_Id}`;
      const was = num(o.PriceOriginal_Product) ?? num(o.PriceOriginal_Lowest);
      const start = o.StartDate ?? period.FromDate;
      const end = o.EndDate ?? period.ToDate;
      byId.set(id, {
        id,
        store: 'Plus',
        name: [o.Brand, o.Name].filter(Boolean).join(' ').trim(),
        description: [o.Example, o.Variant, o.Package, was && `Was €${String(was).replace('.', ',')}`]
          .filter(Boolean).join(' · '),
        unit: '',
        price: num(o.NewPrice),
        promoText: o.DisplayInfo_Label || o.DisplayInfo_PromotionBasedLabel || '',
        validFrom: start ? `${start}T00:00:00` : null,
        validUntil: end ? `${end}T23:59:59` : null,
        image: o.ImageURL || null,
        url: o.Slug ? `https://www.plus.nl/product/${o.Slug}` : PAGE,
      });
    }
  }
  return [...byId.values()];
}

export default {
  name: 'Plus',
  async fetch() {
    let chromium;
    try {
      ({ chromium } = await import('playwright'));
    } catch {
      throw new Error('wymaga pakietu "playwright" (npm i playwright)');
    }
    const browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || undefined,
    });
    try {
      const page = await (await browser.newContext({ locale: 'nl-NL' })).newPage();
      // Strona woła to API kilka razy (m.in. wersja „preloaded” z częścią ofert) – zbieramy wszystkie.
      const bodies = [];
      page.on('response', async (r) => {
        if (r.url().includes(CALL)) bodies.push(r.json().catch(() => null));
      });
      await page.goto(PAGE, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2000);
      const results = (await Promise.all(bodies)).filter(Boolean);
      if (!results.length) throw new Error('PLUS: strona nie pobrała listy ofert');
      return [...new Map(results.flatMap(parsePlus).map((d) => [d.id, d])).values()];
    } finally {
      await browser.close();
    }
  },
};
