#!/usr/bin/env bash

set -euo pipefail

echo "Updating apt packages..."
sudo apt-get update

echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing PM2..."
sudo npm install -g pm2

echo "Done."
node -v
npm -v
pm2 -v
