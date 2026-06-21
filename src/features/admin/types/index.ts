import { z } from 'zod';

/**
 * ==============================================
 * APP SETTINGS TYPES & SCHEMAS
 * ==============================================
 */

/**
 * Info Bar Configuration
 */
export const infoBarSettingsSchema = z.object({
  enabled: z.boolean(),
  scope: z.enum(['all', 'authenticated', 'unauthenticated']),
  mode: z.enum(['info', 'warning', 'error']),
  messages: z.object({
    en: z.string().min(1, 'English message is required'),
    es: z.string().min(1, 'Spanish message is required'),
  }),
  dismissible: z.boolean(),
});

export type InfoBarSettings = z.infer<typeof infoBarSettingsSchema>;

/**
 * Email Journey Configuration
 */
export const emailJourneySchema = z.object({
  enabled: z.boolean(),
  name: z.string(),
  description: z.string(),
});

export type EmailJourney = z.infer<typeof emailJourneySchema>;

export const emailJourneysSettingsSchema = z.record(
  z.string(),
  emailJourneySchema
);

export type EmailJourneysSettings = z.infer<
  typeof emailJourneysSettingsSchema
>;

/**
 * Maintenance Mode Configuration
 */
export const maintenanceSettingsSchema = z.object({
  enabled: z.boolean(),
  messages: z.object({
    en: z.string().min(1, 'English message is required'),
    es: z.string().min(1, 'Spanish message is required'),
  }),
  allowAdmins: z.boolean(),
  estimatedReturn: z.string().nullable(),
});

export type MaintenanceSettings = z.infer<typeof maintenanceSettingsSchema>;

/**
 * Feature Flags
 */
export const featureFlagsSchema = z.record(z.string(), z.boolean());

export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

/**
 * Cross-Sell Product
 */
export const crossSellProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.string(),
  cta: z.string(),
  url: z.string(),
  badge: z.string().nullable(),
});

export type CrossSellProduct = z.infer<typeof crossSellProductSchema>;

export const crossSellProductsSettingsSchema = z.object({
  products: z.array(crossSellProductSchema),
});

export type CrossSellProductsSettings = z.infer<
  typeof crossSellProductsSettingsSchema
>;

/**
 * Crisp Customer Support Settings
 */
export const crispSettingsSchema = z.object({
  enabled: z.boolean(),
  scope: z.enum(['all', 'authenticated', 'unauthenticated', 'subscribers_only']),
  hideOnMobile: z.boolean(),
  position: z.enum(['left', 'right']),
  locale: z.string(),
});

export type CrispSettings = z.infer<typeof crispSettingsSchema>;

/**
 * Affiliate Program Configuration
 */
export const affiliateProgramSettingsSchema = z.object({
  enabled: z.boolean(),
  display_in_header: z.boolean(),
  display_in_footer: z.boolean(),
  display_in_home: z.boolean().default(false),
  rewardful_form_url: z.string().url().optional().or(z.literal('')),
  commission_rate: z.string(),
  webhook_endpoint: z.string().readonly().default('/api/webhooks/rewardful'),
  // Calculator settings
  average_sale_price: z.number().positive().default(297),
  calculator_enabled: z.boolean().default(true),
});

export type AffiliateProgramSettings = z.infer<typeof affiliateProgramSettingsSchema>;

/**
 * Generic App Setting from Database
 */
export interface AppSetting {
  key: string;
  value: Record<string, unknown>;
  category: 'info_bar' | 'email' | 'features' | 'cross_sell' | 'general' | 'support';
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

/**
 * ==============================================
 * ADMIN STATS TYPES
 * ==============================================
 */

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  canceledSubscriptions: number;
  monthlyRecurringRevenue: number;
  newUsersThisMonth: number;
}

/**
 * ==============================================
 * USER MANAGEMENT TYPES
 * ==============================================
 */

export interface AdminUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  user_flags: string[];
  current_organization_id: string | null;
  subscription_status: string | null;
}

export const updateUserFlagsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  flags: z.array(z.string()).min(0, 'Flags must be an array'),
});

export type UpdateUserFlagsInput = z.infer<typeof updateUserFlagsSchema>;

/**
 * ==============================================
 * ACTION RETURN TYPES
 * ==============================================
 */

export interface ActionSuccess<T = void> {
  success: true;
  data: T;
  error: null;
}

export interface ActionError {
  success: false;
  data: null;
  error: string;
}

export type ActionResult<T = void> = ActionSuccess<T> | ActionError;
