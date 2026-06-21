'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

import { getErrorMessage } from '@/shared/errors';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { BlurFade } from '@/shared/components/ui/blur-fade';

import { resetPasswordAction } from '../auth.actions';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      formData.append('locale', locale);
      return resetPasswordAction(prevState as null, formData);
    },
    null
  );

  return (
    <BlurFade delay={0.1}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('resetPassword')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('forgotPassword')}
          </p>
        </div>

        {state?.success ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {t('resetPasswordSuccess')}
              </p>
            </div>
            <Link href={`/${locale}/login`}>
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToLogin')}
              </Button>
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div
                className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                role="alert"
              >
                {getErrorMessage(state.error.code, locale)}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">{t('email')}</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="name@example.com"
                defaultValue={state?.email ?? ''}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('sendingResetLink')}
                </>
              ) : (
                t('sendResetLink')
              )}
            </Button>

            <Link
              href={`/${locale}/login`}
              className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToLogin')}
            </Link>
          </form>
        )}
      </div>
    </BlurFade>
  );
}
