# ==============================================================================
# NetMirror Plus - Docker Deployment
# Multi-stage Rust build with slim runtime container
# ==============================================================================

# Stage 1: Build binary
FROM rust:1-slim-bookworm AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build production binary
RUN cargo build --release --bin moviebox_web

# Stage 2: Minimal runtime image
FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Copy compiled executable
COPY --from=builder /usr/src/app/target/release/moviebox_web /app/moviebox_web

# Copy frontend static assets (HTML, CSS, JS)
COPY web /app/web

# Port configuration
ENV PORT=3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/platforms || exit 1

CMD ["/app/moviebox_web"]

