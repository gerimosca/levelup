'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getErrorMessage } from '@/shared/errors';
import { getCurrentAttribution, captureAndPersist } from '@/features/attribution';
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

import { magicLinkAction } from '../auth.actions';

export function MagicLinkForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      formData.append('locale', locale);
      return magicLinkAction(prevState as null, formData);
    },
    null
  );
  const [attributionJson, setAttributionJson] = useState('');

  // Capture attribution on mount
  useEffect(() => {
    captureAndPersist();
    const attribution = getCurrentAttribution();
    setAttributionJson(JSON.stringify(attribution));
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('magicLink')}</CardTitle>
        <CardDescription>
          <Link href={`/${locale}/login`} className="text-primary hover:underline">
            {t('login')}
          </Link>
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        {/* Hidden field for attribution data */}
        <input
          type="hidden"
          name="attribution_data"
          value={attributionJson}
        />
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {getErrorMessage(state.error.code, locale)}
            </div>
          )}
          {state?.success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {t('checkEmail')}
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
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '...' : t('magicLink')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
