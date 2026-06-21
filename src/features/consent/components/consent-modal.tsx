'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Info } from 'lucide-react';
import { useConsent } from '../hooks/use-consent';
import { consentConfig } from '../consent.config';

/**
 * Cookie preferences modal
 *
 * Allows users to customize their cookie preferences by category.
 * Can be opened from the banner or from a "Manage cookies" link.
 */
export function ConsentModal() {
  const t = useTranslations('consent');
  const {
    consent,
    isPreferencesOpen,
    closePreferences,
    updateConsent,
    acceptAll,
    rejectAll,
  } = useConsent();

  const handleSave = () => {
    closePreferences();
  };

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={closePreferences}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>
            {t('modal.description')}{' '}
            <a
              href={consentConfig.policyUrls.privacy}
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('modal.privacyPolicy')}
            </a>
          </DialogDescription>
        </DialogHeader>

        <TooltipProvider>
          <div className="space-y-4 py-4">
            {/* Necessary cookies - always on */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    {t('categories.necessary.name')}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">
                        Required for the site to function. Cannot be disabled.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('categories.necessary.description')}
                </p>
              </div>
              <Switch checked disabled aria-label={t('categories.necessary.name')} />
            </div>

          {/* Marketing cookies - toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <Label
                htmlFor="marketing-consent"
                className="text-sm font-medium"
              >
                {t('categories.marketing.name')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('categories.marketing.description')}
              </p>
            </div>
            <Switch
              id="marketing-consent"
              checked={consent.marketing}
              onCheckedChange={(checked: boolean) => updateConsent('marketing', checked)}
              aria-label={t('categories.marketing.name')}
            />
          </div>
          </div>
        </TooltipProvider>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={rejectAll}
            className="w-full sm:w-auto"
          >
            {t('modal.rejectAll')}
          </Button>
          <Button
            variant="outline"
            onClick={acceptAll}
            className="w-full sm:w-auto"
          >
            {t('modal.acceptAll')}
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {t('modal.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
