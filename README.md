# Vurvey Documentation

Auto-updating user documentation for [Vurvey](https://vurvey.com) - the AI-powered consumer insights platform.

## Features

- **VitePress-powered** documentation site with search
- **Automated screenshots** captured nightly via Puppeteer
- **GitHub Actions** workflow for CI/CD
- **GitHub Pages** deployment

## Live Site

📚 **[View Documentation](https://batterii.github.io/vurvey-docs/)**

## Development

### Prerequisites

- Node.js 20+
- npm

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Batterii/vurvey-docs.git
cd vurvey-docs

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

The site will be available at `http://localhost:5173/vurvey-docs/`

### Commands

| Command | Description |
|---------|-------------|
| `npm run docs:dev` | Start development server |
| `npm run docs:build` | Build for production |
| `npm run docs:preview` | Preview production build |
| `npm run update:screenshots` | Capture fresh screenshots |
| `npm run test:qa` | Run QA smoke suite against staging (requires credentials) |
| `npm run test:docs` | Lint docs (broken links + missing screenshots) |
| `npm run update:all` | Update screenshots + build |

## Automated Updates

This repo runs two scheduled GitHub Actions workflows:

- **Update Documentation** (`.github/workflows/update-docs.yml`): captures screenshots and deploys GitHub Pages (2 AM UTC)
- **Nightly Documentation Sync** (`.github/workflows/nightly-docs-sync.yml`): captures screenshots, runs QA, proposes doc updates, and opens a PR (3 AM UTC)

### GitHub Secrets Required

Configure these secrets in your repository settings:

| Secret | Description |
|--------|-------------|
| `VURVEY_EMAIL` | Login email for staging.vurvey.dev |
| `VURVEY_PASSWORD` | Login password |
| `VURVEY_WORKSPACE_ID` | Workspace ID for deterministic routing (default: DEMO workspace `07e5edb5-e739-4a35-9f82-cc6cec7c0193`) |

### QA Stability Settings

The staging app can occasionally show transient global errors like "Failed to fetch". The QA suite will retry route navigation automatically.

- `QA_ROUTE_RETRIES` (default: `3`)

QA output files are written under `qa-output/` (ignored by git).

### Manual Trigger

You can manually trigger updates:
1. Go to Actions tab
2. Select "Update Documentation"
3. Click "Run workflow"

## Project Structure

```
vurvey-docs/
├── docs/
│   ├── .vitepress/
│   │   └── config.js      # VitePress configuration
│   ├── public/
│   │   └── screenshots/   # Auto-captured screenshots
│   ├── guide/             # Documentation pages
│   └── index.md           # Home page
├── scripts/
│   └── capture-screenshots.js  # Puppeteer automation
├── .github/
│   └── workflows/
│       └── update-docs.yml     # CI/CD workflow
└── package.json
```

## Adding New Documentation

1. Create a new `.md` file in `docs/guide/`
2. Add it to the sidebar in `docs/.vitepress/config.js`
3. Commit and push

## Updating Screenshots

### Automatic (Recommended)
Screenshots update nightly. No action needed.

### Manual
```bash
# Set credentials
export VURVEY_EMAIL="your-email@example.com"
export VURVEY_PASSWORD="your-password"

# Run screenshot capture
npm run update:screenshots
```

By default, screenshot capture is best-effort. To fail the run if login/workspace resolution fails:

```bash
CAPTURE_STRICT=true npm run update:screenshots
```

### Adding New Screenshots

1. Edit `scripts/capture-screenshots.js`
2. Add new capture function following existing patterns
3. Reference new screenshots in documentation
4. Test locally before committing

## Configuration

### VitePress Config

Edit `docs/.vitepress/config.js` to:
- Update navigation and sidebar
- Change site title/description
- Add new pages
- Configure search

### Screenshot Config

Edit `scripts/capture-screenshots.js` to:
- Change target URLs
- Add new pages to capture
- Adjust viewport size
- Modify capture timing

## Deployment

Deployment happens automatically via GitHub Actions when:
- Push to `main` branch
- Scheduled nightly update
- Manual workflow trigger

GitHub Pages serves the built site from the `gh-pages` environment.

### Initial Setup

1. Enable GitHub Pages in repository settings
2. Select "GitHub Actions" as the source
3. Add required secrets
4. Push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test locally with `npm run docs:dev`
5. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with [VitePress](https://vitepress.dev/) for [Vurvey Labs](https://vurvey.com)
