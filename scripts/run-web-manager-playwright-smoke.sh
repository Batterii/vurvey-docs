#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

WEB_MANAGER_DIR="${QA_WEB_MANAGER_DIR:-$REPO_ROOT/vurvey-web-manager}"
BASE_URL="${VURVEY_URL:-https://staging.vurvey.dev}"
LOGIN_USERNAME="${LOGIN_USERNAME:-${VURVEY_EMAIL:-}}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-${VURVEY_PASSWORD:-}}"
TEST_GREP="${QA_WEB_MANAGER_PLAYWRIGHT_GREP:-should verify campaigns page|should verify datasets page|should verify workflow page}"
PW_CONFIG="$REPO_ROOT/scripts/web-manager-playwright.config.mjs"

if [[ ! -d "$WEB_MANAGER_DIR" ]]; then
  echo "Web manager repo not found at '$WEB_MANAGER_DIR'; skipping Playwright smoke tests."
  exit 0
fi

if [[ -z "$LOGIN_USERNAME" || -z "$LOGIN_PASSWORD" ]]; then
  echo "Missing credentials. Set VURVEY_EMAIL/VURVEY_PASSWORD (or LOGIN_USERNAME/LOGIN_PASSWORD)."
  exit 1
fi

echo "Running web-manager Playwright smoke tests"
echo "  repo: $WEB_MANAGER_DIR"
echo "  url:  $BASE_URL"

pushd "$WEB_MANAGER_DIR" >/dev/null

if [[ ! -d "node_modules/@playwright/test" ]]; then
  echo "Installing web-manager dependencies..."
  npm ci --legacy-peer-deps --ignore-scripts
  npm rebuild
  npm run prepare --if-present
fi

npx playwright install chromium

URL="$BASE_URL" LOGIN_USERNAME="$LOGIN_USERNAME" LOGIN_PASSWORD="$LOGIN_PASSWORD" \
  npx playwright test \
    --config "$PW_CONFIG" \
    playwright/tests/navigation.spec.ts \
    --project=chromium \
    --grep "$TEST_GREP" \
    --reporter=line

popd >/dev/null
