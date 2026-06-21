'use client';

import { useTranslations } from 'next-intl';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import type { InfoBarSettings as InfoBarSettingsType } from '../types';

interface InfoBarSettingsProps {
  initialSettings: InfoBarSettingsType;
  locale: string;
}

export function InfoBarSettings({
  initialSettings,
  locale,
}: InfoBarSettingsProps) {
  const t = useTranslations('admin.settings');

  if (!initialSettings) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No info bar settings configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Info Bar Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure the global information bar shown across the site
        </p>
      </div>

      {/* Enabled Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="info-bar-enabled">Enabled</Label>
          <p className="text-sm text-muted-foreground">
            Show info bar to users
          </p>
        </div>
        <Switch
          id="info-bar-enabled"
          defaultChecked={initialSettings.enabled}
          disabled
        />
      </div>

      {/* Mode */}
      <div>
        <Label>Mode</Label>
        <div className="mt-2">
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            initialSettings.mode === 'error'
              ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
              : initialSettings.mode === 'warning'
              ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/10 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20'
              : 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20'
          }`}>
            {initialSettings.mode}
          </span>
        </div>
      </div>

      {/* Scope */}
      <div>
        <Label>Scope</Label>
        <div className="mt-2">
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/10 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20">
            {initialSettings.scope}
          </span>
        </div>
      </div>

      {/* Dismissible */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="info-bar-dismissible">Dismissible</Label>
          <p className="text-sm text-muted-foreground">
            Allow users to dismiss the info bar
          </p>
        </div>
        <Switch
          id="info-bar-dismissible"
          defaultChecked={initialSettings.dismissible}
          disabled
        />
      </div>

      {/* Messages */}
      <div className="space-y-3">
        <Label>Messages</Label>
        <div className="space-y-2">
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium mb-1">English:</p>
            <p className="text-sm">{initialSettings.messages.en}</p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium mb-1">Spanish:</p>
            <p className="text-sm">{initialSettings.messages.es}</p>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Note: Edit functionality will be implemented with server actions
      </div>
    </div>
  );
}
