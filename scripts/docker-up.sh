#!/bin/sh
# Reconstruit uniquement kommando-web. N'arrête aucun autre conteneur.
set -eu

if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop n'est pas démarré. Ouvre Docker Desktop, puis relance ce script."
  exit 1
fi

others=$(docker ps --format '{{.Names}} {{.Ports}}' | grep '3847' | grep -v '^kommando-web ' || true)
if [ -n "$others" ]; then
  echo "Le port 3847 est utilisé par autre chose que kommando-web."
  echo "$others"
  echo "Aucun conteneur n'a été arrêté."
  exit 1
fi

echo "Conteneurs déjà lancés (inchangés, sauf kommando-web) :"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
echo
echo "Reconstruction de kommando-web. Le journal doit contenir : source 20261021-verre"
docker compose -p kommando up -d --build --force-recreate --no-deps web
echo
echo "Kommando : http://192.168.0.103:3847"
echo "Public : https://kommando.esseker.fr"
echo "Arrêt de ce conteneur seul : docker compose -p kommando stop"
