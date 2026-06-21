/**
 * Spanish error messages
 *
 * Keys are error codes, values are user-friendly messages.
 * Feature-specific messages should be added here when the feature is created.
 */
export const es: Record<string, string> = {
  // Validation errors
  VAL_2001: 'Este campo es obligatorio',
  VAL_2002: 'Por favor, introduce un email válido',
  VAL_2003: 'Formato inválido',
  VAL_2004: 'El valor es demasiado corto',
  VAL_2005: 'El valor es demasiado largo',
  VAL_2006: 'Los valores no coinciden',

  // Database errors
  DB_4001: 'Recurso no encontrado',
  DB_4002: 'Este elemento ya existe',
  DB_4003: 'No se pudo conectar a la base de datos',
  DB_4004: 'La operación de base de datos falló',

  // Generic errors
  ERR_9999: 'Ha ocurrido un error inesperado',
  ERR_9001: 'Error de red. Por favor, verifica tu conexión',
  ERR_9002: 'La solicitud ha expirado. Por favor, inténtalo de nuevo',

  // Auth errors (AUTH_1xxx)
  AUTH_1001: 'Email o contraseña incorrectos',
  AUTH_1002: 'Usuario no encontrado',
  AUTH_1003: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo',
  AUTH_1004: 'No tienes permiso para realizar esta acción',
  AUTH_1005: 'Ya existe una cuenta con este email',
  AUTH_1006: 'No se pudo enviar el enlace mágico. Por favor, inténtalo de nuevo',

  // Billing errors (BILL_3xxx)
  BILL_3001: 'No hay método de pago registrado',
  BILL_3002: 'Has alcanzado tu límite de uso',
  BILL_3003: 'Se requiere una suscripción para esta función',
  BILL_3004: 'El pago falló. Por favor, actualiza tu método de pago',
  BILL_3005: 'No se pudo crear la sesión del portal de facturación',

  // AI errors (AI_5xxx)
  AI_5001: 'Límite de solicitudes excedido. Por favor, espera un momento',
  AI_5002: 'El texto es demasiado largo. Por favor, reduce la longitud',
  AI_5003: 'El contenido fue filtrado debido a restricciones de política',
  AI_5004: 'El modelo de IA no está disponible en este momento',
  AI_5005: 'La solicitud ha expirado. Por favor, inténtalo de nuevo',
  AI_5006: 'Respuesta inválida del modelo de IA',
};
