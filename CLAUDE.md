> **See also:** [Site-level plugin instructions](../CLAUDE.md) for git workflow and shared guidelines.

# CLAUDE.md - FRS Mortgage Calculator

## Overview

Embeddable mortgage calculator widget with lead capture. Can be shared on external websites.

**Version:** 1.0.1 | **PHP:** 8.1+ | **WordPress:** 6.0+ | **Network:** Multisite enabled

## Build Commands

```bash
npm install     # Install dependencies
npm run build   # Build Vite/React assets to assets/dist/
npm run dev     # Development server
```

## Shortcodes

| Shortcode | Purpose |
|-----------|---------|
| `[frs_mortgage_calculator]` | Renders the calculator widget |
| `[frs_mortgage_calculator_embed]` | Displays embed code for external sites |

### Attributes

```
user_id        - Loan officer user ID (defaults to current user or ?loan_officer_id param)
show_lead_form - "true" or "false"
webhook_url    - URL to POST lead data
gradient_start - Primary color hex (default: #2563eb)
gradient_end   - Secondary color hex (default: #2dd4da)
```

## REST API

**Base:** `/wp-json/frs-mortgage-calculator/v1/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/leads` | POST | Submit lead (email-me, share, or lead capture) |
| `/loan-officer/{id}` | GET | Get loan officer data |

## Key Files

```
frs-mortgage-calculator/
├── frs-mortgage-calculator.php   # Main plugin file (all PHP)
├── src/
│   └── widget/
│       └── main.tsx              # React widget entry
├── assets/
│   └── dist/                     # Built assets
│       └── manifest.json         # Vite manifest
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Integration with frs-wp-users

When `FRSUsers\Models\Profile` is available, loan officer data is pulled from profiles (headshot, phone, NMLS, etc.). Falls back to standard user meta.

## Email Functionality

Uses WordPress native `wp_mail()` for:
- Email-me (send results to self)
- Share (send results to another email)
- Lead notifications to loan officers

Requires a working mail configuration (SMTP plugin or server mail).

## Deployment (Deployer for Git webhook)

Auto-deploys to production (`myhub21.com` on Cloudron) via the **Deployer for Git (Pro)** plugin, which watches `github.com/fullrealtyservices/frs-mortgage-calculator` on the **`production`** branch.

```bash
git push origin main                 # dev
git push origin main:production      # deploy (a server hook requires main be pushed first)
```

Pushing `production` fires a GitHub webhook to `/wp-json/dfg/v1/package_update?secret=…&type=plugin&package=frs-mortgage-calculator`, which pulls the production branch and installs it live — no manual file copy.

Notes:
- Push auth: use the gh CLI credential helper (`gh auth setup-git`); the macOS `osxkeychain` helper can fail with `Device not configured`.
- The deployer's cache flush does **not** reset PHP opcache, so a *modified* file's change may not appear until the app is restarted (`cloudron restart --app <id>`) + `wp cache flush`. New files load fine.
