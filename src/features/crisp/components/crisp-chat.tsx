'use client';

import { useEffect } from 'react';
import type { CrispSettings, CrispUserData } from '../types';

declare global {
  interface Window {
    $crisp?: any[];
    CRISP_WEBSITE_ID?: string;
  }
}

interface CrispChatProps {
  websiteId: string;
  settings: CrispSettings;
  userData?: CrispUserData;
  locale: string;
}

/**
 * Client component that loads and configures Crisp chat
 */
export function CrispChat({
  websiteId,
  settings,
  userData,
  locale,
}: CrispChatProps) {
  useEffect(() => {
    // Initialize Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    // Configure settings before loading
    const $crisp = window.$crisp;

    // Set position
    $crisp.push(['config', 'position:reverse', settings.position === 'left']);

    // Set locale
    if (locale && locale !== 'auto') {
      $crisp.push(['config', 'locale:value', locale]);
    }

    // Hide on mobile if configured
    if (settings.hideOnMobile) {
      $crisp.push(['config', 'hide:on:mobile', true]);
    }

    // Set user data if authenticated
    if (userData?.email) {
      $crisp.push(['set', 'user:email', userData.email]);
    }
    if (userData?.name) {
      $crisp.push(['set', 'user:nickname', userData.name]);
    }
    if (userData?.userId) {
      $crisp.push(['set', 'session:data', { userId: userData.userId }]);
    }

    // Load Crisp script
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      // Remove Crisp chat widget
      if (window.$crisp) {
        window.$crisp.push(['do', 'chat:hide']);
        window.$crisp.push(['do', 'chat:close']);
      }

      // Remove script
      const crispScript = document.querySelector(
        'script[src="https://client.crisp.chat/l.js"]'
      );
      if (crispScript) {
        crispScript.remove();
      }

      // Clean up global variables
      delete window.$crisp;
      delete window.CRISP_WEBSITE_ID;

      // Remove Crisp DOM elements
      const crispElements = document.querySelectorAll('.crisp-client');
      crispElements.forEach((el) => el.remove());
    };
  }, [websiteId, settings, userData, locale]);

  return null;
}