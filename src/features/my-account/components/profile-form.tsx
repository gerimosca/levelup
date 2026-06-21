'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { updateProfileAction } from '../my-account.actions';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { ThemeSelect } from '@/shared/components/ui/theme-toggle';
import type { Profile } from '../types';

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations('myAccount');
  const tUI = useTranslations('ui');
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-md">
                {tUI('saved')}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <select
                id="language"
                name="language"
                defaultValue={profile?.language || 'en'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t('timezone')}</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={profile?.timezone || ''}
                placeholder="America/New_York"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={pending}>
              {pending ? '...' : tUI('save')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t('theme')}</Label>
            <ThemeSelect />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
