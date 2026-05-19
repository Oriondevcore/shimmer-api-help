// Cloudflare Worker for Open KJ API
// Karaoke Song Request System

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (path === '/api/health') {
      return new Response(JSON.stringify({ status: 'healthy' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // === KARAOKE SONG API ===

    // Search songs
    if (path === '/api/songs/search' && request.method === 'GET') {
      const query = url.searchParams.get('q') || '';
      try {
        const { results } = await env.DB.prepare(
          'SELECT id, title, artist FROM songs WHERE title LIKE ? OR artist LIKE ? LIMIT 50'
        ).bind(`%${query}%`, `%${query}%`).all();
        
        return new Response(JSON.stringify({ status: 'success', songs: results }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Request a song
    if (path === '/api/songs/request' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        const stmt = env.DB.prepare(
          'INSERT INTO song_requests (song_id, title, artist, singer, key_change, status, requested_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          data.song_id || null,
          data.title,
          data.artist,
          data.singer || 'Anonymous',
          data.key_change || 0,
          'pending',
          new Date().toISOString()
        );
        
        await stmt.run();
        
        return new Response(JSON.stringify({
          status: 'success',
          message: 'Song requested!'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Get song queue
    if (path === '/api/songs/queue' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT * FROM song_requests WHERE status = "pending" ORDER BY requested_at ASC'
        ).all();
        
        return new Response(JSON.stringify({ status: 'success', queue: results }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Save to favourites
    if (path === '/api/songs/favourite' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        const stmt = env.DB.prepare(
          'INSERT OR IGNORE INTO favourites (song_id, title, artist, user_id) VALUES (?, ?, ?, ?)'
        ).bind(
          data.song_id,
          data.title,
          data.artist,
          data.user_id || 'default'
        );
        
        await stmt.run();
        
        return new Response(JSON.stringify({ status: 'success' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Get favourites
    if (path === '/api/songs/favourites' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT * FROM favourites WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(url.searchParams.get('user_id') || 'default').all();
        
        return new Response(JSON.stringify({ status: 'success', favourites: results }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // === LEGACY API (for backwards compatibility) ===

    if (path === '/api/open-kj/receive' && request.method === 'POST') {
      try {
        const data = await request.json();
        const stmt = env.DB.prepare(
          'INSERT INTO open_kj_data (id, type, payload, timestamp, source) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          data.id || null,
          data.type || 'unknown',
          JSON.stringify(data.payload || {}),
          data.timestamp || new Date().toISOString(),
          'cloudflare-d1'
        );
        await stmt.run();
        
        return new Response(JSON.stringify({
          status: 'success',
          message: 'Data received successfully',
          data: { ...data, source: 'cloudflare-d1' }
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    if (path === '/api/open-kj/data' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT * FROM open_kj_data ORDER BY timestamp DESC'
        ).all();
        
        return new Response(JSON.stringify({
          status: 'success',
          count: results.length,
          data: results
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Serve PWA frontend
    if (path === '/' || path === '/index.html') {
      return new Response(getPWAHTML(), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    // Serve static files
    if (path === '/manifest.json') {
      return new Response(JSON.stringify(pwaManifest), {
        headers: { 'Content-Type': 'application/manifest+json', ...corsHeaders },
      });
    }

    if (path === '/style.css') {
      return new Response(pwaStyles, {
        headers: { 'Content-Type': 'text/css', ...corsHeaders },
      });
    }

    if (path === '/sw.js') {
      return new Response(pwaServiceWorker, {
        headers: { 'Content-Type': 'application/javascript', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// PWA Styles
const pwaStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 20px;
}
main { max-width: 800px; margin: 0 auto; }
h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #00bcd4; text-align: center; }
.card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; }
.card h2 { color: #00bcd4; margin-bottom: 15px; font-size: 1.3rem; }
input, textarea { width: 100%; padding: 12px; margin: 8px 0; background: rgba(255,255,255,0.1); border: 1px solid #00bcd4; color: #fff; border-radius: 6px; font-family: inherit; }
input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.6); }
button { background: #00bcd4; color: #fff; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: 600; margin: 3px; transition: background 0.2s; }
button:hover { background: #0097a7; }
button.primary { background: #4caf50; width: 100%; padding: 15px; font-size: 1.1rem; }
button.primary:hover { background: #388e3c; }
.key-btn { background: rgba(255,255,255,0.2); padding: 8px 12px; }
.key-btn.active { background: #00bcd4; }
.song-item { padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; margin: 5px 0; cursor: pointer; }
.song-item:hover { background: rgba(0,188,212,0.3); }
.song-item span { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
.queue-item { padding: 12px; background: rgba(76,175,80,0.2); border-radius: 6px; margin: 5px 0; border-left: 3px solid #4caf50; }
.queue-num { background: #00bcd4; color: #fff; padding: 2px 10px; border-radius: 10px; margin-right: 10px; font-weight: bold; }
.meta { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 5px; }
`;

// PWA Manifest
const pwaManifest = {
  name: 'Open KJ - Karaoke Request',
  short_name: 'KJ',
  description: 'Request songs at karaoke night!',
  start_url: '/',
  display: 'standalone',
  background_color: '#1a1a2e',
  theme_color: '#00bcd4',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
  ]
};

// Service Worker
const pwaServiceWorker = `
self.addEventListener('install', event => {
  event.waitUntil(caches.open('open-kj-v1').then(cache => cache.addAll(['/', '/manifest.json', '/sw.js', '/style.css'])));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) { event.respondWith(fetch(event.request)); return; }
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
`;

// PWA HTML for the karaoke request system
function getPWAHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎤 Open KJ - Song Request</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#00bcd4">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main>
    <h1>🎤 Open KJ</h1>
    <p style="text-align:center;opacity:0.8">Karaoke Song Request</p>
    
    <div id="app">
      <section class="card">
        <h2>🎵 Request a Song</h2>
        
        <label for="song-search">Search Songs:</label>
        <input type="text" id="song-search" placeholder="Type song or artist name..." onkeyup="searchSongs()">
        
        <div id="search-results"></div>
        
        <div id="selected-song" style="display:none;margin-top:15px;padding:15px;background:rgba(0,188,212,0.2);border-radius:8px;">
          <strong>Selected:</strong> <span id="song-title"></span>
          <button onclick="cancelSelection()" style="float:right;background:#666">✕</button>
        </div>
        
        <div id="key-change-section" style="display:none;margin-top:15px">
          <label>Key Change:</label>
          <div style="display:flex;gap:5px;margin:5px 0">
            <button onclick="setKey(-3)" class="key-btn">-3</button>
            <button onclick="setKey(-2)" class="key-btn">-2</button>
            <button onclick="setKey(-1)" class="key-btn">-1</button>
            <button onclick="setKey(0)" class="key-btn active">0</button>
            <button onclick="setKey(1)" class="key-btn">+1</button>
            <button onclick="setKey(2)" class="key-btn">+2</button>
            <button onclick="setKey(3)" class="key-btn">+3</button>
          </div>
        </div>
        
        <input type="text" id="singer-name" placeholder="Your Name" style="margin-top:10px">
        
        <button onclick="submitRequest()" id="request-btn" class="primary" style="width:100%;margin-top:15px;display:none">
          🎵 REQUEST SONG
        </button>
        
        <button onclick="toggleFavourite()" id="favourite-btn" style="width:100%;margin-top:10px;background:#ffd700;color:#333">
          ⭐ Save to Favourites
        </button>
      </section>
      
      <section class="card">
        <h2>📋 Queue</h2>
        <div id="queue"></div>
      </section>
    </div>
  </main>
  
  <script>
    const API_BASE = '';
    let selectedSong = null;
    let keyChange = 0;
    
    async function searchSongs() {
      const query = document.getElementById('song-search').value;
      if (query.length < 2) { document.getElementById('search-results').innerHTML = ''; return; }
      try {
        const res = await fetch(API_BASE + '/api/songs/search?q=' + encodeURIComponent(query));
        const data = await res.json();
        const html = data.songs.map(song => 
          '<div class="song-item" onclick="selectSong(\\'' + song.id + '\\', \\'' + song.title.replace(/'/g, "\\'") + '\\', \\'' + song.artist.replace(/'/g, "\\'") + '\\')">' +
          '<strong>' + song.title + '</strong> <span>by ' + song.artist + '</span></div>'
        ).join('') || '<p>No songs found</p>';
        document.getElementById('search-results').innerHTML = html;
      } catch (e) { document.getElementById('search-results').innerHTML = '<p>Search error</p>'; }
    }
    
    function selectSong(id, title, artist) {
      selectedSong = { id, title, artist };
      document.getElementById('song-title').textContent = title + ' - ' + artist;
      document.getElementById('selected-song').style.display = 'block';
      document.getElementById('key-change-section').style.display = 'block';
      document.getElementById('request-btn').style.display = 'block';
      document.getElementById('search-results').innerHTML = '';
      document.getElementById('song-search').value = '';
    }
    
    function setKey(val) {
      keyChange = val;
      document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
    }
    
    function cancelSelection() {
      selectedSong = null; keyChange = 0;
      document.getElementById('selected-song').style.display = 'none';
      document.getElementById('request-btn').style.display = 'none';
      document.getElementById('key-change-section').style.display = 'none';
    }
    
    async function submitRequest() {
      if (!selectedSong) return;
      const singer = document.getElementById('singer-name').value || 'Anonymous';
      try {
        await fetch(API_BASE + '/api/songs/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            song_id: selectedSong.id,
            title: selectedSong.title,
            artist: selectedSong.artist,
            singer: singer,
            key_change: keyChange
          })
        });
        cancelSelection();
        document.getElementById('singer-name').value = '';
        loadQueue();
        alert('Song requested! 🎤');
      } catch (e) { alert('Error: ' + e.message); }
    }
    
    async function loadQueue() {
      try {
        const res = await fetch(API_BASE + '/api/songs/queue');
        const data = await res.json();
        const html = data.queue.map((item, i) => 
          '<div class="queue-item">' +
          '<span class="queue-num">' + (i+1) + '</span>' +
          '<div><strong>' + item.title + '</strong> <span>by ' + item.artist + '</span></div>' +
          '<div class="meta">' + item.singer + ' • Key: ' + (item.key_change || 0) + '</div>' +
          '</div>'
        ).join('') || '<p>No songs in queue</p>';
        document.getElementById('queue').innerHTML = html;
      } catch (e) { document.getElementById('queue').innerHTML = '<p>Error loading queue</p>'; }
    }
    
    function toggleFavourite() {
      if (!selectedSong) { alert('Please select a song first!'); return; }
      fetch(API_BASE + '/api/songs/favourite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song_id: selectedSong.id,
          title: selectedSong.title,
          artist: selectedSong.artist
        })
      }).then(() => alert('Saved to favourites! ⭐'));
    }
    
    loadQueue();
    setInterval(loadQueue, 30000);
  </script>
</body>
</html>`;