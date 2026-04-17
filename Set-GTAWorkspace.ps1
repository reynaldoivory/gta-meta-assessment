<#
.SYNOPSIS
    Installs the verified source-of-truth files for the GTA Online Companion workspace.
.DESCRIPTION
    This script creates/overwrites AGENTS.md, .vscode/settings.json, and .mcp.json
    with the exact content required for the Steam Character refactor phase.
    It verifies the files after writing and prompts before any destructive action.
.NOTES
    Author: AI Assistant
    Date:   February 13, 2026
#>

# -------------------- Configuration --------------------
$ProjectRoot = $PSScriptRoot  # Where the script is located
$VSCodeFolder = Join-Path $ProjectRoot ".vscode"

# -------------------- File Content Definitions --------------------
$AGENTS_Content = @"
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
| **Real‑Time Coding (The "Spark" Loop)** | **GPT‑5.3‑Codex‑Spark** | `$0 | **Released Feb 12, 2026.** 1000 tok/sec. Best for "Speed" tasks & raw algorithms. |
| **Daily Implementation / Refactoring** | GPT‑5.3‑Codex (Standard) | `$0 | 25% faster than GPT-4o; optimized for standard codegen. |
| **React Components / JSX / UI State** | Claude Sonnet 4.5 | `$0 | 1M context. Significantly lower hallucination rate for nested JSX props. |
| **Unit Tests / Offline TDD** | DeepSeek‑R1 (Distilled) | `$0 | Use via Ollama when offline or to save bandwidth. |
| **Background Janitor Ops** | GLM‑4.7 Flash | ~`$0.07/1M | Ultra‑cheap for narrow, repetitive tasks (OpenRouter). |
| **Visual / UI Polish** | Claude 3.7 Sonnet | `$0 | Amazon Bedrock free credits. |
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
4. **Secrets:** Never load ``.env`` in agent‑accessible paths – use **Dotenv‑vault**.

## 🧩 Project‑Specific Conventions
- **Language:** TypeScript (Strict); Rust for memory‑safe telemetry.
- **Frontend:** React + Tailwind CSS (Use ``gta-green``, ``gta-panel`` utility classes).
- **State:** React Context for global settings; Zustand for complex local state.
- **Game Data:** All static data (vehicle stats, payouts) must reside in ``src/config/``.
- **Rank Logic:** All new features must handle ``Rank 1`` logic (no CEO office, `$0 income) gracefully.
- **Environment:** Windows 11 / PowerShell 7 (Dev).

## 📚 Persistent Memory (Agent‑Updated)
*This section is automatically appended to by agents.*
- [Initialized Feb 13, 2026]
"@

$VSCodeSettings_Content = @'
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
        "${workspaceFolder}"
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
'@

$MCP_Content = @'
{
  "mcpServers": {
    "deepseek-local": {
      "command": "npx",
      "args": ["-y", "@arikusi/deepseek-mcp-server"],
      "env": {
        "DEEPSEEK_API_KEY": "${env:DEEPSEEK_API_KEY}",
        "SHOW_COST_INFO": "true"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
'@

# -------------------- Helper Functions --------------------
function Test-FileContent {
    param(
        [string]$Path,
        [string]$ExpectedContent
    )
    if (-not (Test-Path $Path)) { return $false }
    $actual = Get-Content -Path $Path -Raw -ErrorAction Stop
    # Normalize line endings for comparison
    $actual = $actual -replace "`r`n?", "`n"
    $expected = $ExpectedContent -replace "`r`n?", "`n"
    return ($actual -eq $expected)
}

function Write-FileWithPrompt {
    param(
        [string]$Path,
        [string]$Content,
        [string]$Description
    )
    $dir = Split-Path $Path -Parent
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Cyan
    }

    $action = "write"
    if (Test-Path $Path) {
        if (Test-FileContent -Path $Path -ExpectedContent $Content) {
            Write-Host "$Description already exists with correct content. Skipping." -ForegroundColor Green
            return $true
        } else {
            Write-Host "Existing $Description differs from expected." -ForegroundColor Yellow
            $choice = Read-Host "Overwrite? (y/N) "
            if ($choice -notin 'y','Y') {
                Write-Host "Skipping $Path" -ForegroundColor Gray
                return $false
            }
            $action = "overwrite"
        }
    }

    try {
        Set-Content -Path $Path -Value $Content -NoNewline -Encoding UTF8 -Force
        Write-Host "$Description $action'd successfully." -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Error writing $Path : $_" -ForegroundColor Red
        return $false
    }
}

# -------------------- Main Execution --------------------
Write-Host "=== GTA Online Companion Workspace Setup ===" -ForegroundColor Magenta
Write-Host ""

$files = @(
    @{ Path = Join-Path $ProjectRoot "AGENTS.md"; Content = $AGENTS_Content; Desc = "AGENTS.md" },
    @{ Path = Join-Path $VSCodeFolder "settings.json"; Content = $VSCodeSettings_Content; Desc = ".vscode/settings.json" },
    @{ Path = Join-Path $ProjectRoot ".mcp.json"; Content = $MCP_Content; Desc = ".mcp.json" }
)

$allSuccess = $true
foreach ($file in $files) {
    if (-not (Write-FileWithPrompt -Path $file.Path -Content $file.Content -Description $file.Desc)) {
        $allSuccess = $false
    }
}

# -------------------- Verification --------------------
Write-Host ""
Write-Host "=== Verification ===" -ForegroundColor Magenta
$verified = $true
foreach ($file in $files) {
    if (Test-Path $file.Path) {
        if (Test-FileContent -Path $file.Path -ExpectedContent $file.Content) {
            Write-Host "✓ $($file.Desc) content matches." -ForegroundColor Green
        } else {
            Write-Host "✗ $($file.Desc) content does NOT match." -ForegroundColor Red
            $verified = $false
        }
    } else {
        Write-Host "✗ $($file.Desc) is missing." -ForegroundColor Red
        $verified = $false
    }
}

Write-Host ""
if ($verified) {
    Write-Host "✅ All files are correctly installed." -ForegroundColor Green
} else {
    Write-Host "⚠️ Some files are missing or incorrect." -ForegroundColor Yellow
}

# -------------------- Optional: Backup suggestion --------------------
if (-not $allSuccess) {
    Write-Host ""
    Write-Host "Tip: If you want to force overwrite all files, run the script again and answer 'y' to each prompt." -ForegroundColor Cyan
}
