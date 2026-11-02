<div align="center">

# 🍿 NetMirror Plus (MovieBox Web)

**High-Performance In-Browser Cinema Streaming Platform, 24/7 Live Sports Hub & OTT Aggregator**

[![Rust](https://img.shields.io/badge/rust-2024%20edition-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![Axum](https://img.shields.io/badge/axum-0.8-blue.svg)](https://github.com/tokio-rs/axum)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f13b6aec-1061-4d39-bf41-f5f9c871096c/deploy-status)](https://app.netlify.com/projects/netmirror-plus/deploys)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/fsferdows/NetMirror-Plus)

---

### 🌐 Live Production URL
**[https://netmirror-plus.netlify.app](https://netmirror-plus.netlify.app)**

---

</div>

## 📖 Overview

**NetMirror Plus** is a cinema-grade, full-stack web streaming application and OTT aggregator built with a high-performance **Rust (Axum + Tokio)** backend, serverless Netlify Functions, and a glassmorphism dark-cinema UI.

It provides instantaneous in-browser video playback with multi-resolution scaling, multi-audio language switching, live subtitles, a dedicated **24/7 Live Sports Streaming Section** (Football, Cricket, F1, Combat, etc.), and complete catalog aggregation for over 15 major OTT platforms and studio universes with an intelligent deduplication engine.

---

## 👨‍💻 Developer Details

<div align="center">

| Detail | Information |
| :--- | :--- |
| **Developer Name** | **FS FERDOWS** |
| **GitHub Profile** | [@fsferdows](https://github.com/fsferdows) |
| **Project Repository** | [fsferdows/NetMirror-Plus](https://github.com/fsferdows/NetMirror-Plus) |
| **Contact Email** | [fsferdows@icloud.com](mailto:fsferdows@icloud.com) |
| **Role** | Lead System Architect & Full-Stack Developer |
| **Core Contributions** | High-performance Rust backend, HLS live sports proxy engine, client-side & server-side catalog deduplication, cinema video player, responsive mobile design |

</div>

---

## 🌟 Key Features

### ⚽ 1. 24/7 Live Sports Streaming Hub
- **Cricket Broadcasting**: Direct high-speed streams for **Sky Sports Cricket FHD**, **Willow Cricket HD**, **Fox Cricket 501**, and **Astro Cricket**.
- **Football & Global Sports**: Stream live football matches (Premier League, UEFA Champions League, La Liga, Serie A, Bundesliga) across **Sky Sports Premier League**, **TNT Sports**, **beIN Sports**, and more.
- **Zero-Ad & Zero-Tracker Clean HLS Player**: Custom-built HTML5 + `Hls.js` adaptive bitrate player that extracts direct `.m3u8` feeds on the server, completely bypassing third-party ad scripts, malicious popups, and anti-embed sandboxes.
- **Match Center & Fixtures**: Real-time listing of over 900+ global sports matches, team logos, tournament badges, country flags, and live status indicators.

### 🎬 2. Cinema Web Video Player
- **Native In-Browser Streaming**: Smooth video playback with zero external desktop player prerequisites.
- **Multi-Resolution Selector**: Stream in `1080p FHD`, `720p HD`, `480p`, and `360p`.
- **Audio Dubs & Subtitles**: Dynamic multi-audio selection (Hindi, Tamil, Telugu, English, Malayalam, Bengali, etc.) and real-time WebVTT subtitle track extraction.
- **Universal Multi-Server Cloud Fallback**: Integrated cloud mirrors (VidSrc Cloud, VidSrc Pro, MultiEmbed VIP, 2Embed Cinema, VidLink Stream) for 100% uptime with zero dead links.
- **Controls & Shortcuts**: Playback speed adjustment (`0.5x` to `2.0x`), Picture-in-Picture (PiP), theater mode, and TV show auto-next episode triggers.

### 🌐 3. 15+ OTT Streaming Platforms & Studio Universes
- **Originals & Exclusives**:
  - **Netflix Originals** (2,270+ titles)
  - **Prime Video Exclusives** (900+ titles)
  - **Disney+ Hotstar** (210+ titles)
  - **Apple TV+ Originals** (260+ titles)
  - **Hulu Exclusives** (250+ titles)
  - **Zee5 Blockbusters** (240+ titles)
  - **Viu Asian Dramas** (220+ titles)
  - **Vivamax Filipino Cinema** (100+ titles)
  - **Hoichoi Bengali Cinema**
- **Studio Universes**:
  - **Marvel Cinematic Universe (MCU)**
  - **DC Studios Universe**
  - **Anime [English Dubbed]** (One Piece, Jujutsu Kaisen, Demon Slayer, etc.)
  - **Korean K-Drama**
  - **Bollywood Blockbusters**
  - **Hollywood Hits**
  - **Top All-Time Box Office**

### 🛡️ 4. Intelligent Deduplication Engine
- Deep multi-page fetching (60+ items per category) coupled with canonical title sanitization.
- Automatically purges redundant audio-dub duplicates (`[Hindi]`, `[Tamil]`, `[Telugu]`, `[English]`, `[Malayalam]`) and season duplicate cards (`S1-S2`, `S1`, `Season 1`).
- Ensures every movie and series card on the Home Page and Platform rails is 100% unique and cleanly formatted.

### 📱 5. Responsive UI/UX Across All Devices
- **Mobile Bottom Navigation Bar**: Floating, touch-optimized bottom bar for instant access to Home, Movies, TV Series, Live Sports (with pulsating live LED badge), and Platforms.
- **Mobile Platform Sheet**: Interactive slide-up drawer for quickly filtering across all 15 OTT platforms on phones and tablets.
- **Swipeable Categories**: Inertial horizontal scrolling for sports and genre filters.
- **Adaptive Layout**: Fluid CSS Grid and Flexbox layouts designed for iPhone SE, modern Android smartphones, iPads/tablets, and 4K ultra-wide monitors.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Rust](https://rustup.rs/) (version 1.85 or later)
- [Node.js](https://nodejs.org/) (optional, for Netlify local CLI)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/fsferdows/NetMirror-Plus.git
cd NetMirror-Plus

# 2. Run with the automated start script
./start.sh
```

Or run directly via Cargo:

```bash
cargo run --release --bin moviebox_web -- --port 3000
```

Open **`http://localhost:3000`** in your browser.

---

## 🐳 Docker Deployment

You can run NetMirror Plus in a container on any cloud VPS, server, or local Docker daemon:

```bash
# Build Docker image
docker build -t netmirror-plus .

# Run container on port 3000
docker run -d -p 3000:3000 --name netmirror --restart unless-stopped netmirror-plus
```

Visit `http://localhost:3000`.

---

## ☁️ Cloud Deployment Options

### Option A: Netlify (Serverless)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod --dir=web --functions=netlify/functions
```

### Option B: Render.com
1. Fork or push this repository to GitHub: `https://github.com/fsferdows/NetMirror-Plus`.
2. Go to [Render Dashboard](https://dashboard.render.com/) > **New +** > **Web Service**.
3. Select `NetMirror-Plus`.
4. Render automatically detects the [`render.yaml`](file:///Users/user/Desktop/Moviebox/render.yaml) blueprint and [`Dockerfile`](file:///Users/user/Desktop/Moviebox/Dockerfile).
5. Click **Deploy Web Service**.

### Option C: Railway.app
1. Navigate to [Railway.app](https://railway.app/).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select `fsferdows/NetMirror-Plus`.
4. Railway builds the production binary and assigns an automatic SSL HTTPS domain.

---

## 🏗️ Architecture & Project Structure

```
NetMirror-Plus/
├── Cargo.toml                  # Rust dependencies (Axum, Tokio, Reqwest, Base64, Serde)
├── Dockerfile                  # Multi-stage production container build (Debian / Alpine)
├── render.yaml                 # Render Blueprint specification
├── railway.json                # Railway cloud deployment configuration
├── netlify.toml                # Netlify edge build and routing configuration
├── netlify/
│   └── functions/
│       └── api.js              # Serverless Netlify API function (HLS sports & stream proxy)
├── src/
│   ├── bin/
│   │   └── moviebox_web.rs     # Rust Web Server CLI entrypoint ($PORT support)
│   ├── web/
│   │   ├── mod.rs              # Axum router setup & static file middleware
│   │   ├── api.rs              # High-throughput API routes (sports, browse, platforms, streams)
│   │   ├── proxy.rs            # Adaptive video stream streaming proxy
│   │   └── subtitles.rs        # WebVTT parser & subtitle converter
│   └── ...
└── web/                        # Pure Vanilla JavaScript & Modern CSS Web Application
    ├── index.html              # Single Page Application layout & Mobile Bottom Nav
    ├── styles.css              # Dark cinema glassmorphism, responsive media queries
    └── app.js                  # Video player controller, live sports engine, carousel mechanics
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :---: | :--- |
| <kbd>Space</kbd> / <kbd>K</kbd> | Play / Pause video |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>M</kbd> | Mute / Unmute audio |
| <kbd>←</kbd> / <kbd>J</kbd> | Seek backward 10 seconds |
| <kbd>→</kbd> / <kbd>L</kbd> | Seek forward 10 seconds |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume up / down (10%) |
| <kbd>/</kbd> | Focus global search bar |
| <kbd>Esc</kbd> | Close video player / dismiss modal |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by **[FS FERDOWS](https://github.com/fsferdows)**.
