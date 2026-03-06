#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

WEB_MANAGER_DIR="${QA_WEB_MANAGER_DIR:-$REPO_ROOT/vurvey-web-manager}"
BASE_URL="${VURVEY_URL:-https://staging.vurvey.dev}"
LOGIN_USERNAME="${LOGIN_USERNAME:-${VURVEY_EMAIL:-}}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-${VURVEY_PASSWORD:-}}"
TEST_FILES="${QA_WEB_MANAGER_PLAYWRIGHT_FILES:-playwright/tests/navigation.spec.ts playwright/tests/conversations.spec.ts playwright/tests/reels.spec.ts}"
TEST_GREP="${QA_WEB_MANAGER_PLAYWRIGHT_GREP:-should verify home page|should verify agents and agent builder page|should verify audience page|should verify campaigns page|should verify datasets page|should verify workflow page|should verify rewards page|should verify settings page|new conversation with added agent|adding sources to conversation|adding tools|create and delete magic reel}"
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
echo "  specs: $TEST_FILES"

pushd "$WEB_MANAGER_DIR" >/dev/null

if [[ ! -d "node_modules/@playwright/test" ]]; then
  echo "Installing web-manager dependencies..."
  npm ci --legacy-peer-deps --ignore-scripts
  npm rebuild
  npm run prepare --if-present
fi

npx playwright install chromium

read -r -a TEST_FILE_ARGS <<< "$TEST_FILES"

URL="$BASE_URL" LOGIN_USERNAME="$LOGIN_USERNAME" LOGIN_PASSWORD="$LOGIN_PASSWORD" \
  npx playwright test \
    --config "$PW_CONFIG" \
    "${TEST_FILE_ARGS[@]}" \
    --project=chromium \
    --grep "$TEST_GREP" \
    --reporter=line

popd >/dev/null
