import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getUser } from '@/shared/auth';
import { getAllUsers } from '@/features/admin/admin.query';
import { UserList } from '@/features/admin/components/user-list';
import { Users } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.users' });

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.users' });

  // Fetch current user and all users in parallel
  const [user, users] = await Promise.all([getUser(), getAllUsers()]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      {/* User List */}
      <UserList initialUsers={users} currentUserId={user.id} />
    </div>
  );
}
