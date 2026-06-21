export interface SerializedPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys?: { p256dh: string; auth: string };
}
