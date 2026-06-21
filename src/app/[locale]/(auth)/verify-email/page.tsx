'use client';

import { useTranslations } from 'next-intl';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import { BlurFade } from '@/shared/components/ui/blur-fade';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <BlurFade delay={0.1}>
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('verifyEmail')}
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t('verifyEmailDescription')}
            </p>
          </div>
        </div>

        <Link href={`/${locale}/login`}>
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToLogin')}
          </Button>
        </Link>
      </div>
    </BlurFade>
  );
}
