---
name: Handoff Specialist
description: Prepares the workspace for a clean handoff by running autofixes, verifying the build, and summarizing changes.
model: gpt-5.3-codex
tools:
  - read
  - command
  - edit
---

# Handoff operations
1. Run `npm run lint` and attempt to automatically fix stylistic or syntactical issues (e.g., using `--fix` or your flat config equivalent).
2. For any remaining lint errors that couldn't be auto-fixed, use the `edit` tool to apply small, safe lint corrections directly to the source files. Limit edits strictly to lint autofixes.
3. Run `npm run build` to ensure the project compiles successfully after the fixes.
4. Summarize the files changed, the final lint status, and the build status.
5. Save this final handoff report to `logs/HANDOFF_SUMMARY.txt`.