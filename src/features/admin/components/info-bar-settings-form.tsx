'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { updateInfoBarAction } from '../admin.actions';
import type { InfoBarSettings } from '../types';

interface InfoBarSettingsFormProps {
  initialSettings: InfoBarSettings | null;
  locale: string;
}

export function InfoBarSettingsForm({
  initialSettings,
  locale,
}: InfoBarSettingsFormProps) {
  const t = useTranslations('admin.infoBar');
  const [state, action, pending] = useActionState(updateInfoBarAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t('success'));
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  // Default values if no settings exist yet
  const defaults: InfoBarSettings = initialSettings || {
    enabled: false,
    mode: 'info',
    scope: 'all',
    messages: {
      en: '',
      es: '',
    },
    dismissible: true,
  };

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
        {/* Enabled Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled">{t('enabled')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('enabledDescription')}
            </p>
          </div>
          <Switch
            id="enabled"
            name="enabled"
            defaultChecked={defaults.enabled}
          />
        </div>

        {/* Mode Select */}
        <div className="space-y-2">
          <Label htmlFor="mode">{t('mode.label')}</Label>
          <p className="text-sm text-muted-foreground">{t('mode.help')}</p>
          <Select name="mode" defaultValue={defaults.mode}>
            <SelectTrigger id="mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">{t('mode.info')}</SelectItem>
              <SelectItem value="warning">{t('mode.warning')}</SelectItem>
              <SelectItem value="error">{t('mode.error')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scope Select */}
        <div className="space-y-2">
          <Label htmlFor="scope">{t('scope.label')}</Label>
          <p className="text-sm text-muted-foreground">{t('scope.help')}</p>
          <Select name="scope" defaultValue={defaults.scope}>
            <SelectTrigger id="scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('scope.all')}</SelectItem>
              <SelectItem value="authenticated">
                {t('scope.authenticated')}
              </SelectItem>
              <SelectItem value="unauthenticated">
                {t('scope.unauthenticated')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dismissible Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dismissible">{t('dismissible')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('dismissibleDescription')}
            </p>
          </div>
          <Switch
            id="dismissible"
            name="dismissible"
            defaultChecked={defaults.dismissible}
          />
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <Label>{t('messages.label')}</Label>

          {/* English Message */}
          <div className="space-y-2">
            <Label htmlFor="message-en" className="text-sm font-normal">
              {t('messages.en')}
            </Label>
            <Textarea
              id="message-en"
              name="message_en"
              defaultValue={defaults.messages.en}
              placeholder={t('messages.placeholder')}
              rows={3}
            />
          </div>

          {/* Spanish Message */}
          <div className="space-y-2">
            <Label htmlFor="message-es" className="text-sm font-normal">
              {t('messages.es')}
            </Label>
            <Textarea
              id="message-es"
              name="message_es"
              defaultValue={defaults.messages.es}
              placeholder={t('messages.placeholder')}
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={pending}>
            {pending ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
