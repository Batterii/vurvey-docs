# Vurvey Documentation Automation System

This repository includes an autonomous documentation maintenance system that runs nightly to keep the documentation accurate and up-to-date.

## Overview

The automation system performs three key functions:

1. **Screenshot Capture** - Automatically captures fresh screenshots from staging
2. **QA Testing** - Verifies documented UI elements exist and function correctly
3. **Documentation Analysis** - Uses Claude Code to identify and fix documentation discrepancies

## Required GitHub Secrets

Configure these secrets in the repository settings (`Settings > Secrets and variables > Actions`):

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VURVEY_EMAIL` | Staging login email | Use `jroell+claude@batterii.com` |
| `VURVEY_PASSWORD` | Staging login password | Get from 1Password: "Staging Test Account" |
| `ANTHROPIC_API_KEY` | Claude API key | Get from 1Password: "Anthropic API Key" |
| `VURVEY_REPO_TOKEN` | GitHub PAT with repo access | Create at github.com/settings/tokens |

### Creating the GitHub Token

The `VURVEY_REPO_TOKEN` needs access to the `batterii/vurvey-web-manager` repo:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Name it "vurvey-docs-automation"
5. Copy the token and add it as a repository secret

## Workflow Schedule

The workflow runs automatically every night at **3:00 AM UTC** (10:00 PM EST).

You can also trigger it manually:
1. Go to Actions tab
2. Select "Nightly Documentation Sync"
3. Click "Run workflow"

### Manual Trigger Options

- **force_update**: Create PR even if no changes detected
- **skip_screenshots**: Skip screenshot capture for faster testing

## File Structure

```
.github/workflows/
└── nightly-docs-sync.yml    # GitHub Actions workflow

scripts/
├── capture-screenshots.js    # Puppeteer screenshot automation
├── qa-test-suite.js          # UI verification tests
└── claude-doc-updater-prompt.md  # Claude Code analysis prompt
```

## Local Development

### Run Screenshots Locally

```bash
# Set environment variables
export VURVEY_EMAIL="your-email@example.com"
export VURVEY_PASSWORD="your-password"
export VURVEY_URL="https://staging.vurvey.com"

# Run screenshot capture
npm run update:screenshots

# Run with visible browser (for debugging)
HEADLESS=false npm run update:screenshots
```

### Run QA Tests Locally

```bash
# Set environment variables (same as above)

# Run QA tests headless
npm run test:qa

# Run with visible browser
npm run test:qa:headed
```

### Run Full Sync Locally

```bash
# Captures screenshots and runs QA tests
npm run sync:nightly
```

## How It Works

### 1. Screenshot Capture (`capture-screenshots.js`)

- Logs into Vurvey staging environment
- Navigates to each documented section
- Captures screenshots with consistent viewport
- Saves to `docs/screenshots/` directory

### 2. QA Testing (`qa-test-suite.js`)

- Verifies UI elements exist as documented
- Checks navigation routes and tabs
- Validates component presence
- Generates `qa-report.json` with results

### 3. Documentation Analysis (Claude Code)

- Reads current documentation files
- Compares against vurvey-web-manager source code
- Identifies discrepancies
- Makes targeted updates to documentation

### 4. Pull Request Creation

- If changes are detected, creates a PR
- PR includes all screenshot updates
- PR includes documentation fixes
- Requires manual review before merge

## Troubleshooting

### Workflow Fails at Login

1. Verify `VURVEY_EMAIL` and `VURVEY_PASSWORD` are correct
2. Check if the account has access to staging
3. Ensure no 2FA is required on the account

### Screenshots Not Updating

1. Check if Puppeteer browser installed correctly
2. Verify HEADLESS=true in workflow
3. Check for selector changes in the app

### Claude Code Analysis Fails

1. Verify `ANTHROPIC_API_KEY` is valid
2. Check prompt file exists at expected path
3. Review Claude logs in workflow artifacts

### PR Not Created

1. Workflow only creates PR if changes detected
2. Use "force_update" option to test
3. Check GitHub token permissions

## Monitoring

After each run, check:

1. **Workflow Status** - Actions tab shows pass/fail
2. **Artifacts** - Download `documentation-analysis` for logs
3. **Pull Requests** - Review any auto-generated PRs

## Best Practices

1. **Review All PRs** - Don't auto-merge, review changes first
2. **Monitor Weekly** - Check workflow runs at least weekly
3. **Update Test Selectors** - If UI changes significantly, update QA tests
4. **Keep Credentials Fresh** - Rotate passwords periodically
