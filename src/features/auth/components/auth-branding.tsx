import Image from 'next/image';
import { Check } from 'lucide-react';

import { brand } from '@/shared/config/brand';
import { BlurFade } from '@/shared/components/ui/blur-fade';
import { DotPattern } from '@/shared/components/ui/dot-pattern';
import { cn } from '@/shared/lib/utils';

export function AuthBranding() {
  const { auth } = brand;

  return (
    <div
      className={cn(
        'relative hidden lg:flex flex-col justify-between p-10 h-full',
        `bg-gradient-to-br ${auth.gradient}`
      )}
    >
      {/* Background pattern */}
      {auth.showPattern && (
        <DotPattern
          className="opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
          cr={1.5}
          cx={1}
          cy={1}
        />
      )}

      {/* Logo and brand name */}
      <BlurFade delay={0.1}>
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src={brand.logo}
            alt={brand.name}
            width={32}
            height={32}
            className="dark:invert"
          />
          <span className="text-xl font-semibold">{brand.name}</span>
        </div>
      </BlurFade>

      {/* Features list */}
      <div className="relative z-10 space-y-6">
        <BlurFade delay={0.2}>
          <h2 className="text-2xl font-semibold tracking-tight">
            {brand.tagline}
          </h2>
        </BlurFade>

        <ul className="space-y-3">
          {auth.features.map((feature, index) => (
            <BlurFade key={feature} delay={0.3 + index * 0.1}>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                {feature}
              </li>
            </BlurFade>
          ))}
        </ul>
      </div>

      {/* Testimonial or copyright */}
      <BlurFade delay={0.6}>
        <div className="relative z-10">
          {auth.showTestimonial ? (
            <blockquote className="space-y-2">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{auth.testimonial.quote}&rdquo;
              </p>
              <footer className="text-sm font-medium">
                {auth.testimonial.author}
                <span className="text-muted-foreground font-normal">
                  {' '}
                  - {auth.testimonial.role}
                </span>
              </footer>
            </blockquote>
          ) : (
            <p className="text-xs text-muted-foreground">{brand.copyright}</p>
          )}
        </div>
      </BlurFade>
    </div>
  );
}
