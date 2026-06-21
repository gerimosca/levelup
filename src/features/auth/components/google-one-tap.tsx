'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

import { createClient as createClientBrowser } from '@/shared/database/supabase/client';
import { useLastLoginMethod } from '../hooks/use-last-login-method';

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleOneTap() {
  const router = useRouter();
  const locale = useLocale();
  const { setLastMethod } = useLastLoginMethod();

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        const supabase = createClientBrowser();

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) {
          console.error('Google One Tap auth error:', error.message);
          return;
        }

        if (data.user) {
          // Save the last login method
          setLastMethod('google');
          router.push(`/${locale}/home`);
          router.refresh();
        }
      } catch (err) {
        console.error('Google One Tap error:', err);
      }
    },
    [router, locale, setLastMethod]
  );

  useEffect(() => {
    // Don't render if no client ID
    if (!GOOGLE_CLIENT_ID) return;

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false, // Don't auto-login, let user choose
          cancel_on_tap_outside: true,
          context: 'signin',
          itp_support: true, // Better support for Safari ITP
        });

        // Show the One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            // One Tap not displayed - user may have dismissed it before
            // or browser doesn't support it
            console.debug(
              'Google One Tap not displayed:',
              notification.getNotDisplayedReason()
            );
          }
        });
      }
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (window.google) {
        window.google.accounts.id.cancel();
      }
      script.remove();
    };
  }, [handleCredentialResponse]);

  // This component doesn't render anything visible
  // It just loads the script and shows the One Tap prompt
  if (!GOOGLE_CLIENT_ID) return null;

  return null;
}

// Export a flag to check if Google One Tap is configured
export const hasGoogleOneTap = Boolean(GOOGLE_CLIENT_ID);
