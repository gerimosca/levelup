import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClientServer } from '@/shared/database/supabase';
import crypto from 'crypto';

// Types for Rewardful webhook payloads
interface RewardfulReferral {
  id: string;
  affiliate_id: string;
  affiliate_code?: string;
  customer_email: string;
  customer_id?: string;
  status: 'pending' | 'converted' | 'cancelled';
  conversion_amount?: number;
  commission_amount?: number;
  currency?: string;
  created_at: string;
}

interface RewardfulCommission {
  id: string;
  affiliate_id: string;
  referral_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

interface RewardfulWebhookPayload {
  event: string;
  data: RewardfulReferral | RewardfulCommission | any;
}

/**
 * Verify Rewardful webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle Rewardful webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();

    // Get signature from headers
    const headersList = await headers();
    const signature = headersList.get('x-rewardful-signature');

    if (!signature) {
      console.error('Missing Rewardful signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.REWARDFUL_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('REWARDFUL_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error('Invalid Rewardful signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: RewardfulWebhookPayload = JSON.parse(rawBody);

    console.log(`Received Rewardful webhook: ${payload.event}`, {
      event: payload.event,
      data: payload.data,
    });

    // Initialize Supabase client with service role
    const supabase = await createClientServer();

    // Handle different event types
    switch (payload.event) {
      case 'referral.created':
        await handleReferralCreated(supabase, payload.data as RewardfulReferral);
        break;

      case 'referral.converted':
        await handleReferralConverted(supabase, payload.data as RewardfulReferral);
        break;

      case 'referral.cancelled':
        await handleReferralCancelled(supabase, payload.data as RewardfulReferral);
        break;

      case 'commission.created':
        await handleCommissionCreated(supabase, payload.data as RewardfulCommission);
        break;

      case 'commission.paid':
        await handleCommissionPaid(supabase, payload.data as RewardfulCommission);
        break;

      default:
        console.log(`Unhandled Rewardful event: ${payload.event}`);
    }

    // Return success response
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing Rewardful webhook:', error);
    // Return 200 to prevent Rewardful from retrying
    return NextResponse.json(
      { error: 'Internal error', received: true },
      { status: 200 }
    );
  }
}

/**
 * Handle referral.created event
 */
async function handleReferralCreated(
  supabase: any,
  referral: RewardfulReferral
) {
  console.log('Processing referral.created:', referral);

  // Store referral in database
  const { error } = await supabase
    .from('affiliate_referrals')
    .upsert({
      referral_id: referral.id,
      affiliate_id: referral.affiliate_id,
      affiliate_code: referral.affiliate_code,
      customer_email: referral.customer_email,
      status: 'pending',
      event_type: 'referral.created',
      event_data: referral,
    }, {
      onConflict: 'referral_id',
    });

  if (error) {
    console.error('Error storing referral:', error);
  } else {
    console.log('Referral stored successfully');
  }
}

/**
 * Handle referral.converted event
 */
async function handleReferralConverted(
  supabase: any,
  referral: RewardfulReferral
) {
  console.log('Processing referral.converted:', referral);

  // Update referral status
  const { error } = await supabase
    .from('affiliate_referrals')
    .update({
      status: 'converted',
      commission_amount: referral.commission_amount,
      currency: referral.currency,
      event_type: 'referral.converted',
      event_data: referral,
      updated_at: new Date().toISOString(),
    })
    .eq('referral_id', referral.id);

  if (error) {
    console.error('Error updating referral:', error);
  } else {
    console.log('Referral conversion recorded');
  }

  // Optional: Send notification to affiliate about conversion
  // await sendAffiliateNotification(referral.affiliate_id, 'conversion');
}

/**
 * Handle referral.cancelled event
 */
async function handleReferralCancelled(
  supabase: any,
  referral: RewardfulReferral
) {
  console.log('Processing referral.cancelled:', referral);

  // Update referral status
  const { error } = await supabase
    .from('affiliate_referrals')
    .update({
      status: 'cancelled',
      event_type: 'referral.cancelled',
      event_data: referral,
      updated_at: new Date().toISOString(),
    })
    .eq('referral_id', referral.id);

  if (error) {
    console.error('Error cancelling referral:', error);
  } else {
    console.log('Referral cancellation recorded');
  }
}

/**
 * Handle commission.created event
 */
async function handleCommissionCreated(
  supabase: any,
  commission: RewardfulCommission
) {
  console.log('Processing commission.created:', commission);

  // Update referral with commission info
  const { error } = await supabase
    .from('affiliate_referrals')
    .update({
      commission_amount: commission.amount,
      currency: commission.currency,
      event_type: 'commission.created',
      event_data: commission,
      updated_at: new Date().toISOString(),
    })
    .eq('referral_id', commission.referral_id);

  if (error) {
    console.error('Error updating commission:', error);
  } else {
    console.log('Commission recorded');
  }
}

/**
 * Handle commission.paid event
 */
async function handleCommissionPaid(
  supabase: any,
  commission: RewardfulCommission
) {
  console.log('Processing commission.paid:', commission);

  // Update referral status to paid
  const { error } = await supabase
    .from('affiliate_referrals')
    .update({
      status: 'paid',
      event_type: 'commission.paid',
      event_data: commission,
      updated_at: new Date().toISOString(),
    })
    .eq('referral_id', commission.referral_id);

  if (error) {
    console.error('Error updating commission payment:', error);
  } else {
    console.log('Commission payment recorded');
  }

  // Optional: Send notification to affiliate about payment
  // await sendAffiliateNotification(commission.affiliate_id, 'payment');
}