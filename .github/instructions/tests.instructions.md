---
name: Testing Rules
description: Rules and conventions for Test files
applyTo: "**/*.{test,spec}.{js,jsx,ts,tsx},**/__tests__/**,test/**"
---

# Testing Conventions

- **Framework:** Tests run on Jest + jsdom.
- **Testing Philosophy:** Adhere to test-first discipline. Test behavior, not implementation details.
- **Structure:** Use clear Arrange-Act-Assert (AAA) blocks inside `it` or `test` blocks.
- **Mocking:** Keep mocks close to the test, and clear them between runs to avoid state leakage.
- **Async:** Always handle async logic with proper `await` and `expect.assertions()` if testing error boundaries.