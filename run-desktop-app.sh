#!/usr/bin/env bash
# MovieBox Plus - Native Desktop App Launcher (macOS & Linux)
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/desktop" && npx -y electron .
