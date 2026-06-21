'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import { BlurFade } from '@/shared/components/ui/blur-fade';

export default function AuthErrorPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const errorDescription = searchParams.get('error_description');

  return (
    <BlurFade delay={0.1}>
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('authError')}
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              {errorDescription || t('authErrorDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link href={`/${locale}/login`}>
            <Button className="w-full">{t('tryAgain')}</Button>
          </Link>
          <Link href={`/${locale}`}>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    </BlurFade>
  );
}
