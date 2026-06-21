'use client';

import { useActionState, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { getErrorMessage } from '@/shared/errors';
import {
  getCurrentAttribution,
  captureAndPersist,
} from '@/features/attribution';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { BlurFade } from '@/shared/components/ui/blur-fade';

import { loginAction, registerAction, magicLinkAction } from '../auth.actions';
import { OAuthButtons, hasOAuthProviders } from './oauth-buttons';
import { PasswordInput } from './password-input';
import { useLastLoginMethod, type LoginMethod } from '../hooks/use-last-login-method';

const MAX_LOGIN_ATTEMPTS = 2;

interface AuthTabsProps {
  defaultTab?: 'login' | 'register';
}

export function AuthTabs({ defaultTab = 'login' }: AuthTabsProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const { getLastMethod, setLastMethod } = useLastLoginMethod();
  const [lastMethod, setLastMethodState] = useState<LoginMethod | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [attributionJson, setAttributionJson] = useState('');

  // Auto magic link state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [loginEmail, setLoginEmail] = useState('');
  const [autoMagicLinkSent, setAutoMagicLinkSent] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

  // Login form state
  const [loginState, loginFormAction, loginPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      formData.append('locale', locale);
      // Store email for potential magic link
      const email = formData.get('email') as string;
      setLoginEmail(email);
      return loginAction(prevState as null, formData);
    },
    null
  );

  // Handle failed login attempts - send magic link after MAX_LOGIN_ATTEMPTS
  useEffect(() => {
    if (loginState?.error && loginEmail) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      // Send magic link after too many failed attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS && !autoMagicLinkSent) {
        setSendingMagicLink(true);
        const formData = new FormData();
        formData.append('email', loginEmail);

        magicLinkAction(null, formData).then((result) => {
          setSendingMagicLink(false);
          if (result.success) {
            setAutoMagicLinkSent(true);
          }
        });
      }
    }
  }, [loginState?.error]);

  // Reset attempts when email changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== loginEmail) {
      setFailedAttempts(0);
      setAutoMagicLinkSent(false);
    }
  };

  // Register form state
  const [registerState, registerFormAction, registerPending] = useActionState(
    registerAction,
    null
  );

  // Capture attribution and load last login method on mount
  useEffect(() => {
    captureAndPersist();
    const attribution = getCurrentAttribution();
    setAttributionJson(JSON.stringify(attribution));

    // Load last used login method
    const method = getLastMethod();
    setLastMethodState(method);
  }, [getLastMethod]);

  // Save login method on successful login
  useEffect(() => {
    if (loginState?.success) {
      setLastMethod('email');
    }
  }, [loginState?.success, setLastMethod]);

  // Save login method on successful registration (they'll use email to verify)
  useEffect(() => {
    if (registerState?.success) {
      setLastMethod('email');
    }
  }, [registerState?.success, setLastMethod]);

  const isPending = loginPending || registerPending || sendingMagicLink;

  return (
    <BlurFade delay={0.1}>
      <div className="space-y-6">
        {/* OAuth buttons - most prominent for fewer clicks */}
        {hasOAuthProviders && (
          <>
            <OAuthButtons
              mode={activeTab === 'login' ? 'login' : 'register'}
              disabled={isPending}
              lastMethod={lastMethod}
              onMethodSelect={setLastMethod}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('orContinueWith')}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Tabs for Login/Register */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="relative">
              {t('login')}
              {lastMethod === 'email' && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {t('lastUsed')}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="register">{t('register')}</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4 mt-4">
            <form action={loginFormAction} className="space-y-4">
              {/* Show auto magic link success message */}
              {autoMagicLinkSent && (
                <div
                  className="text-sm text-green-600 bg-green-50 dark:bg-green-950/50 dark:text-green-400 p-3 rounded-md"
                  role="alert"
                >
                  {t('autoMagicLinkSent', { email: loginEmail })}
                </div>
              )}

              {/* Show error only if magic link wasn't sent */}
              {loginState?.error && !autoMagicLinkSent && (
                <div
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                  role="alert"
                >
                  {getErrorMessage(loginState.error.code, locale)}
                  {failedAttempts >= 1 && (
                    <span className="block mt-1 text-xs">
                      {t('tryResetPassword')}{' '}
                      <Link
                        href={`/${locale}/reset-password`}
                        className="underline hover:text-primary"
                      >
                        {t('forgotPassword')}
                      </Link>
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">{t('email')}</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                  onChange={handleEmailChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">{t('password')}</Label>
                  <Link
                    href={`/${locale}/reset-password`}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <PasswordInput
                  id="login-password"
                  name="password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" name="remember" defaultChecked />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground"
                >
                  {t('rememberMe')}
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loginPending || sendingMagicLink || autoMagicLinkSent}>
                {loginPending || sendingMagicLink ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {sendingMagicLink ? t('sendingMagicLink') : t('loggingIn')}
                  </>
                ) : autoMagicLinkSent ? (
                  t('checkEmail')
                ) : (
                  t('login')
                )}
              </Button>

              <div className="text-center">
                <Link
                  href={`/${locale}/magic-link`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {t('loginWithMagicLink')}
                </Link>
              </div>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4 mt-4">
            <form action={registerFormAction} className="space-y-4">
              <input
                type="hidden"
                name="attribution_data"
                value={attributionJson}
              />

              {registerState?.error && (
                <div
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                  role="alert"
                >
                  {getErrorMessage(registerState.error.code, locale)}
                </div>
              )}

              {registerState?.success && (
                <div
                  className="text-sm text-green-600 bg-green-50 dark:bg-green-950/50 dark:text-green-400 p-3 rounded-md"
                  role="alert"
                >
                  {t('checkEmailVerification')}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-email">{t('email')}</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">{t('password')}</Label>
                <PasswordInput
                  id="register-password"
                  name="password"
                  required
                  autoComplete="new-password"
                  showStrength
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerPending}
              >
                {registerPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creatingAccount')}
                  </>
                ) : (
                  t('createAccount')
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </BlurFade>
  );
}
