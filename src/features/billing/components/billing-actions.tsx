'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCardIcon, FileTextIcon, SettingsIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type BillingActionsProps = {
  hasSubscription: boolean;
};

export function BillingActions({ hasSubscription }: BillingActionsProps) {
  const t = useTranslations('billing');
  const [loading, setLoading] = useState<string | null>(null);

  const handlePortalAction = async (action?: string) => {
    setLoading(action || 'manage');
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create portal session:', data.error);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setLoading(null);
    }
  };

  if (!hasSubscription) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => handlePortalAction('manage')}
        disabled={loading !== null}
      >
        <SettingsIcon className="h-4 w-4 mr-2" />
        {loading === 'manage' ? '...' : t('manageSubscription')}
      </Button>

      <Button
        variant="outline"
        onClick={() => handlePortalAction('payment')}
        disabled={loading !== null}
      >
        <CreditCardIcon className="h-4 w-4 mr-2" />
        {loading === 'payment' ? '...' : t('paymentMethods')}
      </Button>

      <Button
        variant="outline"
        onClick={() => handlePortalAction('invoices')}
        disabled={loading !== null}
      >
        <FileTextIcon className="h-4 w-4 mr-2" />
        {loading === 'invoices' ? '...' : t('invoices')}
      </Button>
    </div>
  );
}
