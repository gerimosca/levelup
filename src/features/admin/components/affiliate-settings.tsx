'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Copy, Check, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { updateAffiliateProgramSettingsAction } from '../admin.actions';
import type { AffiliateProgramSettings } from '../types';

interface AffiliateSettingsProps {
  initialSettings: AffiliateProgramSettings | null;
}

export function AffiliateSettings({ initialSettings }: AffiliateSettingsProps) {
  const t = useTranslations('admin.affiliates');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<AffiliateProgramSettings>({
    enabled: false,
    display_in_header: false,
    display_in_footer: true,
    display_in_home: false,
    rewardful_form_url: '',
    commission_rate: '30%',
    webhook_endpoint: '/api/webhooks/rewardful',
    average_sale_price: 297,
    calculator_enabled: true,
    ...initialSettings,
  });

  // Get the full webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${settings.webhook_endpoint}`
    : settings.webhook_endpoint;

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast.success(t('webhookCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('webhookCopyFailed'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateAffiliateProgramSettingsAction(settings);

      if (result.success) {
        toast.success(t('saved'));
      } else {
        toast.error(result.error || t('saveFailed'));
      }
    } catch (error) {
      toast.error(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Affiliate Program */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="enabled">{t('enable')}</Label>
              <p className="text-sm text-muted-foreground">{t('enableDescription')}</p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          {/* Display Options */}
          {settings.enabled && (
            <>
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold">{t('displayOptions')}</h3>

                {/* Show in Header */}
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="display_in_header">{t('displayHeader')}</Label>
                  </div>
                  <Switch
                    id="display_in_header"
                    checked={settings.display_in_header}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, display_in_header: checked })
                    }
                  />
                </div>

                {/* Show in Footer */}
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="display_in_footer">{t('displayFooter')}</Label>
                  </div>
                  <Switch
                    id="display_in_footer"
                    checked={settings.display_in_footer}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, display_in_footer: checked })
                    }
                  />
                </div>

                {/* Show on Home Page */}
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="display_in_home">{t('displayHome')}</Label>
                    <p className="text-sm text-muted-foreground">{t('displayHomeHelp')}</p>
                  </div>
                  <Switch
                    id="display_in_home"
                    checked={settings.display_in_home || false}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, display_in_home: checked })
                    }
                  />
                </div>
              </div>

              {/* Rewardful Configuration */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold">{t('rewardfulConfiguration')}</h3>

                {/* Form URL */}
                <div className="space-y-2">
                  <Label htmlFor="rewardful_form_url">{t('rewardfulUrl')}</Label>
                  <Input
                    id="rewardful_form_url"
                    type="url"
                    placeholder="https://yourapp.getrewardful.com/signup"
                    value={settings.rewardful_form_url}
                    onChange={(e) =>
                      setSettings({ ...settings, rewardful_form_url: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">{t('rewardfulUrlHelp')}</p>
                </div>

                {/* Commission Rate */}
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">{t('commissionRate')}</Label>
                  <Input
                    id="commission_rate"
                    type="text"
                    placeholder="30%"
                    value={settings.commission_rate}
                    onChange={(e) =>
                      setSettings({ ...settings, commission_rate: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">{t('commissionRateHelp')}</p>
                </div>

                {/* Average Sale Price */}
                <div className="space-y-2">
                  <Label htmlFor="average_sale_price">{t('averageSalePrice')}</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">€</span>
                    <Input
                      id="average_sale_price"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="297"
                      value={settings.average_sale_price}
                      onChange={(e) =>
                        setSettings({ ...settings, average_sale_price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{t('averageSalePriceHelp')}</p>
                </div>

                {/* Calculator Enabled */}
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="calculator_enabled">{t('calculatorEnabled')}</Label>
                    <p className="text-sm text-muted-foreground">{t('calculatorEnabledHelp')}</p>
                  </div>
                  <Switch
                    id="calculator_enabled"
                    checked={settings.calculator_enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, calculator_enabled: checked })
                    }
                  />
                </div>

                {/* Webhook Endpoint */}
                <div className="space-y-2">
                  <Label>{t('webhookEndpoint')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyWebhook}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('webhookEndpointHelp')}</p>
                </div>
              </div>

              {/* Instructions */}
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm">
                  <strong>{t('setupInstructions')}</strong>
                  <ol className="mt-2 list-inside list-decimal space-y-1">
                    <li>{t('instruction1')}</li>
                    <li>{t('instruction2')}</li>
                    <li>{t('instruction3')}</li>
                    <li>{t('instruction4')}</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}