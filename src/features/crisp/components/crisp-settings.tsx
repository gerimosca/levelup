'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Loader2, MessageSquare, Save } from 'lucide-react';
import type { CrispSettings } from '../types';
import { updateCrispSettingsAction } from '../crisp.actions';

interface CrispSettingsFormProps {
  initialSettings: CrispSettings;
}

export function CrispSettingsForm({ initialSettings }: CrispSettingsFormProps) {
  const t = useTranslations('admin.support');
  const [settings, setSettings] = useState<CrispSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setHasChanges(changed);
  }, [settings, initialSettings]);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCrispSettingsAction(settings);

      if (result.success) {
        toast.success(t('crisp.saved'));
        setHasChanges(false);
      } else {
        toast.error(result.error || t('crisp.saveError'));
      }
    });
  };

  const hasWebsiteId = !!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{t('crisp.title')}</CardTitle>
        </div>
        <CardDescription>
          {hasWebsiteId
            ? t('crisp.description')
            : t('crisp.notConfigured')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasWebsiteId ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {t('crisp.setupInstructions')}
            </p>
            <code className="mt-2 block text-xs">
              NEXT_PUBLIC_CRISP_WEBSITE_ID=your-website-id
            </code>
          </div>
        ) : (
          <>
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">{t('crisp.enabled')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('crisp.enabledHelp')}
                </p>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(enabled) =>
                  setSettings({ ...settings, enabled })
                }
              />
            </div>

            {/* Scope */}
            <div className="space-y-2">
              <Label htmlFor="scope">{t('crisp.scope')}</Label>
              <Select
                value={settings.scope}
                onValueChange={(scope: CrispSettings['scope']) =>
                  setSettings({ ...settings, scope })
                }
              >
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('crisp.scopes.all')}
                  </SelectItem>
                  <SelectItem value="authenticated">
                    {t('crisp.scopes.authenticated')}
                  </SelectItem>
                  <SelectItem value="unauthenticated">
                    {t('crisp.scopes.unauthenticated')}
                  </SelectItem>
                  <SelectItem value="subscribers_only">
                    {t('crisp.scopes.subscribers_only')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('crisp.scopeHelp')}
              </p>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">{t('crisp.position')}</Label>
              <Select
                value={settings.position}
                onValueChange={(position: CrispSettings['position']) =>
                  setSettings({ ...settings, position })
                }
              >
                <SelectTrigger id="position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">
                    {t('crisp.positions.right')}
                  </SelectItem>
                  <SelectItem value="left">
                    {t('crisp.positions.left')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hide on Mobile */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hideOnMobile">{t('crisp.hideOnMobile')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('crisp.hideOnMobileHelp')}
                </p>
              </div>
              <Switch
                id="hideOnMobile"
                checked={settings.hideOnMobile}
                onCheckedChange={(hideOnMobile) =>
                  setSettings({ ...settings, hideOnMobile })
                }
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="locale">{t('crisp.locale')}</Label>
              <Select
                value={settings.locale}
                onValueChange={(locale) =>
                  setSettings({ ...settings, locale })
                }
              >
                <SelectTrigger id="locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    {t('crisp.locales.auto')}
                  </SelectItem>
                  <SelectItem value="en">{t('crisp.locales.en')}</SelectItem>
                  <SelectItem value="es">{t('crisp.locales.es')}</SelectItem>
                  <SelectItem value="fr">{t('crisp.locales.fr')}</SelectItem>
                  <SelectItem value="de">{t('crisp.locales.de')}</SelectItem>
                  <SelectItem value="pt">{t('crisp.locales.pt')}</SelectItem>
                  <SelectItem value="it">{t('crisp.locales.it')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('crisp.localeHelp')}
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('crisp.saving')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('crisp.save')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}