const $ = (id) => document.getElementById(id);
const fmtPrice = (n) => '€' + n.toFixed(2).replace('.', ',');
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
let deals = [];
let saved = load('korting.list', []); // pełne obiekty, żeby lista przetrwała koniec promocji
let tab = 'all';

function save() {
  try { localStorage.setItem('korting.list', JSON.stringify(saved)); } catch {}
  $('listn').textContent = saved.length;
}

function daysLeft(iso) {
  return Math.ceil((Date.parse(iso) - Date.now()) / 86400000);
}

function validity(d) {
  if (!d.validUntil) return '';
  const n = daysLeft(d.validUntil);
  const txt = `do ${fmtDate(d.validUntil)}`;
  if (n < 0) return `<span class="soon">zakończona</span>`;
  return n <= 1 ? `<span class="soon">${txt} (ostatni dzień)</span>` : txt;
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

function render() {
  const q = $('q').value.trim().toLowerCase();
  const store = $('store').value;
  let list = tab === 'list' ? saved : deals;
  list = list.filter(
    (d) => (!store || d.store === store) && (!q || `${d.name} ${d.description}`.toLowerCase().includes(q)),
  );
  const sort = $('sort').value;
  list = [...list].sort((a, b) =>
    sort === 'price' ? (a.price ?? Infinity) - (b.price ?? Infinity)
    : sort === 'name' ? a.name.localeCompare(b.name, 'nl')
    : (Date.parse(a.validUntil) || Infinity) - (Date.parse(b.validUntil) || Infinity));

  $('items').innerHTML = list.map((d) => `
    <article class="card">
      ${d.image ? `<img loading="lazy" src="${esc(d.image)}" alt="" onerror="this.outerHTML='<div class=ph>brak zdjęcia</div>'">` : `<div class="ph">brak zdjęcia</div>`}
      <div class="info">
        <div class="name">${esc(d.name)}</div>
        <div class="meta"><span class="store">${esc(d.store)}</span>${esc(d.unit)} ${d.price != null ? esc(d.promoText) : ''}</div>
        ${d.description ? `<div class="meta desc">${esc(d.description)}</div>` : ''}
        <div class="meta">${validity(d)}</div>
      </div>
      <div><div class="price">${d.price != null ? fmtPrice(d.price) : esc(d.promoText || 'promocja')}</div>
        <button class="add" data-id="${esc(d.id)}" aria-label="${saved.some((s) => s.id === d.id) ? 'Usuń z listy' : 'Dodaj do listy'}">${saved.some((s) => s.id === d.id) ? '★' : '☆'}</button></div>
    </article>`).join('');
  $('count').textContent = `${list.length} produktów`;
  $('status').textContent = list.length ? '' : tab === 'list' ? 'Lista jest pusta – dotknij ☆ przy produkcie.' : 'Brak wyników.';
}

$('items').addEventListener('click', (e) => {
  const btn = e.target.closest('.add');
  if (!btn) return;
  const id = btn.dataset.id;
  const i = saved.findIndex((s) => s.id === id);
  if (i >= 0) saved.splice(i, 1);
  else saved.push(deals.find((d) => d.id === id));
  save();
  render();
});

for (const id of ['q', 'store', 'sort']) $(id).addEventListener('input', render);
for (const t of ['all', 'list']) {
  $('tab-' + t).addEventListener('click', () => {
    tab = t;
    $('tab-all').classList.toggle('on', t === 'all');
    $('tab-list').classList.toggle('on', t === 'list');
    render();
  });
}

async function init() {
  save();
  $('status').textContent = 'Pobieram promocje…';
  try {
    const data = await (await fetch('/api/deals')).json();
    deals = data.deals;
    const stores = [...new Set(deals.map((d) => d.store))].sort();
    $('store').insertAdjacentHTML('beforeend', stores.map((s) => `<option>${esc(s)}</option>`).join(''));
    if (data.errors.length) {
      $('warn').hidden = false;
      $('warn').textContent = 'Nie udało się pobrać: ' + data.errors.map((e) => e.store).join(', ') + '.';
      console.warn('Błędy źródeł:', data.errors);
    }
    render();
    if (data.errors.length && !deals.length)
      $('status').textContent = 'Nie udało się pobrać promocji: ' + data.errors.map((e) => `${e.store} (${e.error})`).join('; ');
  } catch {
    $('status').textContent = 'Brak połączenia z serwerem.';
  }
}
init();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
