import { test, expect } from '@playwright/test';

/**
 * E2E tests for billing flows
 *
 * Prerequisites:
 * - Test user account created
 * - Stripe test mode configured
 * - Test products/prices created in Stripe
 */

// Test user credentials (create in Supabase or use test seeding)
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};

test.describe('Billing', () => {
  test.describe('Unauthenticated user', () => {
    test('should redirect to login when accessing billing page', async ({ page }) => {
      await page.goto('/billing');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show pricing table on pricing page', async ({ page }) => {
      await page.goto('/pricing');

      // Pricing table should be visible
      await expect(page.locator('stripe-pricing-table')).toBeVisible();
    });
  });

  test.describe('Authenticated user without subscription', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL('/dashboard');
    });

    test('should show upgrade prompt on billing page', async ({ page }) => {
      await page.goto('/billing');

      // Should show no active subscription message
      await expect(page.getByText(/no active subscription/i)).toBeVisible();

      // Should have link to pricing
      await expect(page.getByRole('link', { name: /view plans/i })).toBeVisible();
    });

    test('should show pricing table with user context', async ({ page }) => {
      await page.goto('/pricing');

      // Pricing table should be visible
      const pricingTable = page.locator('stripe-pricing-table');
      await expect(pricingTable).toBeVisible();

      // Should have client-reference-id attribute (for user tracking)
      await expect(pricingTable).toHaveAttribute('client-reference-id');
    });
  });

  test.describe('Authenticated user with subscription', () => {
    // This test requires a user with an active subscription
    // You can set this up via Stripe test mode or database seeding

    test.skip('should show subscription details on billing page', async ({ page }) => {
      // Login as subscribed user
      await page.goto('/login');
      await page.fill('input[name="email"]', 'subscribed@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/billing');

      // Should show subscription status
      await expect(page.getByText(/active/i)).toBeVisible();

      // Should have manage subscription button
      const manageButton = page.getByRole('button', { name: /manage subscription/i });
      await expect(manageButton).toBeVisible();
    });

    test.skip('should open Stripe Customer Portal', async ({ page }) => {
      // Login as subscribed user
      await page.goto('/login');
      await page.fill('input[name="email"]', 'subscribed@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/billing');

      // Click manage subscription
      await page.click('button:has-text("Manage Subscription")');

      // Should redirect to Stripe Customer Portal
      // Note: In test mode, this will redirect to Stripe's test portal
      await page.waitForURL(/billing\.stripe\.com/);
    });
  });

  test.describe('Checkout flow', () => {
    test.skip('should complete checkout with test card', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Go to pricing
      await page.goto('/pricing');

      // Click on a plan (this will open Stripe Checkout)
      // Note: The exact selector depends on your Pricing Table configuration
      await page.click('text=Subscribe');

      // Wait for Stripe Checkout
      await page.waitForURL(/checkout\.stripe\.com/);

      // Fill test card details
      // Note: In Stripe test mode, use test card 4242 4242 4242 4242
      const stripeFrame = page.frameLocator('iframe[name="embedded-checkout"]');

      await stripeFrame.locator('input[name="cardNumber"]').fill('4242424242424242');
      await stripeFrame.locator('input[name="cardExpiry"]').fill('12/34');
      await stripeFrame.locator('input[name="cardCvc"]').fill('123');
      await stripeFrame.locator('input[name="billingName"]').fill('Test User');

      // Submit payment
      await stripeFrame.locator('button[type="submit"]').click();

      // Should redirect to success page
      await page.waitForURL(/\/checkout\/success/);

      // Verify subscription was created
      await page.goto('/billing');
      await expect(page.getByText(/active/i)).toBeVisible();
    });
  });
});

test.describe('Subscription access control', () => {
  test('should block premium features for free users', async ({ page }) => {
    // Login as free user
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Try to access premium feature
    // Adjust this based on your premium routes
    await page.goto('/premium-feature');

    // Should show upgrade prompt or redirect
    await expect(page.getByText(/upgrade|subscription required/i)).toBeVisible();
  });
});
