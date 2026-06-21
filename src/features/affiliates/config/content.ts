/**
 * Affiliate Page Content Configuration
 * All content externalized for easy editing and A/B testing
 */

import type { AffiliatePageContent } from '../types/sections';

export const affiliateContent: AffiliatePageContent = {
  // ============================================
  // HERO SECTION
  // ============================================
  hero: {
    id: 'affiliate-hero',
    enabled: true,
    order: 1,
    content: {
      headline: {
        en: 'Earn Recurring Commissions',
        es: 'Gana Comisiones Recurrentes'
      },
      subheadline: {
        en: 'Join our affiliate program and earn {rate} commission on every referral',
        es: 'Únete a nuestro programa de afiliados y gana {rate} de comisión en cada referido'
      },
      ctaPrimary: {
        text: {
          en: 'Start Earning Today',
          es: 'Empieza a Ganar Hoy'
        },
        href: '#affiliate-form',
        icon: 'ArrowRight'
      },
      subtext: {
        en: 'Free to join • No minimum sales • Monthly payouts',
        es: 'Gratis para unirse • Sin ventas mínimas • Pagos mensuales'
      }
    }
  },

  // ============================================
  // HOW IT WORKS
  // ============================================
  howItWorks: {
    id: 'affiliate-how-it-works',
    enabled: true,
    order: 2,
    content: {
      headline: {
        en: 'Start Earning in 3 Simple Steps',
        es: 'Empieza a Ganar en 3 Simples Pasos'
      },
      steps: [
        {
          number: '1',
          title: {
            en: 'Apply & Get Approved',
            es: 'Solicita y Obtén Aprobación'
          },
          description: {
            en: 'Fill out our quick application form. Instant approval for qualified partners.',
            es: 'Completa nuestro formulario rápido. Aprobación instantánea para socios calificados.'
          },
          icon: 'UserCheck'
        },
        {
          number: '2',
          title: {
            en: 'Share Your Unique Link',
            es: 'Comparte tu Enlace Único'
          },
          description: {
            en: 'Get your personalized referral link and share it with your audience.',
            es: 'Obtén tu enlace de referido personalizado y compártelo con tu audiencia.'
          },
          icon: 'Share2'
        },
        {
          number: '3',
          title: {
            en: 'Earn Monthly Commissions',
            es: 'Gana Comisiones Mensuales'
          },
          description: {
            en: 'Receive automatic monthly payments for all your successful referrals.',
            es: 'Recibe pagos mensuales automáticos por todos tus referidos exitosos.'
          },
          icon: 'Wallet'
        }
      ]
    }
  },

  // ============================================
  // CALCULATOR
  // ============================================
  calculator: {
    id: 'affiliate-calculator',
    enabled: true,
    order: 3,
    content: {
      headline: {
        en: 'Calculate Your Potential Earnings',
        es: 'Calcula tus Ganancias Potenciales'
      },
      subheadline: {
        en: 'See how much you could earn as our affiliate partner',
        es: 'Mira cuánto podrías ganar como nuestro socio afiliado'
      },
      inputLabel: {
        en: 'How many referrals can you make per month?',
        es: '¿Cuántos referidos puedes hacer por mes?'
      },
      outputLabel: {
        en: 'Your Monthly Earnings',
        es: 'Tus Ganancias Mensuales'
      },
      helpText: {
        en: 'Based on ${price} average sale price and {rate} commission',
        es: 'Basado en ${price} precio promedio de venta y {rate} de comisión'
      },
      // These will be overridden by admin settings
      commissionRate: 30,
      averageSalePrice: 297,
      defaultReferrals: 5
    }
  },

  // ============================================
  // BENEFITS
  // ============================================
  benefits: {
    id: 'affiliate-benefits',
    enabled: false, // Not in original design
    order: 4,
    content: {
      headline: {
        en: 'Why Partner With Us?',
        es: '¿Por Qué Asociarte con Nosotros?'
      },
      benefits: [
        {
          icon: 'DollarSign',
          title: {
            en: 'High Commission Rates',
            es: 'Altas Tasas de Comisión'
          },
          description: {
            en: 'Earn competitive commissions on every successful referral',
            es: 'Gana comisiones competitivas en cada referido exitoso'
          },
          highlight: true
        },
        {
          icon: 'RefreshCw',
          title: {
            en: 'Recurring Income',
            es: 'Ingresos Recurrentes'
          },
          description: {
            en: 'Build a sustainable passive income stream with monthly payouts',
            es: 'Construye un flujo de ingresos pasivos sostenible con pagos mensuales'
          }
        },
        {
          icon: 'BarChart3',
          title: {
            en: 'Real-Time Tracking',
            es: 'Seguimiento en Tiempo Real'
          },
          description: {
            en: 'Monitor your performance with our comprehensive dashboard',
            es: 'Monitorea tu rendimiento con nuestro panel completo'
          }
        },
        {
          icon: 'Users',
          title: {
            en: 'Dedicated Support',
            es: 'Soporte Dedicado'
          },
          description: {
            en: 'Get help from our affiliate success team whenever you need it',
            es: 'Obtén ayuda de nuestro equipo de éxito de afiliados cuando lo necesites'
          }
        },
        {
          icon: 'Zap',
          title: {
            en: 'Marketing Materials',
            es: 'Materiales de Marketing'
          },
          description: {
            en: 'Access professional banners, email templates, and more',
            es: 'Accede a banners profesionales, plantillas de email y más'
          }
        },
        {
          icon: 'Shield',
          title: {
            en: 'Trusted Product',
            es: 'Producto Confiable'
          },
          description: {
            en: 'Promote a product your audience will love and trust',
            es: 'Promociona un producto que tu audiencia amará y confiará'
          }
        }
      ]
    }
  },

  // ============================================
  // FAQ
  // ============================================
  faq: {
    id: 'affiliate-faq',
    enabled: true,
    order: 5, // Goes after Application in the original
    content: {
      headline: {
        en: 'Frequently Asked Questions',
        es: 'Preguntas Frecuentes'
      },
      questions: [
        {
          id: 'q1',
          question: {
            en: 'How much do I earn per sale?',
            es: '¿Cuánto gano por cada venta?'
          },
          answer: {
            en: 'You earn {rate} commission on the price paid by each new customer who registers with your coupon or link. The commission applies to their first payments as long as the customer doesn\'t cancel.',
            es: 'Ganas {rate} de comisión sobre el precio pagado por cada cliente nuevo que se registre con tu cupón o enlace. La comisión se aplica a sus primeros pagos siempre y cuando el cliente no se dé de baja.'
          }
        },
        {
          id: 'q2',
          question: {
            en: 'When do I receive my commissions?',
            es: '¿Cuándo cobro mis comisiones?'
          },
          answer: {
            en: 'We pay you when you accumulate at least €50 in commissions. We use PayPal and will contact you to manage it.',
            es: 'Te pagamos cuando acumulas al menos 50 € en comisiones. Usamos PayPal y te contactaremos para gestionarlo.'
          }
        },
        {
          id: 'q3',
          question: {
            en: 'Who should I invite?',
            es: '¿A quién debo invitar?'
          },
          answer: {
            en: 'You should invite businesses that haven\'t used our product yet. They must be new customers without a previous account.',
            es: 'Debes invitar a negocios que aún no hayan usado nuestro producto. Deben ser clientes nuevos sin cuenta previa.'
          }
        },
        {
          id: 'q4',
          question: {
            en: 'How do I track my referrals?',
            es: '¿Cómo sigo mis referidos?'
          },
          answer: {
            en: 'From your personal dashboard, you can see clicks, leads, and conversions in real-time.',
            es: 'Desde tu panel personal puedes ver clics, leads y conversiones en tiempo real.'
          }
        },
        {
          id: 'q5',
          question: {
            en: 'What are the requirements for a referral to count?',
            es: '¿Qué requisitos hay para que cuente un referido?'
          },
          answer: {
            en: 'The person must be new to our platform, use your link or coupon, complete the trial, and make their first payment.',
            es: 'La persona debe ser nueva en nuestra plataforma, usar tu enlace o cupón, completar la prueba y hacer su primer pago.'
          }
        },
        {
          id: 'q6',
          question: {
            en: 'Where do I find my affiliate link?',
            es: '¿Dónde encuentro mi enlace de afiliado?'
          },
          answer: {
            en: 'In your affiliate dashboard, you\'ll find your unique link, coupon code, and tracking stats.',
            es: 'En tu panel de afiliados encontrarás tu enlace único, código de cupón y estadísticas de seguimiento.'
          }
        },
        {
          id: 'q7',
          question: {
            en: 'How do links and coupons work?',
            es: '¿Cómo funcionan los enlaces y cupones?'
          },
          answer: {
            en: 'Your link tracks referrals automatically. Coupons give customers a discount and credit you with the referral.',
            es: 'Tu enlace rastrea referidos automáticamente. Los cupones dan descuento a clientes y te acreditan el referido.'
          }
        },
        {
          id: 'q8',
          question: {
            en: 'What do the dashboard metrics mean?',
            es: '¿Qué significan las métricas del panel?'
          },
          answer: {
            en: 'Visitor = someone who clicked your link. Lead = started signup. Conversion = completed payment.',
            es: 'Visitor = alguien que hizo clic en tu enlace. Lead = comenzó registro. Conversion = completó pago.'
          }
        },
        {
          id: 'q9',
          question: {
            en: 'Why don\'t I see any data yet?',
            es: '¿Por qué no veo datos aún?'
          },
          answer: {
            en: 'Data can take up to 24 hours to update. Make sure people are using your unique link or coupon.',
            es: 'Los datos pueden tardar hasta 24 horas en actualizarse. Asegúrate de que usen tu enlace o cupón único.'
          }
        },
        {
          id: 'q10',
          question: {
            en: 'What makes successful affiliates?',
            es: '¿Qué hace exitosos a los afiliados?'
          },
          answer: {
            en: 'They focus on building trust, provide value to their audience, and consistently share their experience.',
            es: 'Se enfocan en construir confianza, aportan valor a su audiencia y comparten consistentemente su experiencia.'
          }
        }
      ]
    }
  },

  // ============================================
  // APPLICATION
  // ============================================
  application: {
    id: 'affiliate-form',
    enabled: true,
    order: 4,
    content: {
      headline: {
        en: 'Ready to Start Earning?',
        es: '¿Listo para Empezar a Ganar?'
      },
      subheadline: {
        en: 'Apply to become an affiliate partner today',
        es: 'Solicita convertirte en socio afiliado hoy'
      },
      notConfiguredMessage: {
        en: 'The affiliate application form is being set up. Please check back soon.',
        es: 'El formulario de solicitud de afiliados se está configurando. Por favor, vuelve pronto.'
      },
      features: [
        {
          text: {
            en: 'Free to join - no fees ever',
            es: 'Gratis para unirse - sin tarifas nunca'
          },
          icon: 'CheckCircle'
        },
        {
          text: {
            en: 'Instant approval for qualified partners',
            es: 'Aprobación instantánea para socios calificados'
          },
          icon: 'CheckCircle'
        },
        {
          text: {
            en: 'Real-time analytics dashboard',
            es: 'Panel de análisis en tiempo real'
          },
          icon: 'CheckCircle'
        },
        {
          text: {
            en: 'Dedicated affiliate support',
            es: 'Soporte dedicado para afiliados'
          },
          icon: 'CheckCircle'
        }
      ]
    }
  }
};