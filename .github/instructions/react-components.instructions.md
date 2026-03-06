---
name: React Components
description: Rules and conventions for React component files
applyTo: "src/components/**/*.{jsx,tsx},src/views/**/*.{jsx,tsx},src/context/**/*.{jsx,tsx},src/{App,main}.{jsx,tsx}"
---

# React component rules

- Use functional components with hooks; no class components.
- Destructure props in function signatures when it improves clarity.
- Use `prop-types` for `.jsx` components and TypeScript types for `.tsx` components.
- Keep component-local state minimal; derive values when possible.
- Keep extracted child components prop-driven; avoid importing context directly in lower-level presentational components unless there is a clear reason.
- Prefer one exported component per file unless tiny helper components are tightly coupled.
- Do not convert stable JSX files to TSX unless the task explicitly calls for it.
