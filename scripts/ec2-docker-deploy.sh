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

if [ ! -f backend/.env.aws ]; then
  echo "Missing backend/.env.aws"
  echo "Create it from backend/.env.aws.example before deploying."
  exit 1
fi

if [ "${SKIP_GIT_PULL:-0}" = "1" ]; then
  echo "Skipping git pull because SKIP_GIT_PULL=1"
else
  echo "Pulling latest code..."
  git pull origin main
fi

echo "Building and starting Docker containers..."
docker compose -f docker-compose.aws.yml up -d --build

echo "Deployment complete."
docker compose -f docker-compose.aws.yml ps
