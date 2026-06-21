/**
 * Namespace Mapping Rules
 *
 * Define how file paths map to translation namespaces.
 * This enables auto-namespacing based on folder location.
 */

export type NamespaceMapping = {
  pattern: RegExp;
  extractor: (match: RegExpMatchArray) => string;
};

/**
 * Namespace mapping rules (order matters - first match wins)
 */
export const namespaceMappings: NamespaceMapping[] = [
  // ===== NEW: App Router Route-Level Copies (Highest Priority) =====

  // App Router Nested Routes: /src/app/[locale]/(group)/path/to/page/copies/ → full path as namespace
  // Ex: admin/users, admin/emails, etc.
  {
    pattern: /src\/app\/\[locale\]\/\([^\/]+\)\/(.+)\/copies\//,
    extractor: (match) => match[1].replace(/\//g, '-'), // admin/users → admin-users
  },

  // App Router Root of Group: /src/app/[locale]/(landing)/copies/ → group name
  // Ex: (landing)/copies → landing
  {
    pattern: /src\/app\/\[locale\]\/\(([^)]+)\)\/copies\//,
    extractor: (match) => match[1],
  },

  // App Router Catch-all: /src/app/[locale]/[...rest]/copies/ → errors (404 page)
  {
    pattern: /src\/app\/\[locale\]\/\[\.\.\.rest\]\/copies\//,
    extractor: () => 'errors',
  },

  // App Router Shared: /src/app/[locale]/_shared/{type}/copies/ → {type}
  // Ex: _shared/ui → ui, _shared/layouts → layouts
  {
    pattern: /src\/app\/\[locale\]\/_shared\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },

  // ===== LEGACY: Feature-Level Copies (For Migration Compatibility) =====

  // Features: /src/core/features/{feature}/copies/ → {feature}
  {
    pattern: /src\/core\/features\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },

  // My-SaaS Features: /src/my-saas/features/{feature}/copies/ → {feature}
  {
    pattern: /src\/my-saas\/features\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },

  // Shared UI Components: /src/core/shared/components/ui/copies/ → ui
  {
    pattern: /src\/core\/shared\/components\/ui\/copies\//,
    extractor: () => 'ui',
  },

  // Shared Layouts: /src/core/shared/components/layouts/copies/ → layouts
  {
    pattern: /src\/core\/shared\/components\/layouts\/copies\//,
    extractor: () => 'layouts',
  },

  // Shared SEO: /src/core/shared/components/seo/copies/ → seo
  {
    pattern: /src\/core\/shared\/components\/seo\/copies\//,
    extractor: () => 'seo',
  },

  // Shared Legal: /src/core/shared/legal/copies/ → legal
  {
    pattern: /src\/core\/shared\/legal\/copies\//,
    extractor: () => 'legal',
  },

  // Shared Errors: /src/core/shared/errors/copies/ → errors
  {
    pattern: /src\/core\/shared\/errors\/copies\//,
    extractor: () => 'errors',
  },

  // Shared Config: /src/core/shared/config/copies/ → config
  {
    pattern: /src\/core\/shared\/config\/copies\//,
    extractor: () => 'config',
  },

  // Shared Auth: /src/core/shared/auth/copies/ → authShared
  {
    pattern: /src\/core\/shared\/auth\/copies\//,
    extractor: () => 'authShared',
  },

  // Generic shared components: /src/core/shared/components/{module}/copies/ → {module}
  {
    pattern: /src\/core\/shared\/components\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },

  // Fallback: any other /shared/*/copies/ → shared_{module}
  {
    pattern: /src\/core\/shared\/([^\/]+)\/copies\//,
    extractor: (match) => `shared_${match[1]}`,
  },
];

/**
 * Extract namespace from file path
 *
 * @param filePath - Absolute or relative path to a copies file
 * @returns namespace string or null if no match
 *
 * @example
 * extractNamespace('/src/core/features/auth/copies/en.json') // 'auth'
 * extractNamespace('/src/core/shared/components/ui/copies/en.json') // 'ui'
 */
export function extractNamespace(filePath: string): string | null {
  // Normalize path separators
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const mapping of namespaceMappings) {
    const match = normalizedPath.match(mapping.pattern);
    if (match) {
      return mapping.extractor(match);
    }
  }

  return null;
}

/**
 * Validate that a namespace was successfully extracted
 * Throws error if namespace is null (helps catch misconfigurations)
 */
export function validateNamespace(
  filePath: string,
  namespace: string | null
): asserts namespace is string {
  if (!namespace) {
    throw new Error(
      `Failed to extract namespace from path: ${filePath}\n` +
      'This likely means the file is not in a recognized location.\n' +
      'Check namespace-mapping.ts for valid patterns.'
    );
  }
}
