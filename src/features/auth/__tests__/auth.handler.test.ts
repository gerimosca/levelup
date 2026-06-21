import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the command functions
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithMagicLink = vi.fn();
const mockSignOut = vi.fn();

vi.mock('../auth.command', () => ({
  signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
  signUp: (...args: unknown[]) => mockSignUp(...args),
  signInWithMagicLink: (...args: unknown[]) => mockSignInWithMagicLink(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

// Mock syncAdminRoleFromWhitelist to avoid cookies() error
vi.mock('@/shared/auth/roles', () => ({
  syncAdminRoleFromWhitelist: vi.fn().mockResolvedValue(undefined),
}));

import {
  handleLogin,
  handleRegister,
  handleMagicLink,
  handleLogout,
} from '../auth.handler';

describe('auth.handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleLogin', () => {
    it('should login successfully with valid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
        error: null,
      });

      const result = await handleLogin('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.messageKey).toBe('welcomeBack');
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should fail with invalid email format', async () => {
      const result = await handleLogin('invalid-email', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });

    it('should fail with empty password', async () => {
      const result = await handleLogin('test@example.com', '');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });

    it('should fail with wrong credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        user: null,
        error: 'Invalid login credentials',
      });

      const result = await handleLogin('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('handleRegister', () => {
    it('should register successfully with valid data', async () => {
      mockSignUp.mockResolvedValue({ error: null });

      const result = await handleRegister('new@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.messageKey).toBe('checkEmailVerification');
      expect(mockSignUp).toHaveBeenCalledWith(
        {
          email: 'new@example.com',
          password: 'password123',
        },
        undefined,
        undefined
      );
    });

    it('should pass attribution data when provided', async () => {
      mockSignUp.mockResolvedValue({ error: null });

      const attributionData = {
        utm_source: 'google',
        utm_medium: 'cpc',
      };

      await handleRegister('new@example.com', 'password123', attributionData);

      expect(mockSignUp).toHaveBeenCalledWith(
        expect.any(Object),
        attributionData,
        undefined
      );
    });

    it('should fail with weak password', async () => {
      const result = await handleRegister(
        'new@example.com',
        '123' // too short
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should fail when email already exists', async () => {
      mockSignUp.mockResolvedValue({
        error: 'User already registered',
      });

      const result = await handleRegister('existing@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTH_1005'); // EMAIL_EXISTS
    });

    it('should handle generic registration error', async () => {
      mockSignUp.mockResolvedValue({
        error: 'Something went wrong',
      });

      const result = await handleRegister('new@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('handleMagicLink', () => {
    it('should send magic link successfully', async () => {
      mockSignInWithMagicLink.mockResolvedValue({
        success: true,
        error: null,
      });

      const result = await handleMagicLink('test@example.com');

      expect(result.success).toBe(true);
      expect(result.messageKey).toBe('checkEmail');
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        undefined,
        undefined
      );
    });

    it('should pass attribution data when provided', async () => {
      mockSignInWithMagicLink.mockResolvedValue({
        success: true,
        error: null,
      });

      const attributionData = {
        utm_source: 'newsletter',
      };

      await handleMagicLink('test@example.com', attributionData);

      expect(mockSignInWithMagicLink).toHaveBeenCalledWith(
        expect.any(Object),
        attributionData,
        undefined
      );
    });

    it('should fail with invalid email', async () => {
      const result = await handleMagicLink('invalid-email');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSignInWithMagicLink).not.toHaveBeenCalled();
    });

    it('should handle magic link sending error', async () => {
      mockSignInWithMagicLink.mockResolvedValue({
        success: false,
        error: 'Rate limit exceeded',
      });

      const result = await handleMagicLink('test@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTH_1006'); // MAGIC_LINK_FAILED
    });
  });

  describe('handleLogout', () => {
    it('should logout successfully', async () => {
      mockSignOut.mockResolvedValue({
        success: true,
        error: null,
      });

      const result = await handleLogout();

      expect(result.success).toBe(true);
      expect(result.messageKey).toBe('loggedOut');
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      mockSignOut.mockResolvedValue({
        success: false,
        error: 'Session not found',
      });

      const result = await handleLogout();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTH_1003'); // SESSION_EXPIRED
    });
  });
});
