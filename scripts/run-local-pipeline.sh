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
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Defaults ──────────────────────────────────────────────────────
SKIP_SCREENSHOTS=false
SKIP_QA=false
SKIP_REMEDIATE=false
HEADED=false
QUICK=false
DRY_RUN=false

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
      head -22 "$0" | tail -18
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
  echo -e "${BOLD}${CYAN}[$1/7]${RESET} ${BOLD}$2${RESET}"
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
  [[ "$SKIP_REMEDIATE" == false ]]   && echo "  4. claude -p <remediation-prompt> --model claude-sonnet-4-5-20250929" || echo "  4. (skip remediation)"
  echo "  5. npm run lint:docs"
  echo "  6. npm run docs:build"
  echo "  7. Summary"
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
# STEP 4: Claude Code Remediation
# ══════════════════════════════════════════════════════════════════
step 4 "Claude Code Remediation"

if [[ "$SKIP_REMEDIATE" == true ]]; then
  skip "--skip-remediate"
elif [[ "$FAILURE_COUNT" == "0" ]]; then
  skip "No failures to remediate"
else
  echo -e "  Running Claude Code on $FAILURE_COUNT failure(s)..."
  echo ""

  REMEDIATION_PROMPT=$(cat scripts/qa-remediation-prompt.md)

  set +e
  claude -p "$REMEDIATION_PROMPT" \
    --model claude-sonnet-4-5-20250929 \
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
fi

# ══════════════════════════════════════════════════════════════════
# STEP 5: Lint Docs
# ══════════════════════════════════════════════════════════════════
step 5 "Lint Documentation"

if npm run lint:docs 2>&1; then
  pass ""
else
  fail ""
  FAILURES=$((FAILURES + 1))
fi

# ══════════════════════════════════════════════════════════════════
# STEP 6: Build Site
# ══════════════════════════════════════════════════════════════════
step 6 "Build VitePress Site"

if npm run docs:build 2>&1 | tail -5; then
  pass ""
else
  fail ""
  FAILURES=$((FAILURES + 1))
fi

# ══════════════════════════════════════════════════════════════════
# STEP 7: Summary
# ══════════════════════════════════════════════════════════════════
PIPELINE_END=$(date +%s)
DURATION=$((PIPELINE_END - PIPELINE_START))

step 7 "Pipeline Summary"

echo ""
echo -e "  ${BOLD}Duration:${RESET}          ${DURATION}s"
echo -e "  ${BOLD}QA failures:${RESET}       ${FAILURE_COUNT:-0}"
echo -e "  ${BOLD}Pipeline errors:${RESET}   $FAILURES"

# Show git diff summary if anything changed
CHANGED_FILES=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
if [[ "$CHANGED_FILES" -gt 0 ]]; then
  echo ""
  echo -e "  ${BOLD}Files modified by remediation:${RESET}"
  git diff --stat 2>/dev/null | sed 's/^/    /'
  echo ""
  echo -e "  ${DIM}Review changes with: git diff${RESET}"
  echo -e "  ${DIM}Discard changes with: git checkout -- docs/${RESET}"
fi

# Artifacts summary
echo ""
echo -e "  ${BOLD}Artifacts:${RESET}"
[[ -f qa-output/qa-report.json ]]          && echo "    qa-output/qa-report.json"
[[ -f qa-output/qa-analysis-input.json ]]  && echo "    qa-output/qa-analysis-input.json"
[[ -f qa-output/qa-failure-analysis.md ]]  && echo "    qa-output/qa-failure-analysis.md"
[[ -f REMEDIATION_SUMMARY.md ]]            && echo "    REMEDIATION_SUMMARY.md"
ls bug-reports/*.json 2>/dev/null | sed 's/^/    /' || true
ls doc-fixes/*.json 2>/dev/null | sed 's/^/    /' || true

echo ""
if [[ $FAILURES -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}Pipeline completed successfully${RESET}"
else
  echo -e "  ${YELLOW}${BOLD}Pipeline completed with $FAILURES error(s)${RESET}"
fi

exit $FAILURES
