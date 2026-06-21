import { z } from 'zod';

/**
 * Crisp Settings Schema
 */
export const crispSettingsSchema = z.object({
  enabled: z.boolean(),
  scope: z.enum(['all', 'authenticated', 'unauthenticated', 'subscribers_only']),
  hideOnMobile: z.boolean(),
  position: z.enum(['left', 'right']),
  locale: z.string(), // 'auto' or specific locale like 'en', 'es'
});

export type CrispSettings = z.infer<typeof crispSettingsSchema>;

/**
 * Default Crisp Settings
 */
export const defaultCrispSettings: CrispSettings = {
  enabled: false,
  scope: 'all',
  hideOnMobile: false,
  position: 'right',
  locale: 'auto',
};

/**
 * Crisp User Data (for authenticated users)
 */
export interface CrispUserData {
  email?: string;
  name?: string;
  userId?: string;
  segments?: string[];
  data?: Record<string, unknown>;
}