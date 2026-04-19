#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/my-web-app}"

if [ ! -d "$APP_DIR" ]; then
  echo "App directory not found: $APP_DIR"
  echo "Clone the repo first, for example:"
  echo "git clone https://github.com/tanishkaaa-ai/my-web-app.git \"$APP_DIR\""
  exit 1
fi

cd "$APP_DIR"

echo "Pulling latest code..."
git pull origin main

echo "Installing backend dependencies..."
npm --prefix backend install

echo "Installing frontend dependencies..."
npm --prefix frontend install

echo "Building frontend..."
npm --prefix frontend run build

if [ ! -f backend/.env ]; then
  echo "Missing backend/.env"
  echo "Create it from backend/.env.example before starting PM2."
  exit 1
fi

if pm2 describe my-web-app >/dev/null 2>&1; then
  echo "Restarting PM2 app..."
  pm2 restart my-web-app
else
  echo "Starting PM2 app..."
  pm2 start ecosystem.config.js
fi

pm2 save

echo "Deploy complete."
pm2 status
