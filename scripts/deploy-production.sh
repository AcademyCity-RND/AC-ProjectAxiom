#!/usr/bin/env bash
set -euo pipefail

: "${RELEASE_SHA:?RELEASE_SHA is required}"
: "${GHCR_USER:?GHCR_USER is required}"
: "${GHCR_TOKEN:?GHCR_TOKEN is required}"

APP_DIR="${AXIOM_APP_DIR:-/opt/axiom}"
[[ "$RELEASE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid release SHA' >&2; exit 1; }
DEPLOY_DIR="$APP_DIR/.deploy/$RELEASE_SHA"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.prod.yml"
IMAGE_TAG="sha-$RELEASE_SHA"

cd "$APP_DIR"
test -f .env || { echo "Missing $APP_DIR/.env" >&2; exit 1; }

git fetch origin main
test "$(git rev-parse origin/main)" = "$RELEASE_SHA" || {
  echo "Release SHA is not the current origin/main" >&2
  exit 1
}

mkdir -p "$DEPLOY_DIR"
git show "$RELEASE_SHA:docker-compose.prod.yml" > "$COMPOSE_FILE.tmp"
mv "$COMPOSE_FILE.tmp" "$COMPOSE_FILE"

printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null

export IMAGE_TAG
docker compose \
  --project-name axiom-prod \
  --project-directory "$APP_DIR" \
  --env-file "$APP_DIR/.env" \
  -f "$COMPOSE_FILE" \
  config --quiet

docker compose \
  --project-name axiom-prod \
  --project-directory "$APP_DIR" \
  --env-file "$APP_DIR/.env" \
  -f "$COMPOSE_FILE" \
  pull

docker compose \
  --project-name axiom-prod \
  --project-directory "$APP_DIR" \
  --env-file "$APP_DIR/.env" \
  -f "$COMPOSE_FILE" \
  up -d --remove-orphans --no-build --wait --wait-timeout 180

docker image prune -f >/dev/null

echo "AXIOM production deployed: $IMAGE_TAG"
