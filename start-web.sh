#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/ois-reports"
ENV_FILE="$ROOT_DIR/.env"
ENV_DEV_FILE="$APP_DIR/src/environments/environment.ts"
BACKUP_DEV_FILE=""

if [[ ! -d "$APP_DIR" ]]; then
  echo "Error: $APP_DIR not found." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

API_URL="${BACKEND_URL_DEV:-${BACKEND_URL:-}}"
if [[ -z "$API_URL" ]]; then
  echo "Error: BACKEND_URL_DEV or BACKEND_URL must be set in $ENV_FILE." >&2
  exit 1
fi

cleanup() {
  if [[ -n "$BACKUP_DEV_FILE" && -f "$BACKUP_DEV_FILE" ]]; then
    mv "$BACKUP_DEV_FILE" "$ENV_DEV_FILE"
  fi
}

BACKUP_DEV_FILE="$(mktemp)"
cp "$ENV_DEV_FILE" "$BACKUP_DEV_FILE"
trap cleanup EXIT

cat > "$ENV_DEV_FILE" <<EOF_ENV
export const environment = {
  production: false,
  apiBaseUrl: '${API_URL}',
};
EOF_ENV

cd "$APP_DIR"
npm start
