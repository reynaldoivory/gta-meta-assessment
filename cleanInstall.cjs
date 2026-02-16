// cleanInstall.js
// Safe version (handles markdown backticks correctly)

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const VSCODE_DIR = path.join(ROOT, '.vscode');

const cleanupFiles = [
  path.join(ROOT, 'AGENTS.md'),
  path.join(VSCODE_DIR, 'settings.json'),
  path.join(ROOT, '.mcp.json'),
  path.join(ROOT, 'FOMO_CHECKLIST.md'),
  path.join(ROOT, 'daily_routine.js'),
];

const agentsMdContent = String.raw`# AGENTIC WORKSPACE PRIMING (Verified Feb 13, 2026)

## 📋 Project Identity
- **Project Type:** GTA Online Companion
- **Primary Goal:** Zero-dollar monthly spend with strategic use of 300 premium requests.
- **Critical Constraint:** Claude Opus 4.6 consumes 3× premium requests → **Reserve for emergencies only.**
- **Current Phase:** "Steam Character" Refactor (Rank 1–25 Velocity).

## 🎯 Model Allocation Strategy
| Task Category | Recommended Model | Cost | Rationale |
|---------------|-------------------|------|-----------|
| System Architecture | Claude Opus 4.6 | 3× | Whole-codebase reasoning |
| Real-Time Coding | GPT-5.3-Codex-Spark | $0 | Fast |
| Daily Refactor | GPT-5.3-Codex | $0 | Standard |
| React/UI | Claude Sonnet | $0 | JSX safe |
| Tests | DeepSeek | $0 | Offline |
| Security Review | GPT-5.3-Codex | $0 | Second pass |

## ⚠️ Critical Rules
1. Never trust the coding agent to review its own code.
2. Test-first discipline.
3. Opus only for breakthroughs.
4. Never load \`.env\` in agent paths.

## 🧩 Conventions
- TypeScript strict
- React + Tailwind CSS (Use \`gta-green\`, \`gta-panel\`)
- Data in \`src/config/\`

## 📚 Persistent Memory
- [Initialized Feb 13, 2026]
`;

const vscodeSettingsContent = `{
  "github.copilot.chat.copilotMemory.enabled": true,
  "github.copilot.inlineSuggest.enable": true,
  "github.copilot.advanced": {
    "debug.overrideEngine": "gpt-5.3-codex-spark"
  }
}
`;

const mcpJsonContent = `{
  "mcpServers": {
    "deepseek-local": {
      "command": "npx",
      "args": ["-y", "@arikusi/deepseek-mcp-server"]
    }
  }
}
`;

console.log("Cleanup...");
cleanupFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log("Deleted:", path.relative(ROOT, file));
  }
});

if (!fs.existsSync(VSCODE_DIR)) fs.mkdirSync(VSCODE_DIR);

fs.writeFileSync(path.join(ROOT, 'AGENTS.md'), agentsMdContent);
fs.writeFileSync(path.join(VSCODE_DIR, 'settings.json'), vscodeSettingsContent);
fs.writeFileSync(path.join(ROOT, '.mcp.json'), mcpJsonContent);

JSON.parse(vscodeSettingsContent);
JSON.parse(mcpJsonContent);

console.log("✅ Clean install complete");