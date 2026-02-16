<#
.SYNOPSIS
    Automated Agentic Workspace Setup (Golden Copy - Feb 13, 2026)
.DESCRIPTION
    Performs a clean install of AGENTS.md, .vscode/settings.json, and .mcp.json.
#>

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   AGENTIC WORKSPACE SETUP (Feb 13 2026)  " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

# --- 1. CLEANUP ---
Write-Status "Step 1: Cleanup..."
$filesToRemove = @("AGENTS.md", "agents.md", ".mcp.json", "FOMO_CHECKLIST.md", "daily_routine.js")

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Status " - Deleted: $file" "Gray"
    }
}

if (-not (Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" | Out-Null
    Write-Status " - Created .vscode directory" "Gray"
}

# --- 2. IMPLEMENTATION ---
Write-Status "Step 2: Writing Golden Copy files..."

# FILE 1: AGENTS.MD (Sanitized)
$agentsContent = @"
# AGENTIC WORKSPACE PRIMING (Verified Feb 13, 2026)

## 📋 Project Identity
- **Project Type:** GTA Online Companion
- **Primary Goal:** Zero‑dollar monthly spend with strategic use of 300 premium requests.
- **Critical Constraint:** Claude Opus 4.6 consumes 3× premium requests → **Reserve for emergencies only.**
- **Current Phase:** "Steam Character" Refactor (Rank 1–25 Velocity).

## 🎯 Model Allocation Strategy

| Task Category | Recommended Model | Cost | Rationale |
|---------------|-------------------|------|-----------|
| **System Architecture / 1M‑token Analysis** | Claude Opus 4.6 | 3× Premium | Whole‑codebase reasoning & vulnerability discovery. |
| **Real‑Time Coding (The Spark Loop)** | **GPT‑5.3‑Codex‑Spark** | `$0 | **Released Feb 12, 2026.** 1000 tok/sec. Best for Speed tasks. |
| **Daily Implementation / Refactoring** | GPT‑5.3‑Codex (Standard) | `$0 | 25% faster than GPT-4o; optimized for standard codegen. |
| **React Components / JSX / UI State** | Claude Sonnet 4.5 | `$0 | 1M context. Significantly lower hallucination rate for nested JSX props. |
| **Unit Tests / Offline TDD** | DeepSeek‑R1 (Distilled) | `$0 | Use via Ollama when offline or to save bandwidth. |
| **Background Janitor Ops** | GLM‑4.7 Flash | ~`$0.07/1M | Ultra‑cheap for narrow, repetitive tasks (OpenRouter). |
| **Visual / UI Polish** | Claude 3.7 Sonnet | `$0 | Amazon Bedrock free credits (Student tier). |
| **Final Security / Logic Review** | GPT‑5.3‑Codex | `$0 | Use a second model to catch blind spots. |

## ⚠️ Critical Rules
1. **Never trust the coding agent to review its own code.**
2. **Test‑First Discipline:**
   - Write a reproducing test that fails.
   - Fix until test passes.
   - Show passing test output.
3. **Opus 4.6 is for breakthroughs only:**
   - Zero‑day vulnerability discovery.
   - Complex architectural decisions.
4. **Secrets:** Never load `.env` in agent‑accessible paths – use **Dotenv‑vault**.

## 🧩 Project‑Specific Conventions
- **Language:** TypeScript (Strict); Rust for memory‑safe telemetry.
- **Frontend:** React + Tailwind CSS (Use `gta-green`, `gta-panel` utility classes).
- **State:** React Context for global settings; Zustand for complex local state.
- **Game Data:** All static data (vehicle stats, payouts) must reside in `src/config/`.
- **Rank Logic:** All new features must handle `Rank 1` logic (no CEO office, `$0 income) gracefully.
- **Environment:** Windows 11 / PowerShell 7 (Dev).

## 📚 Persistent Memory (Agent‑Updated)
*This section is automatically appended to by agents.*
- [Initialized Feb 13, 2026]
"@

$agentsContent | Out-File -FilePath "AGENTS.md" -Encoding UTF8
Write-Status " - Created: AGENTS.md" "Green"

# FILE 2: .VSCODE/SETTINGS.JSON
$settingsContent = @"
{
    "github.copilot.chat.copilotMemory.enabled": true,
    "github.copilot.chat.asking.enabled": true,
    "github.copilot.enable": {
        "*": true,
        "markdown": true,
        "plaintext": false
    },
    "github.copilot.inlineSuggest.enable": true,
    "github.copilot.advanced": {
        "authProvider": "github",
        "debug.overrideEngine": "gpt-5.3-codex-spark"
    },
    "terminal.integrated.sandbox.enabled": true,
    "terminal.integrated.sandbox.allowedPaths": [
        "`${workspaceFolder}"
    ],
    "terminal.integrated.sandbox.blockNetwork": true,
    "github.copilot.chat.agentSession.autoApproveRules": [
        {
            "commandPattern": "^(git status|ls|pwd|echo|npm test)",
            "approve": true
        },
        {
            "commandPattern": "^(npm run dev|npm install)",
            "approve": true
        },
        {
            "commandPattern": ".*",
            "approve": false
        }
    ],
    "github.copilot.chat.agentSession.defaultAgent": "gpt-5.3-codex-spark",
    "github.copilot.chat.agentSession.premiumRequestWarning": true,
    "github.copilot.chat.agentSession.premiumRequestThreshold": 250
}
"@

$settingsContent | Out-File -FilePath ".vscode/settings.json" -Encoding UTF8
Write-Status " - Created: .vscode/settings.json" "Green"

# FILE 3: .MCP.JSON
$mcpContent = @"
{
  "mcpServers": {
    "deepseek-local": {
      "command": "npx",
      "args": ["-y", "@arikusi/deepseek-mcp-server"],
      "env": {
        "DEEPSEEK_API_KEY": "`${env:DEEPSEEK_API_KEY}",
        "SHOW_COST_INFO": "true"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "`${workspaceFolder}"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "`${env:GITHUB_TOKEN}"
      }
    }
  }
}
"@

$mcpContent | Out-File -FilePath ".mcp.json" -Encoding UTF8
Write-Status " - Created: .mcp.json" "Green"

Write-Status "Setup Complete! Restart VS Code to apply changes." "Magenta"
