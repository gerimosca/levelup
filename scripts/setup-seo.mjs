#!/usr/bin/env node

/**
 * SEO Landing Pages Setup Script
 * Run with: npm run setup:seo
 *
 * Creates foundational SEO landing pages:
 * - Use Case pages (for startups, agencies, etc.)
 * - Alternative page (vs competitor)
 * - How-to hub structure
 */

import { createInterface } from 'readline';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}→ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${'='.repeat(50)}\n  ${msg}\n${'='.repeat(50)}${colors.reset}\n`),
};

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const confirm = async (prompt, defaultYes = true) => {
  const suffix = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await question(`${prompt} ${suffix}: `);
  if (!answer) return defaultYes;
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

// Check if command exists
const commandExists = (cmd) => {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Generate content with Claude
async function generateWithClaude(prompt) {
  try {
    const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, {
      encoding: 'utf-8',
      cwd: rootDir,
      timeout: 60000
    });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    log.warn(`Claude generation failed: ${error.message}`);
    return null;
  }
}

// Convert slug to PascalCase for function names
// Example: "empresas-de-materiales-de-construccion" -> "EmpresasDeMaterialesDeConstruccion"
function slugToPascalCase(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// Page templates
const useCasePageTemplate = (slug) => `import { getTranslations, setRequestLocale } from 'next-intl/server';
import { type Metadata } from 'next';
import { brand } from '@/shared/config/brand';
import Link from 'next/link';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'useCases.${slug}' });

  const title = t('meta.title');
  const description = t('meta.description');

  return {
    title,
    description,
    keywords: t('meta.keywords'),
    openGraph: {
      title,
      description,
      type: 'website',
      url: \`\${brand.company.website}/\${locale}/for/${slug}\`,
    },
    alternates: {
      canonical: \`\${brand.company.website}/\${locale}/for/${slug}\`,
      languages: {
        en: \`\${brand.company.website}/en/for/${slug}\`,
        es: \`\${brand.company.website}/es/for/${slug}\`,
      },
    },
  };
}

export default async function ${slugToPascalCase(slug)}Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('useCases.${slug}');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: t('meta.title'),
            description: t('meta.description'),
          }),
        }}
      />

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-sm font-medium text-primary mb-4 block">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('hero.description')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
              >
                {t('hero.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t('painPoints.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-lg border bg-card">
                <h3 className="text-xl font-semibold mb-2">
                  {t(\`painPoints.items.\${i}.title\`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(\`painPoints.items.\${i}.description\`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('solution.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('solution.description')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta.description')}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition"
            >
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
`;

const alternativePageTemplate = (competitor) => `import { getTranslations, setRequestLocale } from 'next-intl/server';
import { type Metadata } from 'next';
import { brand } from '@/shared/config/brand';
import Link from 'next/link';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'alternative' });

  const title = t('meta.title');
  const description = t('meta.description');

  return {
    title,
    description,
    keywords: t('meta.keywords'),
    openGraph: {
      title,
      description,
      type: 'website',
      url: \`\${brand.company.website}/\${locale}/alternative/${competitor.toLowerCase()}\`,
    },
    alternates: {
      canonical: \`\${brand.company.website}/\${locale}/alternative/${competitor.toLowerCase()}\`,
      languages: {
        en: \`\${brand.company.website}/en/alternative/${competitor.toLowerCase()}\`,
        es: \`\${brand.company.website}/es/alternative/${competitor.toLowerCase()}\`,
      },
    },
  };
}

export default async function AlternativePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('alternative');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: t('meta.title'),
            description: t('meta.description'),
          }),
        }}
      />

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('hero.description')}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              {t('hero.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t('comparison.title')}
          </h2>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b">{t('comparison.feature')}</th>
                  <th className="text-center p-4 border-b">{brand.company.name}</th>
                  <th className="text-center p-4 border-b">${competitor}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="p-4 border-b">{t(\`comparison.features.\${i}.name\`)}</td>
                    <td className="text-center p-4 border-b">{t(\`comparison.features.\${i}.us\`)}</td>
                    <td className="text-center p-4 border-b">{t(\`comparison.features.\${i}.them\`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t('whySwitch.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-lg border bg-card">
                <h3 className="text-xl font-semibold mb-2">
                  {t(\`whySwitch.reasons.\${i}.title\`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(\`whySwitch.reasons.\${i}.description\`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta.description')}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition"
            >
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
`;

// Main setup function
async function setupSeo() {
  log.title('SEO Landing Pages Setup');

  // Check for Claude CLI
  const hasClaude = commandExists('claude');
  if (!hasClaude) {
    log.error('Claude Code CLI is required for this script.');
    log.info('Install with: npm install -g @anthropic-ai/claude-code');
    rl.close();
    process.exit(1);
  }

  log.success('Claude Code CLI found');

  // Step 1: Get business information
  log.step('Business Information');
  console.log('\n');

  const businessDescription = await question('Describe your business in 2-3 sentences:\n> ');
  if (!businessDescription) {
    log.error('Business description is required');
    rl.close();
    process.exit(1);
  }

  // Step 2: Get target personas
  log.step('Target Personas');
  console.log('\n');
  log.info('Enter 3-5 target personas/use cases (comma-separated)');
  log.info('Examples: startups, agencies, freelancers, enterprises, developers\n');

  const personasInput = await question('Target personas: ');
  const personas = personasInput.split(',').map(p => p.trim().toLowerCase()).filter(Boolean);

  if (personas.length === 0) {
    log.warn('No personas provided. Using defaults: startups, agencies, freelancers');
    personas.push('startups', 'agencies', 'freelancers');
  }

  // Step 3: Get competitor for alternative page
  log.step('Competitor Analysis');
  console.log('\n');

  const competitor = await question('Main competitor to compare against (for "Alternative to X" page): ');

  // Step 4: Generate content with Claude
  log.step('Generating SEO content with Claude...');
  console.log('\n');

  // Read existing translations
  const enPath = join(rootDir, 'messages/en.json');
  const esPath = join(rootDir, 'messages/es.json');

  let enMessages = JSON.parse(readFileSync(enPath, 'utf-8'));
  let esMessages = JSON.parse(readFileSync(esPath, 'utf-8'));

  // Generate use case pages
  log.info('Generating Use Case pages...');

  const useCasesPrompt = `Generate SEO landing page content for a SaaS product.

Business: ${businessDescription}
Target personas: ${personas.join(', ')}

For EACH persona, generate content in this exact JSON format:
{
  "personas": {
    "[persona-slug]": {
      "en": {
        "meta": {
          "title": "[Product] for [Persona] - [Benefit]",
          "description": "Max 155 chars describing value for this persona",
          "keywords": "primary keyword, secondary, long-tail"
        },
        "hero": {
          "badge": "For [Persona]",
          "title": "[Main benefit] for [persona]",
          "description": "2-3 sentences on value proposition",
          "cta": "Start Free"
        },
        "painPoints": {
          "title": "Challenges [Persona] Face",
          "items": {
            "1": { "title": "Pain 1", "description": "Description" },
            "2": { "title": "Pain 2", "description": "Description" },
            "3": { "title": "Pain 3", "description": "Description" }
          }
        },
        "solution": {
          "title": "How We Help [Persona]",
          "description": "Solution overview"
        },
        "cta": {
          "title": "Ready to [benefit]?",
          "description": "Final push",
          "button": "Get Started Free"
        }
      },
      "es": {
        // Same structure in Spanish (proper Spanish, no Title Case)
      }
    }
  }
}

Return ONLY valid JSON, no markdown or explanations.`;

  const useCasesContent = await generateWithClaude(useCasesPrompt);

  if (useCasesContent && useCasesContent.personas) {
    // Initialize useCases namespace if not exists
    if (!enMessages.useCases) enMessages.useCases = {};
    if (!esMessages.useCases) esMessages.useCases = {};

    // Create pages and translations for each persona
    for (const [slug, content] of Object.entries(useCasesContent.personas)) {
      // Add translations
      enMessages.useCases[slug] = content.en;
      esMessages.useCases[slug] = content.es;

      // Create page directory and file
      const pageDir = join(rootDir, `src/app/[locale]/(marketing)/for/${slug}`);
      ensureDir(pageDir);
      writeFileSync(join(pageDir, 'page.tsx'), useCasePageTemplate(slug));

      log.success(`Created /for/${slug} page`);
    }
  } else {
    log.warn('Could not generate use case content. Creating placeholder pages.');

    // Create placeholder for each persona
    for (const persona of personas) {
      const slug = persona.replace(/\s+/g, '-');
      const pageDir = join(rootDir, `src/app/[locale]/(marketing)/for/${slug}`);
      ensureDir(pageDir);
      writeFileSync(join(pageDir, 'page.tsx'), useCasePageTemplate(slug));

      // Add placeholder translations
      if (!enMessages.useCases) enMessages.useCases = {};
      if (!esMessages.useCases) esMessages.useCases = {};

      enMessages.useCases[slug] = {
        meta: { title: `For ${persona}`, description: 'TODO', keywords: '' },
        hero: { badge: `For ${persona}`, title: 'TODO', description: 'TODO', cta: 'Get Started' },
        painPoints: { title: 'Challenges', items: { 1: { title: 'TODO', description: 'TODO' }, 2: { title: 'TODO', description: 'TODO' }, 3: { title: 'TODO', description: 'TODO' } } },
        solution: { title: 'Solution', description: 'TODO' },
        cta: { title: 'Get Started', description: 'TODO', button: 'Start Free' }
      };
      esMessages.useCases[slug] = {
        meta: { title: `Para ${persona}`, description: 'TODO', keywords: '' },
        hero: { badge: `Para ${persona}`, title: 'TODO', description: 'TODO', cta: 'Comenzar' },
        painPoints: { title: 'Desafíos', items: { 1: { title: 'TODO', description: 'TODO' }, 2: { title: 'TODO', description: 'TODO' }, 3: { title: 'TODO', description: 'TODO' } } },
        solution: { title: 'Solución', description: 'TODO' },
        cta: { title: 'Comenzar', description: 'TODO', button: 'Empezar gratis' }
      };

      log.success(`Created /for/${slug} page (placeholder)`);
    }
  }

  // Generate alternative page
  if (competitor) {
    log.info('Generating Alternative page...');

    const alternativePrompt = `Generate SEO "Alternative to" page content.

Business: ${businessDescription}
Competitor: ${competitor}

Generate content in this exact JSON format:
{
  "en": {
    "meta": {
      "title": "Best ${competitor} Alternative - [Product Name]",
      "description": "Max 155 chars comparing to ${competitor}",
      "keywords": "${competitor} alternative, ${competitor} vs, better than ${competitor}"
    },
    "hero": {
      "title": "Looking for a ${competitor} Alternative?",
      "description": "Why users switch from ${competitor}",
      "cta": "Try Free"
    },
    "comparison": {
      "title": "How We Compare",
      "feature": "Feature",
      "features": {
        "1": { "name": "Feature 1", "us": "✓", "them": "Limited" },
        "2": { "name": "Feature 2", "us": "✓", "them": "✗" },
        "3": { "name": "Feature 3", "us": "✓", "them": "$$" },
        "4": { "name": "Feature 4", "us": "✓", "them": "✓" },
        "5": { "name": "Feature 5", "us": "✓", "them": "✗" }
      }
    },
    "whySwitch": {
      "title": "Why Users Switch",
      "reasons": {
        "1": { "title": "Reason 1", "description": "Description" },
        "2": { "title": "Reason 2", "description": "Description" },
        "3": { "title": "Reason 3", "description": "Description" }
      }
    },
    "cta": {
      "title": "Ready to Switch?",
      "description": "Final message",
      "button": "Start Free Trial"
    }
  },
  "es": {
    // Same structure in Spanish (proper Spanish capitalization)
  }
}

Return ONLY valid JSON.`;

    const alternativeContent = await generateWithClaude(alternativePrompt);

    if (alternativeContent) {
      enMessages.alternative = alternativeContent.en;
      esMessages.alternative = alternativeContent.es;
    } else {
      // Placeholder
      enMessages.alternative = {
        meta: { title: `${competitor} Alternative`, description: 'TODO', keywords: '' },
        hero: { title: `${competitor} Alternative`, description: 'TODO', cta: 'Try Free' },
        comparison: { title: 'Comparison', feature: 'Feature', features: { 1: { name: 'TODO', us: '✓', them: '✗' }, 2: { name: 'TODO', us: '✓', them: '✗' }, 3: { name: 'TODO', us: '✓', them: '✗' }, 4: { name: 'TODO', us: '✓', them: '✗' }, 5: { name: 'TODO', us: '✓', them: '✗' } } },
        whySwitch: { title: 'Why Switch', reasons: { 1: { title: 'TODO', description: 'TODO' }, 2: { title: 'TODO', description: 'TODO' }, 3: { title: 'TODO', description: 'TODO' } } },
        cta: { title: 'Switch Now', description: 'TODO', button: 'Start Free' }
      };
      esMessages.alternative = {
        meta: { title: `Alternativa a ${competitor}`, description: 'TODO', keywords: '' },
        hero: { title: `Alternativa a ${competitor}`, description: 'TODO', cta: 'Probar gratis' },
        comparison: { title: 'Comparación', feature: 'Función', features: { 1: { name: 'TODO', us: '✓', them: '✗' }, 2: { name: 'TODO', us: '✓', them: '✗' }, 3: { name: 'TODO', us: '✓', them: '✗' }, 4: { name: 'TODO', us: '✓', them: '✗' }, 5: { name: 'TODO', us: '✓', them: '✗' } } },
        whySwitch: { title: 'Por qué cambiar', reasons: { 1: { title: 'TODO', description: 'TODO' }, 2: { title: 'TODO', description: 'TODO' }, 3: { title: 'TODO', description: 'TODO' } } },
        cta: { title: 'Cambia ahora', description: 'TODO', button: 'Empezar gratis' }
      };
    }

    // Create alternative page
    const competitorSlug = competitor.toLowerCase().replace(/\s+/g, '-');
    const altPageDir = join(rootDir, `src/app/[locale]/(marketing)/alternative/${competitorSlug}`);
    ensureDir(altPageDir);
    writeFileSync(join(altPageDir, 'page.tsx'), alternativePageTemplate(competitor));

    log.success(`Created /alternative/${competitorSlug} page`);
  }

  // Save translations
  writeFileSync(enPath, JSON.stringify(enMessages, null, 2) + '\n');
  writeFileSync(esPath, JSON.stringify(esMessages, null, 2) + '\n');
  log.success('Translations saved');

  // Summary
  log.step('SEO Setup Complete!');
  console.log('\n');
  log.success('Created the following pages:');

  for (const persona of personas) {
    const slug = persona.replace(/\s+/g, '-');
    console.log(`  • /for/${slug}`);
  }

  if (competitor) {
    const competitorSlug = competitor.toLowerCase().replace(/\s+/g, '-');
    console.log(`  • /alternative/${competitorSlug}`);
  }

  console.log('\n');
  log.info('Next steps:');
  console.log('  1. Review and customize generated content in messages/*.json');
  console.log('  2. Create OG images for each page in /public/og/');
  console.log('  3. Run npm run dev to preview the pages');
  console.log('  4. Use /for/[slug] URLs in your marketing');
  console.log('\n');

  rl.close();
}

// Run setup
setupSeo().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});
