<!-- markdownlint-disable MD022 MD032 MD036 -->

# Changelog

All notable changes to the GTA Online Meta Assessment Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GTA+ exclusive bonuses now visible to all users with locked state indicator
- Lock icon overlay on GTA+ monthly bonuses for non-subscribers
- "GTA+ Required" label on locked weekly bonus tiles
- Locked bonus tiles render with grayscale and 60% opacity for visual distinction

### Changed
- WeeklyBonusBanner now always renders (not conditionally for GTA+ users only)
- `getWeeklyBonuses()` function now accepts options object: `{ hasGTAPlus, includeGTAPlus }`
- GTA+ monthly bonuses separated from global weekly events into dedicated `gtaPlus.monthlyBonuses` array
- Continued migration from JS/JSX components and utilities toward TS/TSX-typed architecture
- Updated strategy flow for assessment/results/action-plan sections via extracted shared components and hooks
- Updated economy guidance and verified pricing references to align with the latest Feb 2026 audit pass

### Fixed
- GTA+ logic no longer bleeds into global weekly event bonuses
- Eliminated multiplier branching in weekly events (6X vs 3X for same event)

## [Previous Changes]

_(Add previous releases here as project evolves)_
