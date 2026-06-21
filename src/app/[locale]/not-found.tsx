'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  FadeIn,
  DotPattern,
  AnimatedGradientText,
} from '@/shared/components/magic-ui';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 text-center overflow-hidden">
      <DotPattern className="[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]" />

      <FadeIn>
        <div className="text-8xl md:text-9xl font-bold mb-4">
          <AnimatedGradientText>404</AnimatedGradientText>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          {t('title')}
        </h1>
      </FadeIn>

      <FadeIn delay={0.2}>
        <p className="text-muted-foreground max-w-md mb-8">
          {t('description')}
        </p>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Button size="lg" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            {t('backHome')}
          </Link>
        </Button>
      </FadeIn>
    </div>
  );
}
