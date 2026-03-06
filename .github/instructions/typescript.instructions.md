---
name: TypeScript Rules
description: Rules and conventions for TypeScript files
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# TypeScript Conventions

- **Types vs Interfaces:** Use interfaces for component props and public API shapes. Use types for unions/intersections.
- **Any vs Unknown:** Avoid `any`. Favor `unknown` for external data and narrow with type guards.
- **Config Objects:** Use `satisfies` for config objects to keep type inference while validating shape.
- **Type Co-location:** Co-locate types with the module that owns the data shape.
- **Gradual Migration:** When editing an existing `.js` utility file substantially, consider converting it to `.ts` if the change touches >50% of the file.
