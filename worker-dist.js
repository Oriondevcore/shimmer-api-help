------formdata-undici-005995934336
Content-Disposition: form-data; name="metadata"

{"main_module":"worker.js","bindings":[{"name":"DB","type":"d1","id":"58be4e00-fcc2-4a05-843c-3f7870868210"}],"compatibility_date":"2024-05-19","compatibility_flags":[]}
------formdata-undici-005995934336
Content-Disposition: form-data; name="worker.js"; filename="worker.js"
Content-Type: application/javascript+module

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (path === "/api/health") {
      return new Response(JSON.stringify({ status: "healthy" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (path === "/api/open-kj/receive" && request.method === "POST") {
      try {
        const data = await request.json();
        const stmt = env.DB.prepare(
          "INSERT INTO open_kj_data (id, type, payload, timestamp, source) VALUES (?, ?, ?, ?, ?)"
        ).bind(
          data.id || null,
          data.type || "unknown",
          JSON.stringify(data.payload || {}),
          data.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
          "cloudflare-d1"
        );
        await stmt.run();
        return new Response(JSON.stringify({
          status: "success",
          message: "Data received successfully",
          data: { ...data, source: "cloudflare-d1" }
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }
    if (path === "/api/open-kj/data" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM open_kj_data ORDER BY timestamp DESC"
        ).all();
        return new Response(JSON.stringify({
          status: "success",
          count: results.length,
          data: results
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }
    if (path.startsWith("/api/open-kj/data/") && request.method === "GET") {
      const id = path.split("/")[3];
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM open_kj_data WHERE id = ?"
        ).bind(id).all();
        if (results.length === 0) {
          return new Response(JSON.stringify({ error: "Item not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
        return new Response(JSON.stringify({ status: "success", data: results[0] }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }
    if (path === "/" || path === "/index.html") {
      return new Response(await getPWAManifest(), {
        headers: { "Content-Type": "text/html", ...corsHeaders }
      });
    }
    if (path === "/manifest.json") {
      return new Response(JSON.stringify(pwaManifest), {
        headers: { "Content-Type": "application/manifest+json", ...corsHeaders }
      });
    }
    if (path === "/sw.js") {
      return new Response(pwaServiceWorker, {
        headers: { "Content-Type": "application/javascript", ...corsHeaders }
      });
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};
var pwaManifest = {
  name: "Open KJ",
  short_name: "KJ",
  description: "Open Karaoke Journal - PWA for Karaoke Data",
  start_url: "/",
  display: "standalone",
  background_color: "#1a1a2e",
  theme_color: "#00bcd4",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
  ]
};
var pwaServiceWorker = `
self.addEventListener('install', event => {
  event.waitUntil(caches.open('kj-cache-v1').then(cache => {
    return cache.addAll(['/', '/manifest.json', '/sw.js']);
  }));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => {
    return response || fetch(event.request);
  }));
});
`;
async function getPWAManifest() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open KJ - Karaoke Journal</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#00bcd4">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; min-height: 100vh; 
           background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
           color: #fff; padding: 20px; }
    main { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #00bcd4; }
    .data-item { background: rgba(255,255,255,0.1); padding: 15px; 
                 border-radius: 8px; margin-bottom: 10px; }
    button { background: #00bcd4; color: #fff; border: none; 
             padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    input, textarea { width: 100%; padding: 10px; margin: 5px 0; 
                      background: rgba(255,255,255,0.1); border: 1px solid #00bcd4;
                      color: #fff; border-radius: 4px; }
  </style>
</head>
<body>
  <main>
    <h1>\u{1F3A4} Open KJ - Karaoke Journal</h1>
    <div id="app">
      <h2>Add Entry</h2>
      <input id="item-id" placeholder="ID (optional)">
      <input id="item-type" placeholder="Type">
      <textarea id="item-payload" rows="3" placeholder="Payload (JSON)"></textarea>
      <button onclick="addData()">Add Data</button>
      <h2 style="margin-top: 20px;">Data List</h2>
      <div id="data-list"></div>
    </div>
  </main>
  <script>
    async function addData() {
      const payload = {
        id: document.getElementById('item-id').value || undefined,
        type: document.getElementById('item-type').value,
        payload: JSON.parse(document.getElementById('item-payload').value || '{}')
      };
      await fetch('/api/open-kj/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      loadData();
    }
    async function loadData() {
      const res = await fetch('/api/open-kj/data');
      const data = await res.json();
      const html = data.data.map(item => 
        '<div class="data-item"><strong>' + item.id + '</strong> (' + item.type + ')</div>'
      ).join('');
      document.getElementById('data-list').innerHTML = html || '<p>No data yet</p>';
    }
    loadData();
  <\/script>
</body>
</html>`;
}
__name(getPWAManifest, "getPWAManifest");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map

------formdata-undici-005995934336--
