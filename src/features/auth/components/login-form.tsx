'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getErrorMessage } from '@/shared/errors';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { loginAction } from '../auth.actions';
import { OAuthButtons, hasOAuthProviders } from './oauth-buttons';

export function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      formData.append('locale', locale);
      return loginAction(prevState as null, formData);
    },
    null
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('login')}</CardTitle>
        <CardDescription>
          {t('dontHaveAccount')}{' '}
          <Link href={`/${locale}/register`} className="text-primary hover:underline">
            {t('register')}
          </Link>
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {getErrorMessage(state.error.code, locale)}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              defaultValue={state?.email ?? ''}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Link
            href={`/${locale}/magic-link`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {t('magicLink')}
          </Link>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '...' : t('login')}
          </Button>

          {hasOAuthProviders && (
            <>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('orContinueWith')}
                  </span>
                </div>
              </div>

              <OAuthButtons mode="login" disabled={pending} />
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
