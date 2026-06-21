import type { MetadataRoute } from 'next';
import { brand } from '@/shared/config/brand';

/**
 * Dynamic robots.txt generation
 *
 * Controls which pages search engines and AI bots can crawl.
 * Configuration is read from brand.ts for easy customization.
 *
 * AI Bots included when allowAIBots is true:
 * - GPTBot (OpenAI/ChatGPT)
 * - ChatGPT-User (ChatGPT browse mode)
 * - ClaudeBot (Anthropic/Claude)
 * - PerplexityBot (Perplexity AI)
 * - Google-Extended (Google AI/Bard)
 * - Amazonbot (Alexa)
 * - FacebookBot (Meta AI)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = brand.website.replace(/\/$/, '');

  // Base rules for all user agents
  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: brand.crawlers.disallowPaths,
    },
  ];

  // Add specific rules for AI bots if enabled
  if (brand.crawlers.allowAIBots) {
    const aiBots = [
      'GPTBot',
      'ChatGPT-User',
      'OAI-SearchBot',
      'ClaudeBot',
      'Claude-Web',
      'PerplexityBot',
      'Google-Extended',
      'Amazonbot',
      'FacebookBot',
      'anthropic-ai',
      'Bytespider',
      'CCBot',
      'cohere-ai',
    ];

    // Allow AI bots to crawl public content
    aiBots.forEach((bot) => {
      rules.push({
        userAgent: bot,
        allow: brand.crawlers.allowPaths.length > 0
          ? ['/', ...brand.crawlers.allowPaths]
          : '/',
        disallow: brand.crawlers.disallowPaths,
      });
    });
  } else {
    // Block AI bots if not allowed
    const aiBots = [
      'GPTBot',
      'ChatGPT-User',
      'OAI-SearchBot',
      'ClaudeBot',
      'Claude-Web',
      'PerplexityBot',
      'Google-Extended',
      'Amazonbot',
      'FacebookBot',
      'anthropic-ai',
      'Bytespider',
      'CCBot',
      'cohere-ai',
    ];

    aiBots.forEach((bot) => {
      rules.push({
        userAgent: bot,
        disallow: '/',
      });
    });
  }

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
