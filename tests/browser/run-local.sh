#!/bin/sh
set -eu

IMAGE=teamjobs-landing-dev:latest
PREVIEW_IMAGE=teamjobs-landing-preview:latest
PLAYWRIGHT_IMAGE=mcr.microsoft.com/playwright:v1.58.2-noble
APP_CONTAINER=teamjobs-landing-browser-app-$$
APP_PORT=4322
NODE_VOLUME=

if ! command -v docker >/dev/null 2>&1; then
  apk add --no-cache docker-cli >/tmp/teamjobs-docker-cli.log
fi

REPO_ROOT=$(CDPATH='' cd -- "$(dirname "$0")/../.." && pwd)
CONTAINER_ID=$(hostname)
if MOUNT_ROOT=$(docker inspect "$CONTAINER_ID" --format '{{range .Mounts}}{{if eq .Destination "/app"}}{{.Source}}{{end}}{{end}}' 2>/dev/null) && [ -n "$MOUNT_ROOT" ]; then
  REPO_ROOT=$MOUNT_ROOT
  NODE_VOLUME=$(docker inspect "$CONTAINER_ID" --format '{{range .Mounts}}{{if eq .Destination "/app/node_modules"}}{{.Name}}{{end}}{{end}}')
fi

run_dev() {
  if [ -n "$NODE_VOLUME" ]; then
    docker run --rm --network host --user 0:0 \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v "$REPO_ROOT:$REPO_ROOT" \
      -v "$NODE_VOLUME:$REPO_ROOT/node_modules" \
      -w "$REPO_ROOT" "$IMAGE" sh -c "apk add --no-cache docker-cli >/dev/null 2>&1 && $*"
  else
    docker run --rm --network host --user 0:0 \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v "$REPO_ROOT:$REPO_ROOT" \
      -w "$REPO_ROOT" "$IMAGE" sh -c "apk add --no-cache docker-cli >/dev/null 2>&1 && $*"
  fi
}

run_cli() {
  run_dev "/app/node_modules/.bin/supabase $*"
}

run_docker() {
  run_dev "docker $*"
}

# shellcheck disable=SC2317 # Invoked indirectly by trap.
cleanup() {
  set +e
  docker rm -f "$APP_CONTAINER" >/dev/null 2>&1
  run_cli stop --project-id teamjobs-landing >/dev/null 2>&1
  docker run --rm --user 0:0 -v "$REPO_ROOT:$REPO_ROOT" -w "$REPO_ROOT" \
    "$IMAGE" sh -c "rm -rf -- $REPO_ROOT/supabase/.temp/start-secrets"
}
trap cleanup EXIT INT TERM

pnpm install --frozen-lockfile >/tmp/teamjobs-browser-install.log
docker build --network host --target dev -t "$IMAGE" "$REPO_ROOT"
run_cli start --yes --log-level error >/tmp/teamjobs-supabase-start.log 2>&1
run_cli db reset --local --no-seed >/tmp/teamjobs-supabase-reset.log 2>&1

STATUS=$(run_cli status -o env)
API_URL=
PUBLISHABLE_KEY=
while IFS= read -r line; do
  case "$line" in
    API_URL=*) API_URL=$(printf '%s' "${line#API_URL=}" | tr -d '"') ;;
    PUBLISHABLE_KEY=*) PUBLISHABLE_KEY=$(printf '%s' "${line#PUBLISHABLE_KEY=}" | tr -d '"') ;;
  esac
done <<EOF
$STATUS
EOF
[ -n "$API_URL" ] && [ -n "$PUBLISHABLE_KEY" ]

docker exec -i supabase_db_teamjobs-landing psql -U postgres -d postgres \
  -v ON_ERROR_STOP=1 < tests/browser/seed.sql
run_docker build --target prod \
  --build-arg PUBLIC_SUPABASE_URL="$API_URL" \
  --build-arg PUBLIC_SUPABASE_PUBLISHABLE_KEY="$PUBLISHABLE_KEY" \
  -t "$PREVIEW_IMAGE" "$REPO_ROOT"
docker run --rm "$PREVIEW_IMAGE" nginx -t
docker run -d --name "$APP_CONTAINER" -p "$APP_PORT:80" "$PREVIEW_IMAGE" \
  >/tmp/teamjobs-browser-app.log

n=0
until wget -q -O /dev/null "http://127.0.0.1:$APP_PORT/auth/" 2>/dev/null; do
  n=$((n + 1))
  [ "$n" -lt 60 ] || {
    docker logs "$APP_CONTAINER" >&2
    exit 1
  }
  sleep 1
done

set +e
if [ -n "$NODE_VOLUME" ]; then
  docker run --rm --network host --ipc=host \
    -v "$REPO_ROOT:$REPO_ROOT" \
    -v "$NODE_VOLUME:$REPO_ROOT/node_modules" \
    -w "$REPO_ROOT" -e BASE_URL="http://127.0.0.1:$APP_PORT" \
    "$PLAYWRIGHT_IMAGE" sh -c "corepack enable && corepack prepare pnpm@10.34.5 --activate >/dev/null 2>&1 && pnpm exec playwright test tests/browser/auth-rbac.spec.ts --workers=1"
else
  docker run --rm --network host --ipc=host \
    -v "$REPO_ROOT:$REPO_ROOT" \
    -w "$REPO_ROOT" -e BASE_URL="http://127.0.0.1:$APP_PORT" \
    "$PLAYWRIGHT_IMAGE" sh -c "corepack enable && corepack prepare pnpm@10.34.5 --activate >/dev/null 2>&1 && pnpm exec playwright test tests/browser/auth-rbac.spec.ts --workers=1"
fi
RESULT=$?
if [ "$RESULT" -ne 0 ]; then
  docker logs "$APP_CONTAINER" >&2
fi
exit "$RESULT"
