# Project Organization Guide

> **Purpose**: Document decisions about file organization, cleanup policies, and maintenance to prevent future clutter and confusion.

## Table of Contents
- [Root Directory Structure](#root-directory-structure)
- [Documentation Organization](#documentation-organization)
- [Backup Policy](#backup-policy)
- [Cleanup Guidelines](#cleanup-guidelines)
- [File Naming Conventions](#file-naming-conventions)

---

## Root Directory Structure

### What Belongs in Root (Max 5 .md Files)

**Tier-1 Documentation** - Fundamental documents that should be immediately visible:

```
/
├── README.md           # Getting started, project overview
├── ARCHITECTURE.md     # Project structure, core concepts
├── CLAUDE.md           # Development guidelines for AI coding
├── TESTING.md          # Testing strategy and guidelines
└── [Config files]      # package.json, tsconfig.json, etc.
```

**Why These Stay in Root**:
- ✅ **Critical importance** - Affects all development decisions
- ✅ **High frequency access** - Referenced constantly
- ✅ **Onboarding essential** - New developers need these first
- ✅ **Industry convention** - Expected locations

### What Does NOT Belong in Root

❌ **Historical documentation** (migrations, completed RFCs)
- Move to `docs/archive/`

❌ **Feature-specific guides** (analytics setup, SEO guides)
- Move to `docs/`

❌ **Planning documents** (WIP plans, design docs)
- Active: `docs/planning/`
- Completed: `docs/archive/`

❌ **Backup files** (*.backup, *.old, *backup-date/)
- Use Git instead (commits, branches, tags)

❌ **Log files** (build logs, debug logs)
- Temporary only, add to `.gitignore`

---

## Documentation Organization

### Structure

```
docs/
├── archive/                    # Historical/completed documentation
│   ├── README.md              # Index of archived docs
│   ├── MIGRATION_*.md         # Completed migrations
│   └── [feature]_PLAN.md      # Completed planning docs
│
├── planning/                   # Active planning (optional)
│   └── [feature]-rfc.md       # Active RFCs
│
├── architecture/               # Deep-dive architecture docs
│   ├── vsa-guide.md
│   └── cqrs-pattern.md
│
├── guides/                     # Setup and how-to guides (optional)
│   ├── ANALYTICS_SETUP.md
│   └── seo-geo.md
│
└── [TOPIC].md                  # Top-level guides (ANALYTICS_SETUP.md)
```

### Decision: ARCHITECTURE.md in Root vs docs/

**Decision**: Keep in **root** ✅

**Rationale**:
1. **Fundamental importance** - Defines entire project structure
2. **Frequent reference** - Needed for every architectural decision
3. **Onboarding critical** - First thing new developers should read
4. **Convention** - Large projects typically have architecture docs in root
5. **Relationship** - Closely tied to README, CLAUDE.md, TESTING.md

**Alternative considered**: Move to `docs/ARCHITECTURE.md`
- ❌ Lower visibility
- ❌ Extra navigation step
- ❌ Against convention

---

## Backup Policy

### Rule: Use Git, Not Manual Backups

**DO** ✅:
```bash
# Create a branch for major changes
git checkout -b refactor/big-change

# Stash temporary work
git stash save "WIP: testing new approach"

# Tag important milestones
git tag -a v1.0.0-pre-refactor -m "State before refactor"
```

**DON'T** ❌:
```bash
# Manual backups
cp -r src src.backup.20241129
cp tsconfig.json tsconfig.backup.json
mkdir messages.backup-20241129
```

### Why Git > Manual Backups

| Aspect | Git | Manual Backups |
|--------|-----|----------------|
| **Disk space** | Efficient (compression) | Wasteful (full copies) |
| **Tracking** | Full history + diffs | No context |
| **Recovery** | Easy (`git checkout`) | Manual file copying |
| **Clutter** | Clean working directory | Pollutes project root |
| **CI/CD** | Ignored automatically | Need manual .gitignore |

### `.gitignore` Protection

To prevent manual backups from being created:

```gitignore
# Backups (use Git instead)
*.backup
*.backup.*
*.old
*backup*/
```

---

## Cleanup Guidelines

### When to Archive Documentation

Move to `docs/archive/` when:
- ✅ Migration/refactor is **complete**
- ✅ Planning has been **implemented**
- ✅ Document is **no longer actively referenced**
- ✅ Information is **preserved in Git history**

Keep in root/active docs if:
- ❌ Still being actively worked on
- ❌ Referenced frequently in development
- ❌ Contains current architecture decisions
- ❌ Part of onboarding flow

### Regular Maintenance

**Monthly cleanup** (manual):
1. Review files in root - anything to archive?
2. Check `docs/planning/` - any completed RFCs to archive?
3. Run cleanup script (see below)

**Automated cleanup** (script):
```bash
# Run maintenance cleanup
npm run cleanup
```

This script:
- Removes log files older than 7 days
- Lists manual backups for review
- Lists planning files that might be done

### Cleanup Script

Located at: `scripts/maintenance/cleanup.mjs`

```bash
# Run with npm
npm run cleanup

# Or directly with Node
node scripts/maintenance/cleanup.mjs
```

Features:
- ✅ Cross-platform (works on Windows, Mac, Linux)
- ✅ Colored output for better readability
- ✅ Safe operations (only removes old logs, lists others)
- ✅ Excludes node_modules, .git, .next automatically

---

## File Naming Conventions

### Documentation Files

| Type | Pattern | Location | Example |
|------|---------|----------|---------|
| **Root docs** | `UPPERCASE.md` | `/` | `README.md`, `ARCHITECTURE.md` |
| **Archived docs** | `UPPERCASE.md` | `docs/archive/` | `MIGRATION_I18N.md` |
| **Active planning** | `lowercase-kebab.md` | `docs/planning/` | `theme-variants-rfc.md` |
| **Guides** | `UPPERCASE_SNAKE.md` | `docs/` | `ANALYTICS_SETUP.md` |
| **Architecture deep-dives** | `lowercase-kebab.md` | `docs/architecture/` | `vsa-guide.md` |

### Temporary Files (Auto-ignored)

Patterns that are `.gitignore`d:

```
*.plan.md        # Planning files (move to docs/ when done)
*.wip.md         # Work in progress
*.backup         # Backup files
*.backup.*       # Versioned backups
*.old            # Old versions
*backup*/        # Backup directories
*.log            # Log files
```

---

## Legacy Files Removed

### .clinerules (REMOVED)

**What it was**: Configuration file for Cline AI assistant (predecessor to Claude Code)

**Why removed**:
- ✅ Obsolete - Project now uses Claude Code with `CLAUDE.md`
- ✅ Outdated architecture - References old `/src/features/` structure
- ✅ Incorrect imports - Uses deprecated `@/features/*` paths
- ✅ Incomplete - Missing modern features (admin, billing, testing strategy)
- ✅ Replaced - `CLAUDE.md` is 8x more comprehensive (44KB vs 5KB)

**Comparison**:

| Aspect | `.clinerules` (OLD) | `CLAUDE.md` (CURRENT) |
|--------|---------------------|----------------------|
| **For** | Cline AI | Claude Code |
| **Size** | 5KB | 44KB |
| **Architecture** | Legacy (`/src/features/`) | Current (`/src/core/`, `/src/my-saas/`) |
| **Imports** | `@/features/*` ❌ | `@/core/*`, `@/my-saas/*` ✅ |
| **Coverage** | Basic VSA/CQRS | Full: Brand, UX, i18n, Testing, Troubleshooting |

---

## Best Practices Summary

### DO ✅

1. **Keep root clean** - Max 5 .md files (tier-1 docs only)
2. **Use Git for backups** - Branches, tags, stash
3. **Archive completed docs** - Move to `docs/archive/` when done
4. **Run cleanup monthly** - Use maintenance script
5. **Follow naming conventions** - Consistent patterns
6. **Update .gitignore** - Prevent clutter from returning

### DON'T ❌

1. **Leave completed planning docs in root** - Archive them
2. **Create manual backups** - Git has you covered
3. **Keep log files** - Temporary only, gitignore them
4. **Mix active and historical docs** - Separate clearly
5. **Skip cleanup** - Technical debt accumulates fast

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2024-11-29 | Initial cleanup | 9+ legacy docs in root, 3 backup dirs |
| 2024-11-29 | Removed `.clinerules` | Obsolete, replaced by CLAUDE.md |
| 2024-11-29 | Created `docs/archive/` | Organize historical docs |
| 2024-11-29 | Added cleanup script | Automate maintenance |
| 2024-11-29 | Updated `.gitignore` | Prevent future backups |

---

## Questions?

**Q: Can I add more .md files to root?**
A: Only if they're tier-1 (fundamental, high-frequency, onboarding-critical). Otherwise use `docs/`.

**Q: What about CHANGELOG.md or CONTRIBUTING.md?**
A: Yes, these are tier-1 for open source projects. Still keep total <7 files in root.

**Q: Should I delete old Git commits with messy files?**
A: No, keep Git history intact. Just clean current working directory.

**Q: What if I need a backup before a risky operation?**
A: Use `git checkout -b backup/before-risky-thing` or `git tag`.

**Q: How often should I run cleanup?**
A: Monthly for manual review, or whenever root starts feeling cluttered.

---

**Last Updated**: 2024-11-29
**Maintained By**: Project maintainers
**Review Frequency**: Quarterly or when 5+ new files appear in root
