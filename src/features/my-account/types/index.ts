import { z } from 'zod';
import type { AttributionData } from '@/features/attribution';

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').optional(),
  language: z.enum(['en', 'es']).optional(),
  timezone: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export type Profile = {
  id: string; // Same as auth.users.id
  full_name: string | null;
  avatar_url: string | null;
  language: 'en' | 'es';
  timezone: string | null;
  user_flags: string[];
  current_organization_id: string | null;
  attribution_data: AttributionData;
};
