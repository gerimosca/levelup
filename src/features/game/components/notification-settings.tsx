'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { subscribePushAction, unsubscribePushAction, getPushSubscriptionAction } from '../push.actions';
import type { SerializedPushSubscription } from '../push.types';

// Hours offered in the picker (displayed in local time)
const REMINDER_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

function formatLocalHour(h: number): string {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function localToUtcHour(localHour: number): number {
  const offset = new Date().getTimezoneOffset(); // (local - UTC) in minutes, negative for UTC+
  return ((localHour + offset / 60) % 24 + 24) % 24;
}

function utcToLocalHour(utcHour: number): number {
  const offset = new Date().getTimezoneOffset();
  return ((utcHour - offset / 60) % 24 + 24) % 24;
}

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

async function getOrSubscribe(vapidKey: string): Promise<SerializedPushSubscription> {
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing.toJSON() as SerializedPushSubscription;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });
  return sub.toJSON() as SerializedPushSubscription;
}

export function NotificationSettings() {
  const t = useTranslations('settings');
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const [localHour, setLocalHour] = useState(8);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      !!vapidKey;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
  }, [vapidKey]);

  useEffect(() => {
    if (!supported) { setLoading(false); return; }
    getPushSubscriptionAction().then(({ endpoint, reminderHour }) => {
      if (endpoint) {
        setEnabled(true);
        setCurrentEndpoint(endpoint);
        if (reminderHour !== null) {
          setLocalHour(Math.round(utcToLocalHour(reminderHour)));
        }
      }
      setLoading(false);
    });
  }, [supported]);

  const handleEnable = async () => {
    if (!vapidKey) return;
    setSaving(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        toast.error(t('notifications.permissionDenied'));
        return;
      }
      const sub = await getOrSubscribe(vapidKey);
      const utcHour = localToUtcHour(localHour);
      const res = await subscribePushAction(sub, utcHour);
      if (res.success) {
        setEnabled(true);
        setCurrentEndpoint(sub.endpoint);
        toast.success(t('notifications.enabled'));
      }
    } catch {
      toast.error(t('notifications.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!currentEndpoint) return;
    setSaving(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        await sub?.unsubscribe();
      }
      await unsubscribePushAction(currentEndpoint);
      setEnabled(false);
      setCurrentEndpoint(null);
      toast.success(t('notifications.disabled'));
    } finally {
      setSaving(false);
    }
  };

  const handleHourChange = async (h: number) => {
    setLocalHour(h);
    if (!enabled || !currentEndpoint || !vapidKey) return;
    const utcHour = localToUtcHour(h);
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await subscribePushAction(sub.toJSON() as SerializedPushSubscription, utcHour);
  };

  if (!supported || loading) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t('notifications.title')}
      </h2>

      {permission === 'denied' ? (
        <p className="text-xs text-muted-foreground">{t('notifications.permissionDenied')}</p>
      ) : (
        <>
          <button
            type="button"
            onClick={enabled ? handleDisable : handleEnable}
            disabled={saving}
            aria-pressed={enabled}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              {enabled ? (
                <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
              ) : (
                <BellOff className="h-5 w-5" aria-hidden="true" />
              )}
              {enabled ? t('notifications.on') : t('notifications.off')}
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                enabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>

          {enabled && (
            <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t('notifications.timeLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {REMINDER_HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourChange(h)}
                    className="rounded-full border px-3 py-1.5 text-sm transition-colors"
                    style={
                      localHour === h
                        ? {
                            borderColor: 'hsl(var(--primary))',
                            backgroundColor: 'hsl(var(--primary) / 0.15)',
                            color: 'hsl(var(--primary))',
                            fontWeight: 600,
                          }
                        : {}
                    }
                  >
                    {formatLocalHour(h)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
