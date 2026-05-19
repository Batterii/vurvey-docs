---
title: Vurvey CLI
---

# Vurvey CLI

`vurvey` is the official **command-line client** for the Vurvey API — a single binary that lets you list, create, get, and export every resource (surveys, personas, workflows, datasets, responses, transcripts, clips, answers) from your terminal. It outputs human-friendly tables by default, JSON when piped, and CSV when explicit. Designed to be equally usable by humans, scripts, CI pipelines, and AI agents.

> 📷 _Screenshot pending: Terminal showing `vurvey surveys list` table output_

::: tip Repo
The CLI lives at [github.com/Batterii/vurvey-cli](https://github.com/Batterii/vurvey-cli). It's a Go program (Go 1.24+) released as cross-compiled binaries for 6 platforms.
:::

---

## Quick start (60 seconds)

### 1. Install

**macOS / Linux** (recommended — install script):

```bash
curl -sSL https://storage.googleapis.com/vurvey-cli-releases/install.sh | sh
```

**Windows** (Scoop):

```powershell
scoop bucket add vurvey https://github.com/Batterii/scoop-vurvey
scoop install vurvey
```

The install script verifies GPG signature and SHA-256 before installing to `/usr/local/bin`. Re-run it any time to update — no package-manager refresh needed.

### 2. Point at your environment (only if not using production)

```bash
vurvey config set api-url https://api-staging.vurvey.dev
```

### 3. Log in

```bash
vurvey login
```

Choose **Email & Password** or **Google** at the interactive prompt.

### 4. Pick a workspace

```bash
vurvey workspaces list                 # find your workspace ID
vurvey workspaces use <workspace-id>   # set as default
```

### 5. Verify

```bash
vurvey me
vurvey surveys list
```

You're ready.

---

## Installation deep-dive

### Install script (recommended for macOS / Linux)

```bash
curl -sSL https://storage.googleapis.com/vurvey-cli-releases/install.sh | sh
```

| Variable | Effect |
|---|---|
| `VURVEY_INSTALL_DIR=~/.local/bin` | Install without sudo to a non-root path |
| `VURVEY_VERSION=v0.17.0` | Pin a specific version instead of latest |

The script reads a `latest` pointer in GCS on every run, so updates always reflect the most-recent release. No stale-cache issues like with package managers.

### Homebrew (macOS / Linux) — opt-in, NOT recommended

```bash
brew install Batterii/vurvey/vurvey
```

::: warning Why Homebrew is not the default
`brew upgrade vurvey` compares against your locally cached tap clone, so freshly published releases can appear missing until you `brew update` to refresh the tap. The install script avoids this. `vurvey update` (the CLI's built-in self-update) will run `brew update` automatically before `brew upgrade vurvey` to refresh the tap — but it's an extra step.
:::

### APT (Debian / Ubuntu)

```bash
curl -fsSL https://storage.googleapis.com/vurvey-cli-releases/apt/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/vurvey.gpg
echo "deb [signed-by=/usr/share/keyrings/vurvey.gpg] https://storage.googleapis.com/vurvey-cli-releases/apt stable main" \
  | sudo tee /etc/apt/sources.list.d/vurvey.list
sudo apt-get update && sudo apt-get install vurvey
```

### YUM / DNF (RHEL / Fedora)

```bash
sudo tee /etc/yum.repos.d/vurvey.repo <<EOF
[vurvey]
name=Vurvey CLI
baseurl=https://storage.googleapis.com/vurvey-cli-releases/rpm/\$basearch
enabled=1
gpgcheck=1
gpgkey=https://storage.googleapis.com/vurvey-cli-releases/apt/gpg.key
EOF
sudo yum install vurvey
```

### Build from source

Requires Go 1.24.7+:

```bash
git clone https://github.com/Batterii/vurvey-cli.git
cd vurvey-cli
go build -o vurvey .
```

### Supported platforms

| OS | Architecture | Install methods |
|---|---|---|
| macOS | Apple Silicon (arm64) | install script, Homebrew, source |
| macOS | Intel (amd64) | install script, Homebrew, source |
| Linux | x86_64 (amd64) | install script, APT, YUM, Homebrew, source |
| Linux | ARM64 (arm64) | install script, APT, YUM, Homebrew, source |
| Windows | x86_64 (amd64) | Scoop, source |
| Windows | ARM64 (arm64) | Scoop, source |

---

## Authentication

### Interactive login

```bash
vurvey login
```

Opens an interactive menu:

```
  How would you like to sign in?

  > Email & Password
    Google (opens browser)
```

- **Email & Password**: prompts for both, with masked password input.
- **Google**: opens your default browser for Google sign-in, then returns to the terminal.

### Non-interactive login (scripts / CI)

```bash
# Email + password from stdin (recommended — not in process list)
printf '%s' "$VURVEY_PASSWORD" | vurvey login --email you@company.com --password-stdin

# Google in non-interactive context (opens browser directly)
vurvey login --google

# Pre-existing auth token from stdin
printf '%s' "$VURVEY_TOKEN" | vurvey login --token-stdin
```

::: warning Avoid --password and --token directly
The plain `--password` and `--token` flags work for compatibility but expose secrets in process lists (`ps aux`) and shell history. Always prefer `--password-stdin` or `--token-stdin`.
:::

### Logout

```bash
vurvey logout
```

---

## Configuration

Config lives at `~/.config/vurvey/config.json`.

```bash
# Set the API environment
vurvey config set api-url https://api-staging.vurvey.dev    # staging
vurvey config set api-url https://api.vurvey.app            # production

# Set a default workspace so -w isn't needed on every command
vurvey workspaces list                                       # find your ID
vurvey workspaces use <workspace-id>                         # set as default

# View current config
vurvey config get api-url
vurvey config get workspace
vurvey config get token --reveal                             # sensitive values masked by default
```

---

## Commands

### Surveys

```bash
vurvey surveys list                          # all surveys (table)
vurvey surveys list -o json                  # JSON (pipeable)
vurvey surveys list -o json | jq '.[].id'    # extract IDs
vurvey surveys get <survey-id>               # full survey detail
vurvey surveys get                           # interactive picker (TTY only)
vurvey surveys get --name "Q1 Research"      # lookup by name
vurvey surveys create --name "Q1 Research"   # create new
```

### Personas & AI

```bash
vurvey personas list                         # AI personas / agents
vurvey workflows list                        # AI workflows
vurvey tools list                            # AI tools / MCP servers
vurvey system-prompts list                   # system prompts
```

### Workspaces

```bash
vurvey workspaces list                       # all your workspaces
vurvey workspaces get <id>                   # workspace detail
vurvey workspaces stats                      # statistics for a workspace
vurvey workspaces members list               # list members
```

### Responses & data

```bash
vurvey responses list <survey-id>            # responses to a survey
vurvey transcripts list <response-id>        # transcripts for a response
vurvey clips list <response-id>              # video clips for a response
vurvey answers list <survey-id>              # all answers for a survey
```

### Raw GraphQL

When the CLI doesn't have a wrapper command for what you need, drop down to raw GraphQL:

```bash
# Inline query via stdin
echo '{ me { id email name } }' | vurvey graphql -

# From a file
vurvey graphql --file query.graphql

# With variables
vurvey graphql --file query.graphql --vars '{"id": "abc123"}'
```

### Export

```bash
vurvey export pdf <survey-id>                # PDF export
vurvey export word <survey-id>               # Word (.docx) export
```

### Status (check authentication / environment)

```bash
vurvey status                                # human-readable summary
vurvey status -o json                        # machine-readable
vurvey status -F authenticated               # raw "true" / "false"
```

---

## Output formats

Every list command supports three output formats:

| Format | When used | Best for |
|---|---|---|
| **table** (default in TTY) | Auto-detected when stdout is a terminal | Human eyes |
| **json** (default when piped) | Auto-detected when stdout is a pipe | Other tools (`jq`, scripts) |
| **csv** | Explicit `-o csv` | Spreadsheets, exports |

```bash
vurvey surveys list                   # table
vurvey surveys list -o json           # JSON
vurvey surveys list -o csv            # CSV
vurvey surveys list -o json | jq .    # pipe to jq
```

---

## Global flags

```
-o, --output string        Output format: json, table, csv
-F, --field string         Extract a single field value (raw, no headers)
-w, --workspace string     Override workspace ID for this command
-y, --yes                  Skip confirmation prompts for destructive operations
    --api-url string       Override API URL for this command
    --error-format string  Error output format: json (for agents/scripts)
    --no-interactive       Disable interactive prompts (for agents/CI)
    --stdin-id             Read resource ID from stdin (for piping)
-v, --version              Print version
-h, --help                 Help for any command
```

The `-F` (field) flag is especially powerful for scripting — it outputs just the value of one field, no headers, no quoting. E.g. `vurvey surveys list -F id` lists raw IDs one per line.

---

## AI agent / scripting features

The CLI is engineered for non-interactive consumption.

### Structured exit codes

| Code | Meaning | Agent action |
|---|---|---|
| 0 | Success | Parse stdout JSON |
| 1 | General error | Parse stderr for details |
| 2 | Auth error | Run `vurvey login --token-stdin` |
| 3 | Not found | Resource doesn't exist |
| 4 | Permission denied | Check workspace/role |
| 5 | Validation error | Fix input and retry |

### Structured JSON errors

```bash
vurvey surveys get --no-interactive --error-format json
# stderr: {"code":5,"error":"validation_error","message":"no survey ID provided..."}
# exit code: 5
```

Agents can parse stderr without regex; the schema is stable.

### Command chaining with `--stdin-id`

```bash
# Pipe IDs between commands
vurvey surveys list -F id | head -1 | vurvey surveys get --stdin-id -o json

# Shell variable capture
ID=$(vurvey surveys list -F id --limit 1) && vurvey surveys get "$ID" -o json

# Create and immediately open
vurvey surveys create --name "Q2" -F id | vurvey surveys open --stdin-id
```

### Name lookup with `--name`

```bash
# Resolve by human-readable name instead of GUID
vurvey surveys get --name "Q1 Consumer Research" -o json
```

### Forcing non-interactive

```bash
# Errors go to stderr as JSON; never prompts for input
vurvey surveys get --no-interactive --error-format json 2>error.json

# Bypass destructive confirmations
vurvey surveys delete <id> --yes
```

---

## MCP server — Claude / Cursor / Codex integration

The CLI bundles an **MCP (Model Context Protocol) server** that exposes Vurvey data to MCP-capable AI clients as structured tool calls. Same binary, different transport.

```bash
brew install Batterii/vurvey/vurvey
vurvey login
vurvey mcp install claude-desktop    # or: cursor | codex | all
```

`vurvey mcp install`:
- Detects the client's config file location
- Writes an absolute-path entry (GUI apps with stripped `$PATH` still find the binary)
- Preserves any existing MCP servers
- Tells you exactly what changed

Useful flags:
- `--dry-run` — preview the config change without writing
- `--profile <name>` — install as a named profile (multiple Vurvey configs)
- `--read-only` — write a config that disables destructive operations

::: tip Claude Code users
Skip `vurvey mcp install` entirely. Install the plugin instead: `/plugin marketplace add Batterii/vurvey-claude-plugin` then `/plugin install vurvey`.
:::

---

## Shell completions

Enable tab completion for commands, flags, and arguments.

### Bash

```bash
echo 'eval "$(vurvey completion bash)"' >> ~/.bashrc
source ~/.bashrc
```

### Zsh

```bash
echo 'eval "$(vurvey completion zsh)"' >> ~/.zshrc
source ~/.zshrc
```

### Fish

```bash
vurvey completion fish > ~/.config/fish/completions/vurvey.fish
```

### PowerShell

```powershell
vurvey completion powershell | Out-String | Invoke-Expression
```

---

## Constraints & limitations

- **Auth tokens are stored at `~/.config/vurvey/config.json`** with file mode 0600. If you `cat` or `vurvey config get token` they're masked by default; use `--reveal` to see them.
- **API URL switching changes auth scope.** Tokens are scoped to one environment; switching api-url means re-login.
- **No automatic token refresh.** When your token expires, you'll get exit code 2 and need to re-login. (Some authentication paths may auto-refresh transparently — confirm by checking `vurvey status`.)
- **`vurvey export` formats are PDF and Word only.** CSV exports happen at the list level (`-o csv`).
- **Interactive pickers require a TTY.** Pipe or `--no-interactive` to skip.
- **Destructive commands prompt by default.** Use `-y` to skip for scripts.
- **Output schemas may evolve.** The CLI version-stamps releases; pin a version with `VURVEY_VERSION` for stability in CI.
- **Workspace context is sticky.** Once set via `workspaces use`, all subsequent commands target that workspace unless `-w` is used.
- **Some commands are workspace-scoped, some are user-scoped.** `me` is user-scoped; `surveys list` is workspace-scoped.
- **`vurvey graphql` is escape-hatch only.** If you find yourself reaching for raw GraphQL frequently, request a new wrapped command — it's faster to use.
- **Browser-based Google login requires a desktop OS.** On headless servers, use `--password-stdin` or `--token-stdin`.
- **MCP install detects the client config but doesn't validate it.** If you've manually edited the file, dry-run first.
- **No bulk-delete in one command.** You can pipe IDs but each delete is a separate invocation.
- **CSV output column choices are pre-set.** No custom column selection today.
- **Cross-workspace operations need explicit -w.** The default-workspace is convenient but can confuse scripts.

---

## Best practices

- **For scripts, always use `-o json` and `--no-interactive`.** Combining them produces reliable, parseable output with no terminal-tricks.
- **For CI, pin a CLI version with `VURVEY_VERSION`.** Don't rely on latest for production pipelines.
- **For agent integrations, use the MCP server, not direct CLI calls.** MCP gives the agent structured tool calls instead of shell parsing.
- **For credentials, use `--password-stdin` / `--token-stdin`.** Never `--password` directly.
- **For complex chains, use `-F` for atomic-value extraction** and `--stdin-id` for piping. Most scripts can avoid `jq` entirely with these.
- **For exploratory work, use the interactive picker** (`vurvey surveys get` with no ID). It's faster than copy-pasting GUIDs.
- **For destructive ops, run with `--dry-run` first** when available, or test on staging.
- **Use shell completions.** Time saved on tab-complete adds up.
- **For long-lived sessions, set the default workspace once.** Don't repeat `-w` on every command.
- **For debugging, add `-o json` to surface all fields.** The table output omits less-used columns.

---

## FAQ

#### Where is the CLI's auth token stored?
`~/.config/vurvey/config.json` (file mode 0600). Different per environment if you switch api-url.

#### Can I have multiple Vurvey environments configured at once?
You can switch via `vurvey config set api-url ...` but only one environment is "active" at a time. For multi-environment workflows, consider per-environment `VURVEY_CONFIG` paths (set `XDG_CONFIG_HOME` to a different dir).

#### Does the CLI work with SSO?
Yes — Google sign-in via `vurvey login` opens a browser flow that supports SSO. For non-Google SSO, you may need to obtain a token from the web app and use `--token-stdin`.

#### Can the CLI be used as a non-Vurvey-staff member?
Yes — anyone with a Vurvey account can use it. The CLI uses the same API and permissions model as the web app.

#### How do I update the CLI?
- **install script**: re-run `curl -sSL ... | sh`
- **Scoop**: `scoop update vurvey`
- **APT**: `sudo apt-get update && sudo apt-get install vurvey`
- **YUM**: `sudo yum update vurvey`
- **Homebrew**: `vurvey update` (or `brew update && brew upgrade vurvey`)

The CLI also has a `vurvey update` command that detects which install method you used and runs the right command.

#### Why don't certain commands work for me?
Most likely a permission issue. Check `vurvey workspaces list` and `vurvey me` to verify your role. Some commands require Admin / Owner.

#### How do I script "do X for every survey"?
```bash
vurvey surveys list -F id | while read id; do
  vurvey surveys get "$id" -o json
done
```

#### Does the CLI hit a different API than the web app?
No — same GraphQL API (`api.vurvey.app` or `api-staging.vurvey.dev`). The CLI is a thin client on top.

#### Can I use my own Vurvey API token in CI?
Yes — issue a token from the web app or a previous CLI login, store it as a CI secret, then `printf '%s' "$VURVEY_TOKEN" | vurvey login --token-stdin` at the start of each job.

#### What's the difference between the CLI and the MCP server?
- **CLI**: human-typed commands, scripts, CI.
- **MCP server**: structured tool calls for AI clients (Claude Desktop, Cursor, Codex, Claude Code).

Both ship in the same `vurvey` binary. The MCP server is the same logic exposed over a different transport.

#### Does the CLI work in air-gapped / offline environments?
No — it requires network access to the API. There's no offline mode.

#### How big is the binary?
Around 20-30 MB depending on platform (Go's static linking; includes everything).

#### Can I contribute to the CLI?
Yes — it's open-source at github.com/Batterii/vurvey-cli. PRs welcome. Run the test suite (`scripts/run-integration-suite.sh full`) before submitting.

#### What's the release cadence?
Releases happen as features ship. Tag a version, push the tag, GitHub Actions builds and publishes. No fixed cadence.

#### How are releases authenticated?
The install script verifies a GPG signature and SHA-256 checksum. Source: the GCS bucket `vurvey-cli-releases` with public keys at known paths. APT and YUM repos are also GPG-signed.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `command not found: vurvey` | PATH doesn't include `/usr/local/bin` (default install). Run `which vurvey` or check `VURVEY_INSTALL_DIR`. |
| `vurvey login` opens browser but never returns | Browser blocked the redirect URL — usually a localhost loopback. Try `--token-stdin` with a token obtained from the web app. |
| Auth errors (exit code 2) | Token expired. Re-login. |
| `Permission denied` (exit code 4) | Your role doesn't permit the action. Check `vurvey workspaces members list`. |
| Resource not found (exit code 3) | Verify the ID with `vurvey <resource> list -F id`. Common typo: confusing survey ID with response ID. |
| `vurvey graphql` returns errors I don't understand | Use the [Developer & API Reference](/guide/developer-reference) to look up schema; check field names spelled correctly. |
| Table output truncates columns | Switch to `-o json` for full field values; or pipe to `less -S`. |
| Interactive picker not appearing | You're in a pipe or non-TTY. Provide the ID explicitly or use `--name`. |
| `vurvey mcp install` doesn't change my Claude config | Pass `--dry-run` first to see what it would do. Check the client config file location. |
| Updates from install script fail with GPG error | Refresh keys: `sudo apt-key adv --keyserver ...` (APT only) or re-import the GCS GPG key. |
| Releases page doesn't show latest version | The CLI's `latest` pointer in GCS is the truth — install script reads it directly. |
| Slow performance on staging | Staging is a smaller cluster than prod. Expected. |
| Can't connect from inside corp VPN | Vurvey API endpoints may need allowlisting. Talk to IT or use the web app via the VPN's split-tunnel. |

---

## Cross-references

- [Developer & API Reference](/guide/developer-reference) — the GraphQL API the CLI wraps
- [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps) — manage tokens used by the CLI in CI
- [Integrations](/guide/integrations) — MCP server enables AI-client integrations
- [Account & Profile](/guide/account) — your user identity for `vurvey me`
- [Workspace Members & Roles](/guide/workspace-members) — permissions affect what commands you can run
- [Settings](/guide/settings) — workspace-level settings that govern your CLI capabilities
- [Cloud Functions Reference](/guide/cloud-functions) — the backend services the CLI's actions trigger
- [Feature Flags Reference](/guide/feature-flags) — `apiManagementEnabled` for API token management
- [Architecture](/guide/architecture) — where the CLI fits in the platform stack
- [Glossary](/guide/glossary) — GraphQL / API / MCP terminology
