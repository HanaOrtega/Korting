// Dane demonstracyjne – żeby aplikacja działała bez internetu (KORTING_SAMPLE=1).
const day = 86400000;
const end = (d) => new Date(Date.now() + d * day).toISOString();
const rows = [
  ['Albert Heijn', 'Halfvolle melk 1 L', 1.09, 1.29, 'BONUS', 3],
  ['Jumbo', 'Hollandse tomaten 500 g', 1.49, 1.99, '25% korting', 5],
  ['Lidl', 'Pindakaas 350 g', 1.79, 2.49, 'Lidl Plus', 6],
  ['Plus', 'Gouden Appels 1 kg', 1.99, 2.79, '2e halve prijs', 2],
  ['Dirk', 'Kipfilet 500 g', 4.49, 5.99, 'Weekaanbieding', 4],
];
export default {
  name: 'Demo',
  async fetch() {
    return rows.map(([store, name, price, was, promoText, d], i) => ({
      id: `demo-${i}`, store, name, description: `Was €${was}`, unit: '', price,
      promoText, validFrom: new Date().toISOString(), validUntil: end(d), image: null, url: '',
    }));
  },
};
