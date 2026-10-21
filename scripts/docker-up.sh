#!/bin/sh
# Démarre uniquement Kommando. N'arrête aucun autre conteneur.
set -eu

if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop n'est pas démarré. Ouvre Docker Desktop, puis relance ce script."
  exit 1
fi

port_busy() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:3847 -sTCP:LISTEN >/dev/null 2>&1
    return
  fi
  docker ps --format '{{.Ports}}' | grep -q '3847->'
}

if port_busy; then
  echo "Le port 3847 est déjà utilisé sur cette machine."
  echo "Aucun conteneur n'a été arrêté."
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:3847 -sTCP:LISTEN || true
  fi
  echo "Si ce n'est pas Kommando, change la partie gauche du port dans docker-compose.yml,"
  echo "par exemple \"192.168.0.103:3848:3847\", puis le même port dans Caddy, et relance."
  exit 1
fi

echo "Conteneurs déjà lancés (inchangés) :"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
echo
echo "Construction et démarrage de kommando-web seulement."
docker compose -p kommando up -d --build
echo
echo "Kommando : http://192.168.0.103:3847"
echo "Public : https://kommando.esseker.fr"
echo "Arrêt de ce conteneur seul : docker compose -p kommando stop"
