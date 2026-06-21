import { NextResponse } from 'next/server';
import { createClientServer } from '@/shared/database/supabase';
import { syncAdminRoleFromWhitelist } from '@/shared/auth/roles';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = await createClientServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync admin role from whitelist on successful login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        await syncAdminRoleFromWhitelist(user.id, user.email);
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
