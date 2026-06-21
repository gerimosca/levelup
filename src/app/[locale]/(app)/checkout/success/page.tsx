import Link from 'next/link';
import { requireUser } from '@/shared/auth';
import { getSubscription } from '@/features/billing';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface CheckoutSuccessPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutSuccessPage({
  params,
}: CheckoutSuccessPageProps) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const subscription = await getSubscription(user.id);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">
            {subscription ? '🎉' : '⏳'}
          </div>
          <CardTitle className="text-2xl">
            {subscription ? 'Welcome to Pro!' : 'Processing your payment...'}
          </CardTitle>
          <CardDescription>
            {subscription
              ? 'Your subscription is now active. You have access to all premium features.'
              : 'Your payment is being processed. This page will update automatically.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {subscription ? (
            <>
              <Button asChild>
                <Link href={`/${locale}/dashboard`}>Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/billing`}>View Billing Details</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-center text-muted-foreground">
                If this page doesn&apos;t update in a few seconds, please
                refresh or contact support.
              </p>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/checkout/success`}>Refresh Page</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
