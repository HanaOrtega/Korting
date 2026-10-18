// Most między providerami a ukrytym WebView (components/WebViewHost.js).
// Provider prosi o załadowanie strony i dostaje treści odpowiedzi sieciowych pasujących do `match`.
let host = null;

export function registerWebViewHost(fn) {
  host = fn;
  return () => { if (host === fn) host = null; };
}

export function runWebViewTask(task) {
  if (!host) return Promise.reject(new Error('WebView nie jest gotowy'));
  return host(task);
}
