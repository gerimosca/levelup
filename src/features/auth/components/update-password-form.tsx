'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import { getErrorMessage } from '@/shared/errors';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { BlurFade } from '@/shared/components/ui/blur-fade';

import { updatePasswordAction } from '../auth.actions';
import { PasswordInput } from './password-input';

export function UpdatePasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      formData.append('locale', locale);
      return updatePasswordAction(prevState as null, formData);
    },
    null
  );

  return (
    <BlurFade delay={0.1}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('updatePassword')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('newPassword')}
          </p>
        </div>

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
            <Label htmlFor="new-password">{t('newPassword')}</Label>
            <PasswordInput
              id="new-password"
              name="password"
              required
              autoComplete="new-password"
              showStrength
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">{t('confirmPassword')}</Label>
            <PasswordInput
              id="confirm-new-password"
              name="confirmPassword"
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('updatingPassword')}
              </>
            ) : (
              t('updatePassword')
            )}
          </Button>
        </form>
      </div>
    </BlurFade>
  );
}
