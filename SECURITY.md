# Security Policy

## Scope

This project is a **client-side static site** with no backend, no authentication, and no network calls to third-party origins. The attack surface is limited to:

- DOM / XSS via user input persisted to `localStorage`
- CSV injection via exported data
- Supply-chain compromise of npm dependencies
- CSP bypass attempts

## Supported Versions

Only the `main` branch and the deployed `gh-pages` artifact receive security fixes. There is no LTS branch.

## Defenses Already in Place

- **CSP**: `script-src 'self'; connect-src 'self'` — set in `index.html`
- **localStorage allowlist**: hydration keys are matched against `Object.keys(defaults)` before merging into state (blocks prototype pollution)
- **External-href allowlist**: `DetailModal.jsx` gates CSV-sourced URLs via `ALLOWED_ORIGINS`
- **CSV export sanitization**: `escapeCsvCell()` prevents formula injection in spreadsheet consumers
- **Dependency scanning**: `npm audit` run on every ship; 0 high/critical at time of publication

## Reporting a Vulnerability

If you believe you have found a security issue:

1. **Do not open a public GitHub issue.**
2. Open a **private security advisory** via <https://github.com/reynaldoivory/gta-meta-assessment/security/advisories/new>, or
3. Email: `163233026+reynaldoivory@users.noreply.github.com`

Please include:
- Affected file(s) and line numbers
- Reproduction steps or proof-of-concept
- Your assessment of impact (what an attacker gains)

I will acknowledge receipt within 7 days and aim to ship a fix or document a mitigation within 30 days for confirmed vulnerabilities.

## Out of Scope

- Social engineering of the maintainer
- Physical attacks on end-user devices
- Issues in third-party hosts (GitHub Pages, npm registry)
- Denial of service against client-side resources (the app already degrades gracefully on localStorage failure)
