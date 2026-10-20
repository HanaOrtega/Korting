// Klient Google Drive (REST v3) – tylko to, czego potrzebuje lista: jeden plik + uprawnienia do niego.
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

export class DriveError extends Error {
  constructor(code, message, status) { super(message); this.code = code; this.status = status; }
}

/** getToken(force?) → access token; doFetch – do testów. */
export function createDrive(getToken, doFetch = (...a) => fetch(...a)) {
  async function call(url, init = {}, retried = false) {
    let res;
    try {
      res = await doFetch(url, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${await getToken(retried)}` } });
    } catch (e) {
      throw new DriveError('NETWORK', String(e?.message ?? e));
    }
    if (res.status === 401 && !retried) return call(url, init, true); // token mógł wygasnąć – odśwież i powtórz raz
    if (res.ok) return res;
    let reason = '';
    try { reason = (await res.json())?.error?.errors?.[0]?.reason ?? ''; } catch { /* brak treści */ }
    if (res.status === 404) throw new DriveError('NO_ACCESS', 'plik nie istnieje albo nie jest udostępniony tej osobie', 404);
    if (res.status === 401) throw new DriveError('AUTH', 'logowanie wygasło', 401);
    if (res.status === 429 || /rateLimit|userRateLimit|quota/i.test(reason)) throw new DriveError('RATE', 'limit zapytań Dysku Google', res.status);
    if (res.status === 403) throw new DriveError(reason === 'insufficientFilePermissions' ? 'READ_ONLY' : 'FORBIDDEN', reason || 'brak uprawnień', 403);
    throw new DriveError('HTTP', `HTTP ${res.status} ${reason}`, res.status);
  }
  const json = async (url, init) => (await call(url, init)).json();

  return {
    /** Wersja pliku rośnie przy każdym zapisie – tanie zapytanie do wykrywania zmian. */
    async meta(fileId) {
      const m = await json(`${API}/files/${fileId}?fields=version,modifiedTime,trashed&supportsAllDrives=false`);
      if (m.trashed) throw new DriveError('GONE', 'plik grupy został usunięty', 404);
      return { version: String(m.version), modifiedTime: m.modifiedTime };
    },
    async download(fileId) { return (await call(`${API}/files/${fileId}?alt=media`)).text(); },
    async upload(fileId, text) {
      const m = await json(`${UPLOAD}/files/${fileId}?uploadType=media&fields=version`, { method: 'PATCH', headers: { 'Content-Type': 'text/plain; charset=UTF-8' }, body: text });
      return String(m.version);
    },
    async create(name, text) {
      const boundary = `korting${Math.random().toString(36).slice(2)}`;
      const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, mimeType: 'text/plain' })}\r\n`
        + `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${text}\r\n--${boundary}--`;
      const m = await json(`${UPLOAD}/files?uploadType=multipart&fields=id,version`, { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
      return { fileId: m.id, version: String(m.version) };
    },
    async remove(fileId) { await call(`${API}/files/${fileId}`, { method: 'DELETE' }); },
    async permissions(fileId) {
      const m = await json(`${API}/files/${fileId}/permissions?fields=permissions(id,type,role,emailAddress,displayName)`);
      return (m.permissions ?? []).filter((p) => p.type === 'user');
    },
    /** Udostępnia plik osobie (rola: edytor); Google wyśle jej e-mail z powiadomieniem. */
    async share(fileId, email, message) {
      const q = `sendNotificationEmail=true&emailMessage=${encodeURIComponent(message ?? '')}`;
      return json(`${API}/files/${fileId}/permissions?${q}&fields=id,emailAddress`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', role: 'writer', emailAddress: email }),
      });
    },
    async unshare(fileId, permissionId) { await call(`${API}/files/${fileId}/permissions/${permissionId}`, { method: 'DELETE' }); },
  };
}
