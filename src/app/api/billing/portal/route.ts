import { NextResponse } from 'next/server';
import { getUser } from '@/shared/auth';
import { handlePortalSession } from '@/features/billing';

export async function POST() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await handlePortalSession(user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.url });
}
