import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/shared/database/supabase';
import { locales, defaultLocale } from '@/i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  // Handle Supabase session
  const supabaseResponse = await updateSession(request);

  // If Supabase middleware redirected, return that response
  if (supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse;
  }

  // Handle i18n routing
  const intlResponse = intlMiddleware(request);

  // Copy Supabase cookies to intl response
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    '/',
    '/(en|es)/:path*',
    // Exclude static files and API routes from middleware
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico|api|robots.txt|sitemap.xml|manifest.webmanifest|manifest.json).*)',
  ],
};
