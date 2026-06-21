import { useTranslations } from 'next-intl';

/**
 * Pantalla placeholder de Fase 0 para las secciones aún por construir.
 * Lee los textos del namespace de la ruta (map/pet/stats/me).
 */
export function PlaceholderScreen({ namespace }: { namespace: string }) {
  const t = useTranslations(namespace);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {t('comingSoon')}
      </div>
    </div>
  );
}
