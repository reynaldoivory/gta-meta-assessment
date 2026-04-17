# GTA Online Meta Assessment

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://reynaldoivory.github.io/gta-meta-assessment/)
[![SonarQube](https://github.com/reynaldoivory/gta-meta-assessment/actions/workflows/sonarqube.yml/badge.svg)](https://github.com/reynaldoivory/gta-meta-assessment/actions/workflows/sonarqube.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=reynaldoivory_gta-meta-assessment&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=reynaldoivory_gta-meta-assessment)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=reynaldoivory_gta-meta-assessment&metric=coverage)](https://sonarcloud.io/component_measures?id=reynaldoivory_gta-meta-assessment&metric=coverage)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=reynaldoivory_gta-meta-assessment&metric=bugs)](https://sonarcloud.io/project/issues?id=reynaldoivory_gta-meta-assessment&resolved=false&types=BUG)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=reynaldoivory_gta-meta-assessment&metric=code_smells)](https://sonarcloud.io/project/issues?id=reynaldoivory_gta-meta-assessment&resolved=false&types=CODE_SMELL)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React 19](https://img.shields.io/badge/react-19-61dafb)](https://react.dev)
[![Vite 7](https://img.shields.io/badge/vite-7-646cff)](https://vitejs.dev)

A client-side criminal-empire evaluator for GTA Online. Players enter their assets, stats, and upgrades; the app scores the setup, detects bottlenecks, and emits a prioritized action plan. Zero backend — everything runs in the browser with localStorage persistence.

**Live:** <https://reynaldoivory.github.io/gta-meta-assessment/>

## What It Does

- **Empire Report Card** — scores income, infrastructure, heist readiness, and stats
- **Bottleneck detection** — six detector modules identify the constraint dragging your empire down
- **Priority Action Plan** — ordered list of moves, each annotated with compound ROI and payback hours
- **Garage** — browse a 795-vehicle database with filter/sort/search; detail modal links to GTA Wiki, GTABase, and replace-mod searches on gta5-mods.com
- **Gamification** — 13 achievements, streaks, XP, progress charts
- **Weekly events** — auto-expiring bonuses tracked against Rockstar's Thursday rotation
- **Exports** — CSV, AI-assistant prompts, Google Doc-ready reports, social share cards

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (JSX + TSX mixed) |
| Build | Vite 7 |
| Language | TypeScript (gradual migration) + JavaScript |
| Styling | Tailwind CSS 3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| Icons | lucide-react |
| CSV Parser | papaparse |
| Tests | Jest + jsdom |
| Deploy | gh-pages → GitHub Pages |

## Quickstart

```bash
git clone https://github.com/reynaldoivory/gta-meta-assessment.git
cd gta-meta-assessment
npm install
npm run dev          # localhost:5173
```

### Other scripts

```bash
npm run build        # production build -> dist/
npm run preview      # preview production build
npm test             # Jest unit tests (16 tests)
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run deploy       # build + push to gh-pages
```

### CLI tools

```bash
# Emit a curated mod stack from the vehicle database
node scripts/generateModStack.mjs --class Super --hsw > my-stack.md
```

## Security

- **CSP hardened** — `script-src 'self'; connect-src 'self'`. No external scripts, no third-party trackers.
- **Prototype-pollution defended** — localStorage hydration uses an allowlisted key merge.
- **External links sanitized** — `DetailModal` enforces origin allowlist on all CSV-sourced URLs.
- **CSV injection guarded** — export paths call `escapeCsvCell()` on every cell.
- **npm audit** — 0 high/critical vulnerabilities.
- **No secrets, no backend** — fully client-side.

See [SECURITY.md](SECURITY.md) for the disclosure policy.

## Architecture

```
User Input (AssessmentForm)
    ↓
AssessmentContext.runAssessment()
    ├── computeAssessment(formData)
    │   ├── calculateIncome       ← SSoT: src/utils/modelConfig.js
    │   ├── calculateScore
    │   └── detectBottlenecks     ← 6 detector modules
    ├── applyGamification         ← XP, achievements, streaks
    └── setStep('results')
            ↓
        AssessmentResults → PriorityActionPlan
                                ├── actionPlanBuilder
                                ├── dynamicIncome (weekly bonuses)
                                └── AIAssistantTools (LLM export)
```

Full architecture notes and single-source-of-truth registry: see [CLAUDE.md](CLAUDE.md) and [docs/](docs/).

## Contributing

Not accepting external PRs at this time. Issues and discussion are welcome.

## License

MIT — see [LICENSE](LICENSE).
