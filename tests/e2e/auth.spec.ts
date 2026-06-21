import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flows
 *
 * Prerequisites:
 * - Development server running (npm run dev)
 * - Test user created in Supabase (or use registration test first)
 */

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};

// New user for registration tests (use unique email to avoid conflicts)
const NEW_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'newpassword123',
};

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      // Check form elements are visible
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();

      // Check navigation links
      await expect(page.getByRole('link', { name: /register|sign up/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /forgot|magic link/i })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.click('button[type="submit"]');

      // Check validation messages
      await expect(page.getByText(/email.*required|invalid.*email/i)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL('/dashboard');
    });

    test('should redirect authenticated user to dashboard', async ({ page }) => {
      // First login
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Try to access login page again
      await page.goto('/login');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Registration Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');

      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm.*password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|register|create/i })).toBeVisible();
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="email"]', NEW_USER.email);
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'different123');
      await page.click('button[type="submit"]');

      await expect(page.getByText(/passwords.*match|don't match/i)).toBeVisible();
    });

    test('should show error for weak password', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="email"]', NEW_USER.email);
      await page.fill('input[name="password"]', '123');
      await page.fill('input[name="confirmPassword"]', '123');
      await page.click('button[type="submit"]');

      await expect(page.getByText(/password.*short|minimum|at least/i)).toBeVisible();
    });

    test.skip('should register successfully', async ({ page }) => {
      // Skip by default to avoid creating users on every test run
      await page.goto('/register');

      await page.fill('input[name="email"]', NEW_USER.email);
      await page.fill('input[name="password"]', NEW_USER.password);
      await page.fill('input[name="confirmPassword"]', NEW_USER.password);
      await page.click('button[type="submit"]');

      // Should show success message about email confirmation
      await expect(page.getByText(/check.*email|verify|confirm/i)).toBeVisible();
    });
  });

  test.describe('Magic Link', () => {
    test('should display magic link form', async ({ page }) => {
      await page.goto('/login/magic-link');

      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send|magic/i })).toBeVisible();
    });

    test('should show error for invalid email', async ({ page }) => {
      await page.goto('/login/magic-link');

      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');

      await expect(page.getByText(/invalid.*email/i)).toBeVisible();
    });

    test('should send magic link successfully', async ({ page }) => {
      await page.goto('/login/magic-link');

      await page.fill('input[name="email"]', TEST_USER.email);
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.getByText(/check.*email|sent|link/i)).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should logout successfully', async ({ page }) => {
      // Find and click logout button (could be in dropdown menu)
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i });

      // Check if there's a user menu to open first
      const userMenu = page.getByRole('button', { name: /user|account|profile|menu/i });
      if (await userMenu.isVisible()) {
        await userMenu.click();
      }

      await logoutButton.click();

      // Should redirect to login or home
      await expect(page).toHaveURL(/\/(login|$)/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user to login', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing billing', async ({ page }) => {
      await page.goto('/billing');

      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing my-account', async ({ page }) => {
      await page.goto('/my-account');

      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page reload', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Reload page
      await page.reload();

      // Should still be on dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Internationalization', () => {
    test('should display login page in Spanish', async ({ page }) => {
      await page.goto('/es/login');

      // Check for Spanish text
      await expect(page.getByText(/iniciar sesión|correo|contraseña/i)).toBeVisible();
    });

    test('should switch language on login page', async ({ page }) => {
      await page.goto('/login');

      // Find language switcher
      const langSwitcher = page.getByRole('button', { name: /language|idioma|es|en/i });
      if (await langSwitcher.isVisible()) {
        await langSwitcher.click();

        // Select Spanish
        await page.click('text=Español');

        // URL should change to /es/login
        await expect(page).toHaveURL(/\/es\/login/);
      }
    });
  });
});
