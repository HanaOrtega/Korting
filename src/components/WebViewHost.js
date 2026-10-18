import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { registerWebViewHost } from '../webview.js';

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

// Podsłuchuje XHR i fetch na stronie i odsyła treść odpowiedzi, których adres zawiera `match`.
const hook = (match) => `(function(){
  var M=${JSON.stringify(match)};
  function send(u,t){try{window.ReactNativeWebView.postMessage(JSON.stringify({u:u,t:t}))}catch(e){}}
  var oo=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,u){this.__u=u;return oo.apply(this,arguments)};
  var os=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send=function(){var x=this;
    x.addEventListener('load',function(){if(String(x.__u).indexOf(M)>-1)send(x.__u,x.responseText)});
    return os.apply(this,arguments)};
  var of=window.fetch;
  if(of)window.fetch=function(){var a=arguments;return of.apply(this,a).then(function(r){
    try{var u=typeof a[0]==='string'?a[0]:a[0].url;
      if(u.indexOf(M)>-1)r.clone().text().then(function(t){send(u,t)})}catch(e){}
    return r})};
})();true;`;

/** Niewidoczny WebView, który wykonuje zadania z runWebViewTask po kolei. */
export default function WebViewHost() {
  const [task, setTask] = useState(null);
  const queue = useRef([]);
  const current = useRef(null);
  const bodies = useRef([]);

  const finish = useCallback(() => {
    const cur = current.current;
    if (!cur) return;
    clearTimeout(cur.timer);
    clearTimeout(cur.idle);
    current.current = null;
    setTask(null);
    cur.resolve(bodies.current);
    bodies.current = [];
    setTimeout(pump.current, 0);
  }, []);

  const pump = useRef(() => {});
  pump.current = () => {
    if (current.current || !queue.current.length) return;
    const t = queue.current.shift();
    bodies.current = [];
    current.current = { ...t, timer: setTimeout(finish, t.timeoutMs ?? 30000), idle: null };
    setTask({ url: t.url, match: t.match, key: String(Date.now()) });
  };

  useEffect(() => registerWebViewHost((t) => new Promise((resolve, reject) => {
    queue.current.push({ ...t, resolve, reject });
    pump.current();
  })), []);

  const onMessage = (e) => {
    const cur = current.current;
    if (!cur) return;
    try { bodies.current.push(JSON.parse(e.nativeEvent.data).t); } catch { return; }
    clearTimeout(cur.idle); // kończymy, gdy przez chwilę nie ma kolejnych odpowiedzi
    cur.idle = setTimeout(finish, 4000);
  };

  if (!task) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}>
      <WebView
        key={task.key}
        source={{ uri: task.url }}
        userAgent={MOBILE_UA}
        injectedJavaScriptBeforeContentLoaded={hook(task.match)}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        originWhitelist={['*']}
      />
    </View>
  );
}
