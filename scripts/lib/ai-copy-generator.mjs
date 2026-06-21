/**
 * AI Copy Generator
 * Uses Claude to generate landing page copy
 */

import { execSync } from 'child_process';

const SYSTEM_PROMPT = `You are an expert SaaS copywriter specializing in conversion-focused landing pages.

Guidelines:
- Write benefits over features (what users achieve, not what the product does)
- Use clear, concise language (5th-grade reading level)
- Create action-oriented CTAs
- SEO-optimize with natural keyword usage
- Maintain conversational, professional tone
- Use active voice

Output: JSON only, no markdown, no explanations.`;

/**
 * Generate home page copy
 * Returns structured content for: hero, features, pricing, cta sections
 */
export async function generateHomeCopy(brandName, tagline, userAnswer) {
  const prompt = `${SYSTEM_PROMPT}

Brand: "${brandName}"
Tagline: "${tagline}"
User description: "${userAnswer}"

Generate complete home page copy for multiple sections. Extract:
- Target audience from description
- Core functionality
- Main benefit/value proposition

Return ONLY this JSON structure (no markdown, no code blocks):
{
  "hero": {
    "badge": "Emoji + 3-5 word positioning statement (e.g., '🚀 AI-Powered Automation')",
    "headline": "Main headline (3-6 words, start with action verb)",
    "headlineHighlight": "Key benefit to emphasize (2-4 words, will be highlighted)",
    "subheadline": "Clear value proposition (max 150 chars, benefit-focused)",
    "ctaPrimary": "Primary CTA button (2-4 words, action-oriented)",
    "ctaSecondary": "Secondary CTA (2-3 words, e.g., 'See Demo')",
    "socialProofText": "Emoji + social proof statement (e.g., '⚡ 500+ teams shipped this month')"
  },
  "features": {
    "headline": "Features section title (5-8 words, benefit-focused)",
    "subheadline": "Why these features matter (max 100 chars)"
  },
  "pricing": {
    "headline": "Pricing section title (4-7 words, value-focused)",
    "subheadline": "Pricing value proposition (max 100 chars)",
    "badge": "Emoji + promo text (e.g., '🔥 Launch Special: 40% OFF')"
  },
  "cta": {
    "headline": "Final CTA headline (4-7 words, urgency)",
    "subheadline": "Final CTA supporting text (max 100 chars)",
    "ctaPrimary": "Primary button (2-4 words)",
    "ctaSecondary": "Secondary button (2-3 words)"
  }
}`;

  return callClaude(prompt);
}

/**
 * Generate about page copy
 */
export async function generateAboutCopy(brandName, userAnswer) {
  const prompt = `${SYSTEM_PROMPT}

Brand: "${brandName}"
User story: "${userAnswer}"

Generate about page copy focused on origin story, mission, and vision.

Return ONLY this JSON structure (no markdown, no code blocks):
{
  "meta": {
    "title": "About Us - ${brandName}",
    "description": "SEO meta description (max 160 chars)"
  },
  "hero": {
    "label": "About Us",
    "titleStart": "Opening words (1-3 words)",
    "titleHighlight": "Key word to emphasize (1-3 words)",
    "description": "Mission statement that captures the why (max 200 chars)"
  },
  "mission": {
    "mission": {
      "title": "Our Mission",
      "description": "What you aim to achieve (2 sentences max)"
    },
    "vision": {
      "title": "Our Vision",
      "description": "Long-term aspiration (2 sentences max)"
    },
    "values": {
      "title": "Our Values",
      "description": "Core principles that guide decisions (2 sentences max)"
    }
  },
  "team": {
    "label": "Our Team",
    "title": "Team section title",
    "description": "Team introduction (1 sentence)"
  },
  "cta": {
    "title": "Call to action section title",
    "description": "CTA description (max 120 chars)",
    "primaryButton": "Primary button text (2-3 words)",
    "secondaryButton": "Secondary button text (2-3 words)"
  }
}`;

  return callClaude(prompt);
}

/**
 * Generate pricing page copy
 */
export async function generatePricingCopy(brandName, userAnswer) {
  const prompt = `${SYSTEM_PROMPT}

Brand: "${brandName}"
Pricing approach: "${userAnswer}"

Generate pricing page header copy.

Return ONLY this JSON structure (no markdown, no code blocks):
{
  "badge": "Short attention text with emoji (3-5 words, e.g., '💎 Simple & Transparent')",
  "title": "Pricing page title (2-5 words)",
  "description": "Pricing philosophy or key message (max 120 chars)"
}`;

  return callClaude(prompt);
}

/**
 * Translate copy to Spanish
 */
export async function translateToSpanish(englishCopy, section) {
  const prompt = `You are a professional translator specializing in SaaS marketing copy.

Translate this ${section} page copy to Spanish.

Maintain:
- Same tone and style
- Same character limits
- Marketing effectiveness
- Natural Spanish (not literal translation)

English copy:
${JSON.stringify(englishCopy, null, 2)}

Return ONLY the translated JSON structure with the same keys.`;

  return callClaude(prompt);
}

/**
 * Call Claude CLI
 */
function callClaude(prompt) {
  try {
    const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, {
      encoding: 'utf-8',
      timeout: 60000, // 60 seconds
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('No JSON found in Claude response');
  } catch (error) {
    throw new Error(`Claude API error: ${error.message}`);
  }
}
