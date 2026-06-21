'use client';

import { useTranslations } from 'next-intl';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import type { EmailJourneysSettings } from '../types';

interface EmailJourneysControlProps {
  initialJourneys: EmailJourneysSettings;
  locale: string;
}

export function EmailJourneysControl({
  initialJourneys,
  locale,
}: EmailJourneysControlProps) {
  const t = useTranslations('admin.emails');

  if (!initialJourneys) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No email journeys configured yet.
        </p>
      </div>
    );
  }

  const journeys = Object.entries(initialJourneys);

  return (
    <div className="space-y-6">
      {journeys.map(([key, journey]) => (
        <div
          key={key}
          className="rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{journey.name}</h3>
              <p className="text-sm text-muted-foreground">
                {journey.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`journey-${key}`}
                defaultChecked={journey.enabled}
                disabled
              />
              <Label htmlFor={`journey-${key}`} className="sr-only">
                Toggle {journey.name}
              </Label>
            </div>
          </div>
          <div className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Note: Toggle functionality will be implemented with server actions
          </div>
        </div>
      ))}
    </div>
  );
}
