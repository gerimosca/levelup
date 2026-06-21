# Scripts Directory

This directory contains all setup, generation, and maintenance scripts for the SaaS Boilerplate.

## ⚠️ Current Status

**State**: Legacy structure with technical debt pending refactoring.

📖 **Full Analysis**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete analysis, problems identified, and improvement plan.

---

## Quick Guide

### Setup Scripts

**Primary**: Use the new modular setup system:
```bash
npm run setup              # Interactive setup wizard
npm run setup:verify       # Verify what's completed
npm run setup:resume       # Resume paused setup
```

**Legacy** (being deprecated):
- `setup.mjs` - Old monolithic wizard (avoid)
- `setup-db.mjs`, `setup-seo.mjs`, `setup-copy.mjs` - Granular setup (use new system instead)

### Generators

Located in `/generators/`:
```bash
npm run generate:slice     # Generate new feature (VSA architecture)
npm run setup:seo          # Generate SEO pages
npm run setup:copy         # Customize landing copy
```

Individual generators:
- `colors.mjs` - Color palette generator
- `assets.mjs` - Logo/favicon generator
- `email.mjs` - Email template generator
- `legal.mjs` - Legal pages generator
- `landing.mjs` - Landing page generator

### Validation Scripts

```bash
npm run validate:architecture  # Validate VSA architecture rules
npm run check:links            # Check for broken links
```

### Utilities

- `pre-commit-check.js` - Pre-commit validation (runs automatically)

---

## Directory Structure

```
/scripts/
├── /setup-script/        # NEW: Modular setup system ✅
│   ├── /lib/            # Core setup utilities
│   └── /categories/     # Setup steps organized by category
├── /generators/          # Code generators
├── /lib/                # Shared utilities (AI, detection)
└── [root scripts]       # Legacy scripts (being reorganized)
```

---

## Adding New Scripts

### ⚠️ Interim Guidelines (Until Refactor)

While we prepare for the planned refactoring:

**DO** ✅:
- Add new setup steps to `setup-script/categories/`
- Put new generators in `/generators/` with clear names
- Use `verb-noun.mjs` naming pattern (e.g., `generate-feature.mjs`)
- Document complex logic
- Test thoroughly

**DON'T** ❌:
- Add more files to `/scripts` root (use subdirectories)
- Modify `setup.mjs` legacy file
- Create inconsistent naming patterns
- Skip error handling
- Forget to update this README

---

## Naming Conventions

**Standard Pattern**: `verb-noun.mjs`

Examples:
- ✅ `generate-feature.mjs`
- ✅ `validate-architecture.mjs`
- ✅ `check-links.mjs`
- ❌ `feature-generator.mjs` (noun-verb)
- ❌ `setup-seo.mjs` (noun-noun)

---

## Key Concepts

### Setup System (`/setup-script/`)

**Architecture**:
- **State Management**: Progress saved in `.setup.json`
- **Categories**: Steps organized in 6 categories (Infrastructure, Database, Branding, Content, Integrations, Compliance)
- **Verification**: Auto-detects completed steps
- **Interactive**: Menu-driven UX with pause/resume

**Adding a New Setup Step**:

1. Choose appropriate category in `/setup-script/categories/`
2. Add step object:
```javascript
{
  id: 'my-step',
  name: 'My Step Name',
  description: 'What this step does',
  type: 'automated',  // or 'manual', 'manual-pause'
  required: true,
  verification: 'my-step',  // Must match verifier function
  action: async () => {
    // Your logic here
    return { success: true, message: 'Done!' };
  }
}
```
3. Add verifier in `/setup-script/lib/verification.mjs`
4. Test with `npm run setup`

---

## Common Tasks

### Run Full Setup
```bash
npm run setup
# Navigate menus, execute steps
```

### Verify Current Progress
```bash
npm run setup:verify
```

### Generate New Feature
```bash
npm run generate:slice
# Follow prompts
```

### Validate Architecture
```bash
npm run validate:architecture
```

---

## Troubleshooting

### "Command not found"
Make sure you're in the project root and have run `npm install`.

### Setup stuck/paused
```bash
npm run setup:resume
```

### Reset setup progress
```bash
npm run setup:reset
# Warning: Deletes .setup.json
```

### Script errors
1. Check you're using Node 20+
2. Verify all dependencies installed
3. Check `.env.local` exists
4. See specific script's error messages

---

## Future Improvements

See [ARCHITECTURE.md](./ARCHITECTURE.md) for planned refactoring:
- Consolidate dual setup systems
- Reorganize into `/setup/`, `/generators/`, `/validation/`, `/maintenance/`
- Standardize all naming
- Improve documentation

---

## Resources

- **Setup System Docs**: `setup-script/README.md`
- **Architecture Analysis**: `ARCHITECTURE.md`
- **Project Instructions**: `../CLAUDE.md`
- **Feature Generator**: Uses VSA (Vertical Slice Architecture)

---

**Maintainer**: Development Team
**Last Updated**: 2025-11-21
