# Scripts Directory - Architecture Analysis & Improvement Plan

> **Status**: Legacy structure with technical debt
> **Last Updated**: 2025-11-21
> **Grade**: C+ (60/100)
> **Decision**: Postpone refactoring until appropriate time

---

## Current Structure

```
/scripts/
├── Root-level Scripts (10 files, 3,945 LOC)
│   ├── setup.mjs                    (709 LOC) - ⚠️ Legacy monolithic setup wizard
│   ├── setup-seo.mjs                (676 LOC) - SEO page generation
│   ├── setup-copy.mjs               (307 LOC) - Landing page copy customization
│   ├── setup-db.mjs                 (173 LOC) - Database setup
│   ├── generate-slice.js            (695 LOC) - Feature generator (VSA)
│   ├── home-generator.mjs           (527 LOC) - Home page content generator
│   ├── project-setup.mjs            (379 LOC) - One-time project configuration
│   ├── validate-architecture.mjs    (237 LOC) - Architecture validation
│   ├── check-links.mjs              (142 LOC) - Link validation
│   ├── pre-commit-check.js          (100 LOC) - Pre-commit checks
│   └── fix-affiliate-setting.sql     (20 LOC) - One-off SQL fix
│
├── /lib/ (2 files, shared utilities)
│   ├── ai-copy-generator.mjs        - Claude AI integration for copywriting
│   └── copy-detector.mjs            - Landing page copy detection
│
├── /generators/ (6 files, 1,830 LOC)
│   ├── email.mjs                    (580 LOC) - Email template generator
│   ├── colors.mjs                   (292 LOC) - Color palette generator
│   ├── landing.mjs                  (251 LOC) - Landing page generator
│   ├── legal.mjs                    (250 LOC) - Legal pages generator
│   ├── generate-home-section.js     (263 LOC) - Home section generator
│   └── assets.mjs                   (194 LOC) - Asset generator
│
└── /setup-script/ (NEW modular system, 13 files, 2,632 LOC)
    ├── index.mjs                    (434 LOC) - New setup entry point
    ├── README.md                    - Comprehensive documentation
    ├── /lib/ (6 files)
    │   ├── menu.mjs                 (437 LOC) - Interactive menu system
    │   ├── verification.mjs         (431 LOC) - Auto-verification logic
    │   ├── utils.mjs                (304 LOC) - Shared utilities
    │   ├── state.mjs                (287 LOC) - State management (.setup.json)
    │   ├── report.mjs               (176 LOC) - Report generation
    │   └── categories.mjs           (79 LOC)  - Category loader
    └── /categories/ (6 files)
        ├── integrations.mjs         (140 LOC) - Stripe, Resend, Sentry
        ├── infrastructure.mjs       (91 LOC)  - Node, Supabase CLI, deps
        ├── content.mjs              (70 LOC)  - Landing, SEO, translations
        ├── database.mjs             (63 LOC)  - DB migrations, types
        ├── branding.mjs             (61 LOC)  - Brand, colors, assets
        └── compliance.mjs           (59 LOC)  - Legal pages, GDPR
```

**Total**: 33 files, ~8,400 LOC

---

## Critical Problems Identified

### 🔴 1. Dual Setup System (CRITICAL)

**Problem**: Two completely different setup systems coexist:

- **Legacy** (`setup.mjs` - 709 LOC): Monolithic, hard to maintain, no progress tracking
- **New** (`setup-script/` - 2,632 LOC): Modular, interactive, state management

**Issue**: The new system **wraps/calls** the old system instead of replacing it:

```javascript
// setup-script/categories/branding.mjs:22
const result = runCommand('node scripts/setup.mjs --brand-only');
```

**Impact**:
- Code duplication (~700 LOC)
- Bug fixes need to happen in TWO places
- Confusing for developers
- Maintenance nightmare

**Solution**: Migrate all logic from `setup.mjs` into `setup-script/categories/` and deprecate legacy.

---

### 🔴 2. Root-Level Clutter

**Problem**: 10+ files mixed at root with unclear responsibilities.

**Impact**:
- Hard to find specific functionality
- No clear organization
- Will become unmanageable as more scripts are added

**Categories mixed together**:
- Setup-related (setup.mjs, setup-seo.mjs, setup-copy.mjs, setup-db.mjs)
- Generators (generate-slice.js, home-generator.mjs, project-setup.mjs)
- Utilities (validate-architecture.mjs, check-links.mjs, pre-commit-check.js)
- One-offs (fix-affiliate-setting.sql)

---

### 🟡 3. Flat Generator Structure

**Current**:
```
/generators/
├── email.mjs
├── colors.mjs
├── landing.mjs
├── legal.mjs
├── generate-home-section.js  ⚠️ Naming inconsistency
└── assets.mjs
```

**Problem**: Won't scale past 10-15 generators.

**Better**:
```
/generators/
├── /content/
├── /branding/
└── /communication/
```

---

### 🟡 4. Inconsistent Naming Conventions

| File | Pattern | Issue |
|------|---------|-------|
| `generate-slice.js` | verb-noun | ✅ Good |
| `home-generator.mjs` | noun-verb | ❌ Inconsistent |
| `setup-seo.mjs` | noun-noun | ❌ Inconsistent |
| `check-links.mjs` | verb-noun | ✅ Good |

**Standard**: Should use **verb-noun.mjs** pattern consistently.

---

### 🟢 5. Missing Top-Level Documentation

**Problem**: No `scripts/README.md` explaining structure and conventions.

**Impact**: New developers don't know where to add new scripts.

---

## Scalability Assessment

**Current Grade**: C+ (60/100)

**What's Working**:
- ✅ `setup-script/` modular architecture is excellent
- ✅ State management with `.setup.json`
- ✅ Interactive menus improve UX
- ✅ Clear separation in `setup-script/lib/` and `setup-script/categories/`

**What's Failing**:
- ❌ Root-level clutter will worsen
- ❌ Legacy `setup.mjs` blocks clean growth
- ❌ Flat `/generators/` won't scale
- ❌ No clear pattern for new scripts

**Prediction**:
- In 6 months: 50+ files at root (unmanageable)
- In 1 year: Developers will create `/scripts/new/` out of frustration

---

## Proposed Solution (3 Phases)

### Phase 1: Critical Refactoring (1 week)

**Proposed Structure**:
```
/scripts/
├── README.md                    ← NEW: Documentation
│
├── /setup/                      ← Rename setup-script/
│   ├── index.mjs
│   ├── /lib/
│   └── /categories/
│
├── /generators/                 ← Reorganize
│   ├── /content/
│   │   ├── generate-landing.mjs
│   │   ├── generate-home.mjs
│   │   ├── generate-seo.mjs
│   │   ├── customize-copy.mjs
│   │   └── generate-legal.mjs
│   ├── /branding/
│   │   ├── generate-colors.mjs
│   │   └── generate-assets.mjs
│   ├── /features/
│   │   └── generate-feature.mjs
│   ├── /communication/
│   │   └── generate-email.mjs
│   └── /lib/
│       ├── ai-copy-generator.mjs
│       └── copy-detector.mjs
│
├── /validation/                 ← NEW
│   ├── validate-architecture.mjs
│   └── check-links.mjs
│
├── /maintenance/                ← NEW
│   └── fix-affiliate-setting.sql
│
└── pre-commit-check.js
```

**Actions**:
1. Migrate `setup.mjs` logic → `setup-script/categories/`
2. Reorganize generators into subdirectories
3. Standardize naming (verb-noun.mjs)
4. Move root scripts to categories
5. Create `README.md` with structure guide
6. Update all npm scripts

**Benefits**:
- Eliminates ~700 LOC duplication
- Clear organization by function
- Scalable to 100+ scripts
- Easy to find functionality

**Effort**: 1 week
**Impact**: HIGH - Resolves all critical issues

---

### Phase 2: Polish & Standardization (3-5 days)

**Actions**:
1. Create interactive generator CLI (like setup system)
2. Standardize error handling
3. Add unit tests for utilities
4. JSDoc documentation

**Effort**: 3-5 days
**Impact**: MEDIUM - Improves developer experience

---

### Phase 3: Advanced Features (1 week)

**Actions**:
1. Full generator CLI with menus
2. Auto-validation before generation
3. Dry-run mode for all generators
4. Unified logging system

**Effort**: 1 week
**Impact**: LOW - Nice to have

---

## Interim Guidelines (Until Refactor)

⚠️ **To prevent making the situation worse**:

### DO ✅

- Add new setup steps to `setup-script/categories/`
- Put new generators in `/generators/` with descriptive names
- Follow verb-noun.mjs naming pattern
- Document complex scripts
- Use the new setup system (`npm run setup`)

### DON'T ❌

- Add more files to scripts/ root
- Modify `setup.mjs` (use `setup-script/` instead)
- Create inconsistent naming patterns
- Mix responsibilities in single files
- Skip documentation

---

## Decision Record

**Date**: 2025-11-21
**Decision**: Postpone refactoring until appropriate time
**Reason**: Current priorities are fixing immediate setup issues and path problems
**Next Review**: When adding 5+ new scripts or in Q1 2026

**Criteria for Starting Refactor**:
- [ ] Setup system is stable and working
- [ ] All path issues resolved
- [ ] No critical bugs pending
- [ ] Dedicated time available (1-2 weeks)
- [ ] Team alignment on changes

---

## Comparison to Best Practices

| Practice | Industry Standard | Current | Target |
|----------|-------------------|---------|--------|
| Grouped by function | ✅ Yes | ❌ No | ✅ Phase 1 |
| Modular architecture | ✅ Yes | ⚠️ Partial | ✅ Phase 1 |
| Consistent naming | ✅ Yes | ❌ No | ✅ Phase 1 |
| Single entry point | ✅ Yes | ❌ Dual | ✅ Phase 1 |
| Documentation | ✅ Yes | ⚠️ Partial | ✅ Phase 1 |
| State management | ⚠️ Optional | ✅ Yes | ✅ Keep |

**Current**: C+ (60/100)
**Target**: A (90+/100)

---

## References

- **setup-script/README.md**: Documentation of new modular system
- **CLAUDE.md**: Overall project architecture and conventions
- **Industry Examples**: Vercel, T3 Stack, Next.js starter templates

---

## Appendix: Migration Checklist (When Ready)

### Pre-Migration
- [ ] Create feature branch
- [ ] Backup current state
- [ ] Document all npm scripts
- [ ] List all external dependencies on scripts

### During Migration
- [ ] Move setup-script/ → setup/
- [ ] Migrate setup.mjs logic to categories
- [ ] Reorganize generators
- [ ] Rename files for consistency
- [ ] Update all import paths
- [ ] Update npm scripts
- [ ] Create README.md
- [ ] Update CLAUDE.md

### Post-Migration
- [ ] Test all scripts manually
- [ ] Verify npm scripts work
- [ ] Update CI/CD if affected
- [ ] Create migration guide
- [ ] Communicate changes to team
- [ ] Monitor for issues

### Deprecation Path
- [ ] Add deprecation warnings to old scripts
- [ ] Maintain aliases in package.json (temporary)
- [ ] Remove legacy after 1 month grace period

---

**Maintainer**: Claude Code
**Last Analysis**: 2025-11-21
**Status**: DOCUMENTED - Awaiting implementation
