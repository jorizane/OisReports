#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/ois-reports"
ENV_FILE="$ROOT_DIR/.env"

if [[ ! -d "$APP_DIR" ]]; then
  echo "Error: $APP_DIR not found." >&2
  exit 1
fi

cd "$APP_DIR"

if [[ -f "$ENV_FILE" ]]; then
  echo "[0/4] Load environment from $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${BACKEND_URL:-}" ]]; then
  echo "Error: BACKEND_URL is not set. Add it to $ENV_FILE." >&2
  exit 1
fi

echo "[0/4] Update production API base URL"
cat > "$APP_DIR/src/environments/environment.prod.ts" <<EOF
export const environment = {
  production: true,
  apiBaseUrl: '${BACKEND_URL}',
};
EOF

if [[ -n "${BACKEND_URL_DEV:-}" ]]; then
  echo "[0/4] Update development API base URL"
  cat > "$APP_DIR/src/environments/environment.ts" <<EOF
export const environment = {
  production: false,
  apiBaseUrl: '${BACKEND_URL_DEV}',
};
EOF
fi

echo "[1/4] Install dependencies"
if [[ -f package-lock.json ]]; then
  npm install
else
  npm install
fi

echo "[2/4] Ensure Capacitor Android is installed"
if ! npx --yes cap --version >/dev/null 2>&1; then
  echo "Capacitor CLI not available via npx. Installing locally..."
  npm install @capacitor/core @capacitor/cli @capacitor/android
else
  npm install @capacitor/core @capacitor/cli @capacitor/android
fi

echo "[3/4] Build web assets"
npm run build

echo "[4/4] Prepare Android project"
if [[ ! -d "android" ]]; then
  npx cap add android
fi
npx cap sync android

echo "Done. Android project is ready."
