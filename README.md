<div align="center">

# 🍿 NetMirror Plus (MovieBox Web)

**High-Performance In-Browser Cinema Streaming Platform & OTT Network Aggregator**

[![Rust](https://img.shields.io/badge/rust-2024%20edition-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![Axum](https://img.shields.io/badge/axum-0.8-blue.svg)](https://github.com/tokio-rs/axum)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

</div>

---

## 🌟 Key Features

- **🎬 In-Browser Cinema Player**: Native HTML5 streaming video player with instant playback, resolution quality selection (`1080p`, `720p`, `480p`, `360p`), speed controls (`0.5x` - `2.0x`), Picture-in-Picture, full seeking scrub bar, and TV series auto-next episode prompt.
- **🌐 Top 9 OTT Streaming Platforms**:
  - **Netflix Originals** (2,270+ titles)
  - **Prime Video Exclusives** (900+ titles)
  - **Disney+ Hotstar** (210+ titles)
  - **Apple TV+ Originals** (260+ titles)
  - **Hulu Exclusives** (250+ titles)
  - **Zee5 Originals & Blockbusters** (240+ titles)
  - **Viu Asian Dramas** (220+ titles)
  - **Vivamax Filipino Cinema** (100+ titles)
  - **Hoichoi Bengali Originals**
- **🦸 Studio Universes & Curated Collections**:
  - **Marvel Cinematic Universe (MCU)**
  - **DC Studios Universe**
  - **Anime [English Dubbed]** (One Piece, Jujutsu Kaisen, Demon Slayer, etc.)
  - **Korean K-Drama**
  - **Bollywood Blockbusters**
  - **Hollywood Hits**
  - **Top All-Time Box Office**
- **🎧 Multi-Audio & Dubs**: Real-time extraction of Hindi, Tamil, Telugu, English, and regional sibling audio tracks.
- **💬 Live Subtitles**: Real-time extraction and conversion to standard WebVTT subtitle tracks.
- **🛡️ Universal Cloud Mirrors**: Automatic fallback to verified fast cloud stream mirrors (VidSrc, MultiEmbed, 2Embed, VidLink) with zero broken dead links.
- **💾 Local Privacy Storage**: Continue Watching progress timestamps and My List favorites stored locally in browser localStorage with zero telemetry.

---

## 🚀 Quick Start (Local)

### Prerequisites
- [Rust](https://rustup.rs/) (1.85+)

### Clone & Run
```bash
# Clone the repository
git clone https://github.com/fsferdows/NetMirror-Plus.git
cd NetMirror-Plus

# Start the web server
./start.sh
```
Or directly with cargo:
```bash
cargo run --release --bin moviebox_web
```
Open **`http://localhost:3000`** in any web browser.

---

## 🐳 Docker Deployment

### Run with Docker
```bash
# Build the Docker image
docker build -t netmirror-plus .

# Run container on port 3000
docker run -d -p 3000:3000 --name netmirror netmirror-plus
```
Access at `http://localhost:3000`.

---

## ☁️ 1-Click Cloud Deployment from GitHub

### Option A: Render
1. Push this repository to your GitHub account (`fsferdows/NetMirror-Plus`).
2. Log in to [Render.com](https://render.com/).
3. Click **New +** > **Web Service**.
4. Select your **`NetMirror-Plus`** repository.
5. Render detects the `Dockerfile` automatically (or uses `render.yaml`).
6. Click **Deploy Web Service**!

### Option B: Railway
1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select **`NetMirror-Plus`**.
4. Railway builds the Docker image and gives you a live public HTTPS URL with automatic SSL.

### Option C: Fly.io / Koyeb / VPS
Run anywhere using the standard Docker image:
```bash
fly launch
```

---

## 🏗️ Architecture

```
NetMirror-Plus/
├── Cargo.toml                  # Rust dependencies (Axum, Tokio, Reqwest, Tower)
├── Dockerfile                  # Multi-stage production container build
├── render.yaml                 # Render Blueprint configuration
├── railway.json                # Railway deployment configuration
├── .github/workflows/deploy.yml # GitHub Actions CI & Docker registry pipeline
├── src/
│   ├── bin/
│   │   └── moviebox_web.rs     # Web server entrypoint with $PORT support
│   ├── web/
│   │   ├── mod.rs              # Axum server routes & middleware
│   │   ├── api.rs              # Platform, browse, search, details & streams endpoints
│   │   ├── proxy.rs            # Video stream streaming proxy
│   │   └── subtitles.rs        # Subtitle parser & VTT converter
│   └── ...
└── web/                        # High-End Cinema UI (Vanilla JS & Modern CSS)
    ├── index.html              # Main single-page web app
    ├── styles.css              # Dark cinema glassmorphism styling
    └── app.js                  # Player controls, platform showcase, auto-rotation
```

---

## 📜 License
Licensed under the [MIT License](LICENSE).
