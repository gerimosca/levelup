# AI SaaS Boilerplate

Production-ready boilerplate for AI SaaS applications with Next.js 14+, Supabase, and Stripe.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl (EN/ES)
- **Architecture**: Vertical Slice Architecture (VSA) with CQRS

## Prerequisites

- Node.js 20.9.0 or higher
- npm or pnpm
- Supabase account
- Stripe account

## Getting Started

### Quick Setup (Recommended)

Run the interactive setup wizard that guides you through the entire configuration:

```bash
git clone <repository-url>
cd saas-boilerplate
npm install
npm run setup
```

The wizard will:
- Check prerequisites (Node.js, Stripe CLI, etc.)
- Configure environment variables
- Run database migrations
- Set up Stripe webhooks for local testing
- Start the development server

### Manual Setup

If you prefer to configure manually, follow these steps:

### 1. Clone and install

```bash
git clone <repository-url>
cd saas-boilerplate
npm install
```

### 2. Configure environment

```bash
cp .env .env.local
```

Fill in your environment variables:
- Supabase project credentials
- Stripe API keys
- App URL

### 3. Set up Supabase

1. Create a new Supabase project
2. Link your project and run migrations:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```
3. Enable Email auth provider in Supabase Dashboard (Authentication → Providers)

### 4. Set up Stripe

1. Create products and prices in Stripe Dashboard
2. Create a Pricing Table (Product catalog → Pricing tables)
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Configure Customer Portal (Settings → Billing → Customer portal)
5. Copy keys to `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID`

For detailed Stripe setup, see [Billing README](src/features/billing/README.md).

#### Local Webhook Testing

Use the Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret from the CLI output to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
├── app/                    # Next.js App Router
│   └── [locale]/           # i18n routing
│       ├── (landing)/      # Public pages
│       ├── (app)/          # Protected pages
│       └── (auth)/         # Auth pages
├── features/               # Business features (VSA)
└── shared/                 # Shared infrastructure
```

See [.clinerules](.clinerules) for detailed architecture documentation.

## Features

### Auth
- Email/password login
- Magic link authentication
- Session management
- Protected routes

### Billing
- Stripe Checkout subscriptions
- Stripe Pricing Table integration
- Webhook-based status sync
- Subscription access control
- Customer Portal for self-service

See [Billing README](src/features/billing/README.md) for detailed setup.

### Dashboard
- Stats overview
- User analytics (prepared)

### My Account
- Profile management
- Language preferences
- Timezone settings

### Legal Pages & Compliance

The boilerplate includes a complete legal pages setup with automatic Iubenda integration:

#### Development
- **Terms of Service**: Generated with your company data during setup
- **Privacy Policy**: Basic template (requires Iubenda for production)
- **Cookie Policy**: Basic template (requires Iubenda for production)

#### Production Setup with Iubenda

For production deployments, we recommend using [Iubenda](https://iubenda.com) for automatically maintained, GDPR/CCPA-compliant Privacy and Cookie policies:

**Why Iubenda?**
- Auto-updates when regulations change
- 196 countries covered
- Privacy + Cookie policies included
- Google Consent Mode v2 integrated
- €27/year

**Setup Steps:**

1. Create account at [iubenda.com](https://iubenda.com)
2. Generate Privacy + Cookie policies using their wizard
3. Copy the policy URLs to your `.env.local`:
   ```bash
   NEXT_PUBLIC_IUBENDA_PRIVACY_URL=https://www.iubenda.com/privacy-policy/YOUR_ID
   NEXT_PUBLIC_IUBENDA_COOKIE_URL=https://www.iubenda.com/privacy-policy/YOUR_ID/cookie-policy
   ```
4. Restart your dev server - pages automatically switch to Iubenda content

**Automatic Switching:**
- When Iubenda URLs are configured, `/privacy` and `/cookies` pages load Iubenda policies via iframe
- When not configured, they show basic templates with warnings
- `/terms` always shows your customized Terms of Service

**Cookie Consent Banner:**
- GDPR-compliant consent management included
- Google Consent Mode v2 integrated
- Works with or without Iubenda
- Respects user preferences with localStorage/sessionStorage

See the setup wizard output for detailed legal compliance checklist before production.

## Claude Code Integration

This boilerplate includes optimized configuration for [Claude Code](https://claude.com/claude-code), Anthropic's official CLI for Claude.

### What's included
- Pre-configured slash commands for common tasks
- CLAUDE.md context files for each feature
- Skills with implementation guides
- Auto-approved permissions for npm/npx commands

### Quick commands
```bash
/new-feature [name]    # Create complete feature
/fix-types             # Fix TypeScript errors
/audit                 # Full project audit
```

See [.claude/README.md](.claude/README.md) for full documentation.

## Creating New Features

Use the slice generator:

```bash
npm run generate:slice
```

Enter a name (kebab-case) and it will create the full VSA structure.

## Available Scripts

```bash
npm run setup            # Interactive setup wizard
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run linter
npm run type-check       # Check TypeScript
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run generate:slice   # Generate new feature
npm run stripe:webhooks  # Start Stripe webhook listener
```

## Architecture

This boilerplate uses **Vertical Slice Architecture (VSA)** with **CQRS** patterns:

- **Query**: Read operations (get data from DB)
- **Command**: Write operations (create/update/delete)
- **Handler**: Business logic orchestration
- **Actions**: Next.js Server Actions (entry points)

Each feature is self-contained with its own:
- Components
- Types & schemas
- Business logic
- Server actions

## i18n

Supported languages:
- English (en)
- Spanish (es)

Messages are in `/messages/{locale}.json`. Add new translations there.

## Styling

Using shadcn/ui with Tailwind CSS. Components are in `/src/shared/components/ui/`.

Dark mode is prepared via CSS variables but not active by default.

## Testing

- Unit tests: Vitest + Testing Library
- E2E tests: Playwright

```bash
npm run test          # Unit tests
npm run test:ui       # Unit tests with UI
npm run test:e2e      # E2E tests
npm run test:e2e:ui   # E2E tests with UI
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other platforms

Build with `npm run build` and start with `npm run start`.

## Contributing

1. Create a feature branch
2. Follow the VSA patterns
3. Add translations for new text
4. Write tests if needed
5. Submit PR

## License

ISC
