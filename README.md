# Open KJ - Karaoke Song Request System

A complete PWA + Cloudflare Worker API for karaoke song requests.

## 🔧 Project Structure

```
/vercel/sandbox/
├── worker.js          # Cloudflare Worker API (backend)
├── schema.sql         # D1 database schema
├── seed.sql           # Sample karaoke songs (50+ popular hits)
├── wrangler.toml      # Cloudflare configuration
└── pwa/
    ├── index.html     # PWA frontend
    ├── style.css      # Mobile-first styling
    ├── manifest.json  # PWA install manifest
    └── sw.js          # Service worker for offline
```

## 🚀 Setup & Deployment

### Prerequisites
- Cloudflare account
- Cloudflare API token with D1 permissions
- wrangler CLI installed (`npm install -g wrangler`)

### 1. Set Environment Variable
```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
```

### 2. Initialize Database
```bash
# Create tables
wrangler d1 execute supatraxx_karaoke_db --file=schema.sql --remote

# Add sample songs
wrangler d1 execute supatraxx_karaoke_db --file=seed.sql --remote
```

### 3. Deploy Worker
```bash
wrangler deploy
```

## 📱 PWA Features

- **Song Search**: Real-time search by title/artist
- **Key Change**: -3 to +3 semitones with visual buttons
- **Favourites**: Save songs for quick access
- **Queue Display**: Shows position, singer, and key change
- **30s Auto-refresh**: Perfect for Open KJ polling
- **Mobile Optimized**: Touch-friendly, responsive design

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/songs/search?q=` | GET | Search songs |
| `/api/songs/request` | POST | Submit song request |
| `/api/songs/queue` | GET | Get pending requests |
| `/api/songs/favourite` | POST | Save to favourites |
| `/api/songs/favourites` | GET | Get user favourites |
| `/api/open-kj/receive` | POST | Legacy Open KJ endpoint |
| `/api/open-kj/data` | GET | Legacy Open KJ data |

## 🎯 Open KJ Configuration

- **URL**: `https://supatraxx-api.oriondevcore.com/api`
- **API Key**: (empty)
- **System ID**: 1
- **Interval**: 30 seconds

## 🎤 Using the PWA

1. Open `https://supatraxx-api.oriondevcore.com` on your phone
2. Search for a song
3. Tap a song to select it
4. Choose key change (-3 to +3)
5. Enter your name
6. Tap "REQUEST SONG"
7. Your song appears in the queue!

---

Built with ❤️ for karaoke hosts everywhere!