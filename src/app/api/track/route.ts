import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Create admin client for inserting page views
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Helper to create SHA256 hash
function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, userId, attribution, locale } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Get user agent and create visitor hash (privacy-first)
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const today = new Date().toDateString();
    const visitorHash = sha256(`${userAgent}-${today}`);

    // Get referrer from headers
    const referrer = req.headers.get('referer') || null;

    // Insert page view
    const supabase = createAdminClient();
    const { error } = await supabase.from('page_views').insert({
      visitor_hash: visitorHash,
      user_id: userId || null,
      path,
      utm_source: attribution?.utm_source || null,
      utm_medium: attribution?.utm_medium || null,
      utm_campaign: attribution?.utm_campaign || null,
      utm_term: attribution?.utm_term || null,
      utm_content: attribution?.utm_content || null,
      referrer,
      locale: locale || 'en',
    });

    if (error) {
      console.error('Error tracking page view:', error);
      // Don't return error to client - tracking should not break user experience
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Track API error:', error);
    // Always return success - tracking should be fire-and-forget
    return NextResponse.json({ ok: true });
  }
}