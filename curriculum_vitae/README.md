[![Update CVs](https://github.com/SchulteDev/SchulteDev/actions/workflows/update-cvs.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/update-cvs.yml)
[![Release CVs](https://github.com/SchulteDev/SchulteDev/actions/workflows/release-cvs.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/release-cvs.yml)

# Markus Schulte (Schulte development) CV Generation

AI-powered CV generation using Claude to transform career data into LuaLaTeX documents.

## Overview

Automated system that converts career data from [_data/career.md](../_data/career.md)
into CVs using Claude AI, with GitHub Actions for generation and PDF compilation.

## Architecture

### Two-Workflow System

```mermaid
flowchart LR
  A[Career Data Change] --> B[update-cvs.yml]
  C[Manual .tex Edit] --> D[release-cvs.yml]
  B --> E[Commit .tex files]
  E --> D
  D --> F[PDF Release]
  style A fill: #e1f5fe
  style C fill: #fff3e0
  style B fill: #f3e5f5
  style D fill: #e8f5e8
  style F fill: #fff8e1
```

- [update-cvs.yml](../.github/workflows/update-cvs.yml): AI transformation → .tex commits
- [release-cvs.yml](../.github/workflows/release-cvs.yml): PDF compilation → GitHub release

### Processing Modes

- **Incremental**: Processes git changes since last commit
- **Full rebuild**: Regenerates entire CV from career data

### CV Types

- **professional**: Traditional business format with quantified impact
- **anti**: Humorous format highlighting failures and lessons

## Local Testing

```bash
npm test                    # Basic test with mocks
CV_TYPES=anti npm test     # Test specific type
DRY_RUN=true npm test      # No file changes
```

## Environment

**Required**: `ANTHROPIC_API_KEY`  
**Optional**: `CV_TYPES`, `SKIP_API`, `DRY_RUN`, `GIT_DIFF_RANGE`
