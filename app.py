from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__, static_folder='static')

# Database setup for local SQLite
DATABASE = '/vercel/sandbox/karaoke.db'

def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with schema and sample data."""
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        with open('/vercel/sandbox/schema.sql', 'r') as f:
            conn.executescript(f.read())
        # Add sample songs
        cursor = conn.cursor()
        sample_songs = [
            ('1', 'Livin\' on a Prayer', 'Bon Jovi', 1986),
            ('2', 'Don\'t Stop Believin\'', 'Journey', 1981),
            ('3', 'Sweet Caroline', 'Neil Diamond', 1969),
            ('4', 'Wannabe', ' Spice Girls', 1996),
            ('5', 'I Wanna Dance with Somebody', 'Whitney Houston', 1987),
            ('6', 'Summer of \'69', 'Bryan Adams', 1984),
            ('7', 'Billie Jean', 'Michael Jackson', 1982),
            ('8', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 2014),
            ('9', 'Shake It Off', 'Taylor Swift', 2014),
            ('10', 'Country Roads', 'John Denver', 1971),
            ('11', 'Sweet Home Alabama', 'Lynyrd Skynyrd', 1974),
            ('12', 'Proud Mary', 'CCR', 1968),
            ('13', 'Brown Eyed Girl', 'Van Morrison', 1967),
            ('14', 'Bad Moon Rising', 'CCR', 1969),
            ('15', 'Hotel California', 'Eagles', 1976),
        ]
        for song in sample_songs:
            cursor.execute("INSERT OR IGNORE INTO songs (id, title, artist, duration) VALUES (?, ?, ?, ?)", song)
        conn.commit()
        conn.close()

# In-memory storage for demonstration
open_kj_data = []

@app.route('/')
def index():
    return render_template('index.html')

# Serve static files
@app.route('/style.css')
def styles():
    return app.send_static_file('style.css')

@app.route('/manifest.json')
def manifest():
    return jsonify({
        "name": "Open KJ - Karaoke Request",
        "short_name": "KJ",
        "description": "Request songs at karaoke night!",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#1a1a2e",
        "theme_color": "#00bcd4",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"}
        ]
    })

@app.route('/sw.js')
def service_worker():
    return '''
self.addEventListener('install', event => {
  event.waitUntil(caches.open('open-kj-v1').then(cache => cache.addAll(['/', '/manifest.json', '/sw.js', '/style.css'])));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) { event.respondWith(fetch(event.request)); return; }
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
'''

# === Karaoke Song API Endpoints ===

@app.route('/api/songs/search', methods=['GET'])
def search_songs():
    """Search songs by title or artist."""
    query = request.args.get('q', '')
    if len(query) < 2:
        return jsonify({'status': 'success', 'songs': []})
    
    try:
        conn = get_db()
        cursor = conn.execute(
            "SELECT id, title, artist FROM songs WHERE title LIKE ? OR artist LIKE ? LIMIT 50",
            (f'%{query}%', f'%{query}%')
        )
        songs = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'status': 'success', 'songs': songs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/songs/request', methods=['POST'])
def request_song():
    """Submit a song request."""
    try:
        data = request.get_json()
        conn = get_db()
        conn.execute(
            "INSERT INTO song_requests (song_id, title, artist, singer, key_change, status, requested_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data.get('song_id'), data['title'], data['artist'], data.get('singer', 'Anonymous'), data.get('key_change', 0), 'pending', 'now')
        )
        conn.commit()
        conn.close()
        return jsonify({'status': 'success', 'message': 'Song requested!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/songs/queue', methods=['GET'])
def get_queue():
    """Get the current song queue."""
    try:
        conn = get_db()
        cursor = conn.execute("SELECT * FROM song_requests WHERE status = 'pending' ORDER BY requested_at ASC")
        queue = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'status': 'success', 'queue': queue})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/songs/favourite', methods=['POST'])
def favourite_song():
    """Save a song to favourites."""
    try:
        data = request.get_json()
        conn = get_db()
        conn.execute(
            "INSERT OR IGNORE INTO favourites (song_id, title, artist, user_id) VALUES (?, ?, ?, ?)",
            (data.get('song_id'), data['title'], data['artist'], data.get('user_id', 'default'))
        )
        conn.commit()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/songs/favourites', methods=['GET'])
def get_favourites():
    """Get user favourites."""
    try:
        user_id = request.args.get('user_id', 'default')
        conn = get_db()
        cursor = conn.execute("SELECT * FROM favourites WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        favourites = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'status': 'success', 'favourites': favourites})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# === Legacy Open KJ API Endpoints ===

@app.route('/api/open-kj/receive', methods=['POST'])
def receive_data():
    """
    Receive data from Cloudflare D1 database.
    Expects JSON payload with data to process.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        processed = {
            'id': data.get('id'),
            'type': data.get('type', 'unknown'),
            'payload': data.get('payload'),
            'timestamp': data.get('timestamp'),
            'source': 'cloudflare-d1'
        }
        
        open_kj_data.append(processed)
        
        return jsonify({
            'status': 'success',
            'message': 'Data received successfully',
            'data': processed
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/open-kj/data', methods=['GET'])
def get_data():
    """Return all stored Open KJ data."""
    return jsonify({
        'status': 'success',
        'count': len(open_kj_data),
        'data': open_kj_data
    }), 200

@app.route('/api/open-kj/data/<item_id>', methods=['GET'])
def get_item(item_id):
    """Return a specific item by ID."""
    for item in open_kj_data:
        if item.get('id') == item_id:
            return jsonify({'status': 'success', 'data': item}), 200
    
    return jsonify({'error': 'Item not found'}), 404

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)