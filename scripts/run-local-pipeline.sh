#!/usr/bin/env bash

# ═══════════════════════════════════════════════════════════════════
# Vurvey Docs — Local Pipeline Runner
#
# Runs the full QA → Analysis → Remediation → Build pipeline locally,
# mirroring what update-docs.yml and nightly-docs-sync.yml do in CI.
#
# Usage:
#   ./scripts/run-local-pipeline.sh              # full pipeline
#   ./scripts/run-local-pipeline.sh --skip-screenshots
#   ./scripts/run-local-pipeline.sh --skip-qa        # reuse existing qa-output/
#   ./scripts/run-local-pipeline.sh --skip-remediate  # skip Claude Code step
#   ./scripts/run-local-pipeline.sh --headed          # watch browser
#   ./scripts/run-local-pipeline.sh --quick           # quick QA only (no deep)
#   ./scripts/run-local-pipeline.sh --dry-run         # show what would run
#
# Env (set these or they'll be read from your shell):
#   VURVEY_EMAIL, VURVEY_PASSWORD  — required for screenshots + QA
#   VURVEY_URL                     — default: https://staging.vurvey.dev
#   VURVEY_WORKSPACE_ID            — default: 07e5edb5-e739-4a35-9f82-cc6cec7c0193
#
# Sibling repos (auto-detected from parent directory):
#   ../vurvey-web-manager  — switched to staging branch for remediation
#   ../vurvey-api          — switched to staging branch for remediation
#   Both are restored to their original branches after the pipeline.
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PARENT_DIR="$(cd "$REPO_ROOT/.." && pwd)"

# ── Defaults ──────────────────────────────────────────────────────
SKIP_SCREENSHOTS=false
SKIP_QA=false
SKIP_REMEDIATE=false
HEADED=false
QUICK=false
DRY_RUN=false

# Sibling repo state tracking
WEB_MANAGER_DIR="$PARENT_DIR/vurvey-web-manager"
API_DIR="$PARENT_DIR/vurvey-api"
WEB_MANAGER_ORIGINAL_BRANCH=""
API_ORIGINAL_BRANCH=""
WEB_MANAGER_STASHED=false
API_STASHED=false
SIBLING_REPOS_PREPARED=false

# ── Parse args ────────────────────────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --skip-screenshots) SKIP_SCREENSHOTS=true ;;
    --skip-qa)          SKIP_QA=true ;;
    --skip-remediate)   SKIP_REMEDIATE=true ;;
    --headed)           HEADED=true ;;
    --quick)            QUICK=true ;;
    --dry-run)          DRY_RUN=true ;;
    --help|-h)
      head -28 "$0" | tail -24
      exit 0
      ;;
    *)
      echo "Unknown flag: $arg (try --help)"
      exit 1
      ;;
  esac
done

# ── Colors ────────────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
DIM='\033[0;90m'
RESET='\033[0m'

step() {
  echo ""
  echo -e "${BOLD}${CYAN}[$1/8]${RESET} ${BOLD}$2${RESET}"
  echo -e "${DIM}────────────────────────────────────────${RESET}"
}

skip() {
  echo -e "  ${YELLOW}SKIPPED${RESET} ($1)"
}

pass() {
  echo -e "  ${GREEN}PASSED${RESET} $1"
}

fail() {
  echo -e "  ${RED}FAILED${RESET} $1"
}

# ── Sibling repo helpers ──────────────────────────────────────────

# Get current branch name for a repo
get_current_branch() {
  git -C "$1" rev-parse --abbrev-ref HEAD 2>/dev/null || echo ""
}

# Check if working tree is dirty
is_dirty() {
  ! git -C "$1" diff --quiet 2>/dev/null || ! git -C "$1" diff --staged --quiet 2>/dev/null
}

# Prepare a sibling repo: save state, switch to staging, pull latest
prepare_sibling_repo() {
  local repo_dir="$1"
  local repo_name="$2"

  if [[ ! -d "$repo_dir/.git" ]]; then
    echo -e "  ${YELLOW}$repo_name not found at $repo_dir — skipping${RESET}"
    return 1
  fi

  local current_branch
  current_branch=$(get_current_branch "$repo_dir")
  echo -e "  ${DIM}$repo_name: currently on '$current_branch'${RESET}"

  # Stash if dirty
  if is_dirty "$repo_dir"; then
    echo -e "  ${DIM}$repo_name: stashing uncommitted changes${RESET}"
    git -C "$repo_dir" stash push -m "pipeline-auto-stash-$(date +%s)" --quiet
    return 0  # return code used to track stash state by caller
  fi

  return 0
}

# Switch a repo to staging and pull
switch_to_staging() {
  local repo_dir="$1"
  local repo_name="$2"

  # Fetch latest
  echo -e "  ${DIM}$repo_name: fetching latest...${RESET}"
  git -C "$repo_dir" fetch origin staging --quiet 2>/dev/null || true

  # Switch to staging
  local current_branch
  current_branch=$(get_current_branch "$repo_dir")

  if [[ "$current_branch" == "staging" ]]; then
    echo -e "  ${DIM}$repo_name: already on staging, pulling latest${RESET}"
    git -C "$repo_dir" pull origin staging --quiet 2>/dev/null || true
  else
    echo -e "  ${DIM}$repo_name: switching to staging branch${RESET}"
    git -C "$repo_dir" checkout staging --quiet 2>/dev/null || {
      # staging branch might not exist locally yet
      git -C "$repo_dir" checkout -b staging origin/staging --quiet 2>/dev/null || {
        echo -e "  ${RED}$repo_name: failed to checkout staging branch${RESET}"
        return 1
      }
    }
    git -C "$repo_dir" pull origin staging --quiet 2>/dev/null || true
  fi

  local sha
  sha=$(git -C "$repo_dir" rev-parse --short HEAD)
  echo -e "  ${GREEN}$repo_name: on staging @ $sha${RESET}"
}

# Restore a sibling repo to its original state
restore_sibling_repo() {
  local repo_dir="$1"
  local repo_name="$2"
  local original_branch="$3"
  local was_stashed="$4"

  if [[ ! -d "$repo_dir/.git" ]]; then
    return
  fi

  # Remove symlink from vurvey-docs
  rm -f "$REPO_ROOT/$repo_name" 2>/dev/null || true

  if [[ -n "$original_branch" ]]; then
    local current_branch
    current_branch=$(get_current_branch "$repo_dir")
    if [[ "$current_branch" != "$original_branch" ]]; then
      echo -e "  ${DIM}$repo_name: restoring to '$original_branch'${RESET}"
      git -C "$repo_dir" checkout "$original_branch" --quiet 2>/dev/null || true
    fi
  fi

  if [[ "$was_stashed" == true ]]; then
    echo -e "  ${DIM}$repo_name: restoring stashed changes${RESET}"
    git -C "$repo_dir" stash pop --quiet 2>/dev/null || true
  fi
}

# Cleanup function — always runs on exit
cleanup_sibling_repos() {
  if [[ "$SIBLING_REPOS_PREPARED" == true ]]; then
    echo ""
    echo -e "${DIM}Restoring sibling repos to original state...${RESET}"
    restore_sibling_repo "$WEB_MANAGER_DIR" "vurvey-web-manager" "$WEB_MANAGER_ORIGINAL_BRANCH" "$WEB_MANAGER_STASHED"
    restore_sibling_repo "$API_DIR" "vurvey-api" "$API_ORIGINAL_BRANCH" "$API_STASHED"
    echo -e "${DIM}Sibling repos restored.${RESET}"
  fi
}

trap cleanup_sibling_repos EXIT

# ── Preflight checks ─────────────────────────────────────────────
cd "$REPO_ROOT"

if [[ ! -f package.json ]]; then
  echo -e "${RED}Error: must be run from vurvey-docs root${RESET}"
  exit 1
fi

if [[ "$SKIP_SCREENSHOTS" == false || "$SKIP_QA" == false ]]; then
  if [[ -z "${VURVEY_EMAIL:-}" || -z "${VURVEY_PASSWORD:-}" ]]; then
    echo -e "${RED}Error: VURVEY_EMAIL and VURVEY_PASSWORD are required${RESET}"
    echo "Set them in your shell or pass --skip-screenshots --skip-qa to bypass"
    exit 1
  fi
fi

if [[ "$SKIP_REMEDIATE" == false ]]; then
  if ! command -v claude &>/dev/null; then
    echo -e "${YELLOW}Warning: claude CLI not found — remediation step will be skipped${RESET}"
    SKIP_REMEDIATE=true
  fi
fi

if [[ "$DRY_RUN" == true ]]; then
  echo -e "${BOLD}${YELLOW}DRY RUN — showing what would execute:${RESET}"
  echo ""
  [[ "$SKIP_SCREENSHOTS" == false ]] && echo "  1. npm run update:screenshots" || echo "  1. (skip screenshots)"
  [[ "$SKIP_QA" == false ]]          && echo "  2. npm run test:qa${QUICK:+ -- --quick}" || echo "  2. (skip QA)"
  echo "  3. npm run test:qa:analyze"
  echo "  3.5 Prepare sibling repos (checkout staging, pull latest, symlink)"
  [[ "$SKIP_REMEDIATE" == false ]]   && echo "  4. claude -p <remediation-prompt> --model claude-sonnet-4-5-20250929" || echo "  4. (skip remediation)"
  echo "  5. Restore sibling repos"
  echo "  6. npm run lint:docs"
  echo "  7. npm run docs:build"
  echo "  8. Summary"
  exit 0
fi

# ── Track timing ──────────────────────────────────────────────────
PIPELINE_START=$(date +%s)
FAILURES=0

# Export env for child scripts
export VURVEY_URL="${VURVEY_URL:-https://staging.vurvey.dev}"
export VURVEY_WORKSPACE_ID="${VURVEY_WORKSPACE_ID:-07e5edb5-e739-4a35-9f82-cc6cec7c0193}"

if [[ "$HEADED" == true ]]; then
  export HEADLESS=false
else
  export HEADLESS=true
fi

# ══════════════════════════════════════════════════════════════════
# STEP 1: Capture Screenshots
# ══════════════════════════════════════════════════════════════════
step 1 "Capture Screenshots"

if [[ "$SKIP_SCREENSHOTS" == true ]]; then
  skip "--skip-screenshots"
else
  if npm run update:screenshots 2>&1 | tail -5; then
    pass ""
  else
    fail "(non-blocking — continuing)"
    FAILURES=$((FAILURES + 1))
  fi
fi

# ══════════════════════════════════════════════════════════════════
# STEP 2: Run QA Tests
# ══════════════════════════════════════════════════════════════════
step 2 "Run QA Tests"

if [[ "$SKIP_QA" == true ]]; then
  skip "--skip-qa (reusing existing qa-output/)"
else
  QA_ARGS=""
  if [[ "$QUICK" == true ]]; then
    QA_ARGS="--quick"
  fi

  # QA failures are expected — don't exit on error
  set +e
  node scripts/qa-test-suite.js $QA_ARGS 2>&1 | tail -20
  QA_EXIT=$?
  set -e

  if [[ $QA_EXIT -eq 0 ]]; then
    pass "All QA tests passed"
  else
    echo -e "  ${YELLOW}QA tests had failures${RESET} (exit code $QA_EXIT) — will analyze"
  fi
fi

# ══════════════════════════════════════════════════════════════════
# STEP 3: Analyze QA Failures
# ══════════════════════════════════════════════════════════════════
step 3 "Analyze QA Failures"

if [[ ! -f qa-output/qa-report.json ]]; then
  echo -e "  ${YELLOW}No qa-output/qa-report.json found — skipping analysis${RESET}"
  FAILURE_COUNT=0
else
  node scripts/qa-failure-analyzer.js 2>&1

  if [[ -f qa-output/qa-analysis-input.json ]]; then
    FAILURE_COUNT=$(python3 -c "import json; print(json.load(open('qa-output/qa-analysis-input.json')).get('total_failures', 0))" 2>/dev/null || echo 0)
    echo ""
    echo -e "  Failures classified: ${BOLD}$FAILURE_COUNT${RESET}"

    if [[ -f qa-output/qa-failure-analysis.md ]]; then
      echo ""
      echo -e "  ${DIM}--- Analysis Summary ---${RESET}"
      head -30 qa-output/qa-failure-analysis.md | sed 's/^/  /'
      echo -e "  ${DIM}(see qa-output/qa-failure-analysis.md for full report)${RESET}"
    fi
  else
    FAILURE_COUNT=0
    echo -e "  ${GREEN}No failures to analyze${RESET}"
  fi
fi

# ══════════════════════════════════════════════════════════════════
# STEP 4: Prepare Sibling Repos for Source Verification
# ══════════════════════════════════════════════════════════════════
step 4 "Prepare Sibling Repos (staging branch)"

if [[ "$SKIP_REMEDIATE" == true ]]; then
  skip "remediation is skipped — no need to prepare repos"
elif [[ "$FAILURE_COUNT" == "0" ]]; then
  skip "no failures — no need to prepare repos"
else
  SIBLING_REPOS_AVAILABLE=0

  # ── vurvey-web-manager ──
  if [[ -d "$WEB_MANAGER_DIR/.git" ]]; then
    WEB_MANAGER_ORIGINAL_BRANCH=$(get_current_branch "$WEB_MANAGER_DIR")

    # Check for dirty state and stash
    if is_dirty "$WEB_MANAGER_DIR"; then
      echo -e "  ${DIM}vurvey-web-manager: stashing uncommitted changes${RESET}"
      git -C "$WEB_MANAGER_DIR" stash push -m "pipeline-auto-stash-$(date +%s)" --quiet
      WEB_MANAGER_STASHED=true
    fi

    if switch_to_staging "$WEB_MANAGER_DIR" "vurvey-web-manager"; then
      # Create symlink so the remediation prompt paths work
      ln -sfn "$WEB_MANAGER_DIR" "$REPO_ROOT/vurvey-web-manager"
      SIBLING_REPOS_AVAILABLE=$((SIBLING_REPOS_AVAILABLE + 1))
    fi
  else
    echo -e "  ${YELLOW}vurvey-web-manager not found at $WEB_MANAGER_DIR${RESET}"
  fi

  # ── vurvey-api ──
  if [[ -d "$API_DIR/.git" ]]; then
    API_ORIGINAL_BRANCH=$(get_current_branch "$API_DIR")

    # Check for dirty state and stash
    if is_dirty "$API_DIR"; then
      echo -e "  ${DIM}vurvey-api: stashing uncommitted changes${RESET}"
      git -C "$API_DIR" stash push -m "pipeline-auto-stash-$(date +%s)" --quiet
      API_STASHED=true
    fi

    if switch_to_staging "$API_DIR" "vurvey-api"; then
      ln -sfn "$API_DIR" "$REPO_ROOT/vurvey-api"
      SIBLING_REPOS_AVAILABLE=$((SIBLING_REPOS_AVAILABLE + 1))
    fi
  else
    echo -e "  ${YELLOW}vurvey-api not found at $API_DIR${RESET}"
  fi

  SIBLING_REPOS_PREPARED=true

  if [[ $SIBLING_REPOS_AVAILABLE -eq 2 ]]; then
    pass "Both repos on staging branch and symlinked"
  elif [[ $SIBLING_REPOS_AVAILABLE -eq 1 ]]; then
    echo -e "  ${YELLOW}Only 1 of 2 sibling repos available${RESET}"
  else
    echo -e "  ${YELLOW}No sibling repos available — remediation will have limited context${RESET}"
  fi
fi

# ══════════════════════════════════════════════════════════════════
# STEP 5: Claude Code Remediation
# ══════════════════════════════════════════════════════════════════
step 5 "Claude Code Remediation"

if [[ "$SKIP_REMEDIATE" == true ]]; then
  skip "--skip-remediate"
elif [[ "$FAILURE_COUNT" == "0" ]]; then
  skip "No failures to remediate"
else
  echo -e "  Running Claude Code on $FAILURE_COUNT failure(s)..."

  # Show which source repos are available
  [[ -L "$REPO_ROOT/vurvey-web-manager" ]] && echo -e "  ${DIM}Frontend source: vurvey-web-manager/ (staging)${RESET}"
  [[ -L "$REPO_ROOT/vurvey-api" ]]         && echo -e "  ${DIM}Backend source:  vurvey-api/ (staging)${RESET}"
  echo ""

  REMEDIATION_PROMPT=$(cat scripts/qa-remediation-prompt.md)

  set +e
  claude -p "$REMEDIATION_PROMPT" \
    --model claude-sonnet-4-5-20250929 \
    --dangerously-skip-permissions \
    --max-turns 25 \
    --output-format json \
    2>&1 | tee /tmp/claude-remediation-log.txt
  CLAUDE_EXIT=$?
  set -e

  if [[ $CLAUDE_EXIT -eq 0 ]]; then
    pass ""
  else
    fail "(exit code $CLAUDE_EXIT — see /tmp/claude-remediation-log.txt)"
    FAILURES=$((FAILURES + 1))
  fi

  # Show what Claude changed
  if [[ -f REMEDIATION_SUMMARY.md ]]; then
    echo ""
    echo -e "  ${DIM}--- Remediation Summary ---${RESET}"
    head -30 REMEDIATION_SUMMARY.md | sed 's/^/  /'
  fi

  # Show any bug reports created
  if ls bug-reports/*.json &>/dev/null 2>&1; then
    BUG_COUNT=$(ls bug-reports/*.json | wc -l | tr -d ' ')
    echo ""
    echo -e "  ${YELLOW}Bug reports created: $BUG_COUNT${RESET}"
    for f in bug-reports/*.json; do
      TITLE=$(python3 -c "import json; print(json.load(open('$f')).get('title','?'))" 2>/dev/null || echo "?")
      TARGET=$(python3 -c "import json; print(json.load(open('$f')).get('target_repo','?'))" 2>/dev/null || echo "?")
      echo -e "    - ${BOLD}$TARGET${RESET}: $TITLE"
    done
    echo -e "  ${DIM}(In CI these would be dispatched to the target repos)${RESET}"
  fi

  # Show any doc fixes created
  if ls doc-fixes/*.json &>/dev/null 2>&1; then
    DOC_COUNT=$(ls doc-fixes/*.json | wc -l | tr -d ' ')
    echo ""
    echo -e "  ${YELLOW}Doc fixes created: $DOC_COUNT${RESET}"
    for f in doc-fixes/*.json; do
      SUMMARY=$(python3 -c "import json; print(json.load(open('$f')).get('change_summary', json.load(open('$f')).get('title','?')))" 2>/dev/null || echo "?")
      echo -e "    - $SUMMARY"
    done
  fi

  # Show doc guide edits
  DOC_EDITS=$(git diff --name-only -- docs/guide/ 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$DOC_EDITS" -gt 0 ]]; then
    echo ""
    echo -e "  ${GREEN}Documentation files edited: $DOC_EDITS${RESET}"
    git diff --name-only -- docs/guide/ 2>/dev/null | sed 's/^/    /'
  fi
fi

# ══════════════════════════════════════════════════════════════════
# STEP 6: Lint Docs
# ══════════════════════════════════════════════════════════════════
step 6 "Lint Documentation"

if npm run lint:docs 2>&1; then
  pass ""
else
  fail ""
  FAILURES=$((FAILURES + 1))
fi

# ══════════════════════════════════════════════════════════════════
# STEP 7: Build Site
# ══════════════════════════════════════════════════════════════════
step 7 "Build VitePress Site"

if npm run docs:build 2>&1 | tail -5; then
  pass ""
else
  fail ""
  FAILURES=$((FAILURES + 1))
fi

# ══════════════════════════════════════════════════════════════════
# STEP 8: Summary
# ══════════════════════════════════════════════════════════════════
PIPELINE_END=$(date +%s)
DURATION=$((PIPELINE_END - PIPELINE_START))

step 8 "Pipeline Summary"

echo ""
echo -e "  ${BOLD}Duration:${RESET}          ${DURATION}s"
echo -e "  ${BOLD}QA failures:${RESET}       ${FAILURE_COUNT:-0}"
echo -e "  ${BOLD}Pipeline errors:${RESET}   $FAILURES"

# Show git diff summary if anything changed
CHANGED_FILES=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
if [[ "$CHANGED_FILES" -gt 0 ]]; then
  echo ""
  echo -e "  ${BOLD}Files modified:${RESET}"
  git diff --stat -- docs/guide/ 2>/dev/null | sed 's/^/    /'
  SCREENSHOT_COUNT=$(git diff --name-only -- docs/public/screenshots/ 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$SCREENSHOT_COUNT" -gt 0 ]]; then
    echo -e "    ${DIM}+ $SCREENSHOT_COUNT screenshot(s) updated${RESET}"
  fi
  echo ""
  echo -e "  ${DIM}Review changes with: git diff -- docs/guide/${RESET}"
  echo -e "  ${DIM}Discard changes with: git checkout -- docs/${RESET}"
fi

# Artifacts summary
echo ""
echo -e "  ${BOLD}Artifacts:${RESET}"
[[ -f qa-output/qa-report.json ]]          && echo "    qa-output/qa-report.json"
[[ -f qa-output/qa-analysis-input.json ]]  && echo "    qa-output/qa-analysis-input.json"
[[ -f qa-output/qa-failure-analysis.md ]]  && echo "    qa-output/qa-failure-analysis.md"
[[ -f qa-output/test-fixes-needed.md ]]    && echo "    qa-output/test-fixes-needed.md"
[[ -f REMEDIATION_SUMMARY.md ]]            && echo "    REMEDIATION_SUMMARY.md"
ls bug-reports/*.json 2>/dev/null | sed 's/^/    /' || true
ls doc-fixes/*.json 2>/dev/null | sed 's/^/    /' || true

echo ""
if [[ $FAILURES -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}Pipeline completed successfully${RESET}"
else
  echo -e "  ${YELLOW}${BOLD}Pipeline completed with $FAILURES error(s)${RESET}"
fi

# Note: cleanup_sibling_repos runs automatically via EXIT trap

exit $FAILURES
