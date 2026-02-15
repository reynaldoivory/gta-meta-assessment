# GTA Meta Assessment — Copilot Instructions

## Project Context
This is a React 19 + Vite SPA that helps GTA Online players assess their in-game empire and get optimized action plans. The codebase is primarily JavaScript (JSX) with a gradual TypeScript migration underway.

## Tech Stack
- **Framework:** React 19 (functional components, hooks only)
- **Build:** Vite 7
- **Styling:** Tailwind CSS 3
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** lucide-react
- **Testing:** Jest + jsdom
- **Linting:** ESLint 9 (flat config)

## Code Quality Rules

### File Size
- **Soft limit:** 250 lines (warning).  **Hard limit:** 300 lines (error).
- If a file approaches 300 lines, extract logic into custom hooks (`useXxx.js`) or utility modules (`xxxService.js`).
- Blank lines and comments do not count toward the limit.

### Complexity
- Maximum cyclomatic complexity per function: **10**.
- Maximum nesting depth: **3 levels**. Prefer early returns and guard clauses over deep nesting.

### Error Handling
- All async operations (fetch, timers) must have `try/catch` or `.catch()`.
- Never swallow errors silently — log or surface them.

## TypeScript Migration (Gradual)
- New utility/logic files should be written in **TypeScript** (`.ts`).
- New React components may remain `.jsx` for now — conversion is optional.
- When editing an existing `.js` utility file substantially, consider converting it to `.ts` if the change touches >50% of the file.
- Avoid `any`. Use concrete types or `unknown` with narrowing.
- Two files have already been migrated: `formValidation.ts`, `actionPlanBuilder.ts`.

## Architecture
- **Components** live in `src/components/` (and subdirectories by feature area: `calculators/`, `gamification/`, `shared/`).
- **Views** (page-level components) live in `src/views/`.
- **Pure logic & utilities** live in `src/utils/`.
- **Configuration data** lives in `src/config/`.
- **React context providers** live in `src/context/`.
- Keep presentation (JSX) and business logic (utils) separated.

## Coding Conventions
- Use **functional components** with hooks. No class components.
- Prefer **named exports** for components and utilities.
- Use **prop-types** for runtime prop validation on JSX components (already a dependency).
- Destructure props in function signatures.
- Prefix unused parameters with `_`.
- Keep imports organized: React/library imports first, then local imports.

## Refactoring Protocol

### When to Trigger
A file needs refactoring when **any** of these thresholds are crossed:
- File exceeds **300 lines** (excluding blanks and comments).
- A function's cyclomatic complexity exceeds **10**.
- Nesting depth exceeds **3 levels**.

### Extraction Order
1. **Extract a custom hook first** — move all state, effects, and data computation into `src/utils/use[Name].js`. The hook returns a plain data object consumed by the view.
2. **Extract presentational components second** — break the remaining JSX into focused components in `src/components/shared/[Feature][Section].jsx`.

### Naming Conventions
| Artifact | Location | Example |
|---|---|---|
| Custom hook | `src/utils/use[Name].js` | `usePriorityPlan.js` |
| Extracted component | `src/components/shared/[Name].jsx` | `SessionCard.jsx`, `ActionPlanList.jsx` |
| Pure helper function | `src/utils/[name].js` or `.ts` | `incomeCalculators.js` |

### Rules
- **Props, not context:** Extracted child components receive data via props. Only top-level views or providers should import context directly.
- **One component per file:** Each extracted component gets its own file with prop-types.
- **Preserve the public API:** The original file's default/named exports must not change — existing consumers should not break.
- **Verify after each extraction:** Run `npm run build` (and `npm run lint` if available) after each step.

### Stop Condition
Stop decomposing when every file is under 250 lines, every function's complexity is ≤ 10, and further splitting would create trivial "pass-through" components that add indirection without clarity.

## What NOT To Do
- Do not add new dependencies without explicit user approval.
- Do not refactor folder structure to Feature-Sliced Design or other patterns without discussion.
- Do not convert working JSX components to TSX unless asked.
- Do not introduce state management libraries (Zustand, Redux, etc.) — the app uses React Context.
