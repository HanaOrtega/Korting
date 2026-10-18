import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { providers } from './providers/index.js';

const PUBLIC = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const TTL = 60 * 60 * 1000; // odświeżaj co godzinę
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
};

let cache = { at: 0, deals: [], errors: [] };
let inflight = null;

async function refresh() {
  const results = await Promise.allSettled(providers.map((p) => p.fetch()));
  const deals = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') deals.push(...r.value);
    else errors.push({ store: providers[i].name, error: String(r.reason?.message ?? r.reason) });
  });
  const now = Date.now();
  cache = {
    at: now,
    errors,
    deals: deals.filter((d) => !d.validUntil || Date.parse(d.validUntil) >= now),
  };
}

async function getDeals() {
  if (Date.now() - cache.at > TTL) inflight ??= refresh().finally(() => (inflight = null));
  if (inflight && !cache.at) await inflight;
  return cache;
}

http
  .createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    try {
      if (pathname === '/api/deals') {
        const data = await getDeals();
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify(data));
      }
      const rel = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^(\.\.[/\\])+/, '');
      const file = await readFile(join(PUBLIC, rel));
      res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' });
      res.end(file);
    } catch {
      res.writeHead(404).end('Not found');
    }
  })
  .listen(process.env.PORT ?? 3000, () =>
    console.log(`Korting działa: http://localhost:${process.env.PORT ?? 3000}`));
