'use client';

import { useEffect } from 'react';

type StripePricingTableProps = {
  userId: string;
};

export function StripePricingTable({ userId }: StripePricingTableProps) {
  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://js.stripe.com/v3/pricing-table.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    // @ts-expect-error - Stripe custom element
    <stripe-pricing-table
      pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID!}
      publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      client-reference-id={userId}
    />
  );
}

// Type declaration for the custom Stripe element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
          'client-reference-id': string;
        },
        HTMLElement
      >;
    }
  }
}
