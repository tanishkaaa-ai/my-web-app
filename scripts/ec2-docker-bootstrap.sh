#!/usr/bin/env bash

set -euo pipefail

echo "Updating apt packages..."
sudo apt-get update

echo "Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Allowing ubuntu user to run Docker..."
sudo usermod -aG docker "${USER}"

echo "Enabling Docker on boot..."
sudo systemctl enable docker
sudo systemctl start docker

echo "Done."
docker --version
docker compose version
echo "If Docker says permission denied, log out and reconnect to refresh group membership."
