// Shared TypeScript types across the application

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  language: 'en' | 'es';
  timezone: string | null;
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};
