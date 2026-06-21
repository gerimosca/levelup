import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Cliente Stripe perezoso (lazy).
 *
 * Antes, este módulo lanzaba al IMPORTARSE si faltaba STRIPE_SECRET_KEY, lo que
 * tumbaba páginas que no usan Stripe (login, build) en proyectos sin monetización
 * como LevelUp. Ahora la instancia (y la exigencia de la key) se difiere al primer
 * uso real: `stripe.checkout...` sigue funcionando igual cuando hay credenciales.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const instance = getStripe();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
}) as Stripe;

export type { Stripe };
