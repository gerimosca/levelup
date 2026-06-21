/**
 * Home Page Content Configuration
 * Optimized for conversion with focus on AI-Native and Growth features
 * This file will be replaced by database content in the future
 */

import type { HomePageContent } from '../types/sections';
import editableContent from './editable-content.json';

export const homeContent: HomePageContent = {
  // ============================================
  // HERO SECTION - First impression matters
  // ============================================
  hero: {
    id: 'hero-main',
    enabled: true,
    order: 1,
    content: {
      badge: {
        text: editableContent.hero.badge,
        icon: 'Sparkles'
      },
      headline: editableContent.hero.headline,
      headlineHighlight: editableContent.hero.headlineHighlight,
      subheadline: editableContent.hero.subheadline,
      ctaPrimary: {
        text: editableContent.hero.ctaPrimary,
        href: '/register',
        style: 'default',
        icon: 'ArrowRight'
      },
      ctaSecondary: {
        text: editableContent.hero.ctaSecondary,
        href: '#demo',
        style: 'outline'
      },
      trustBadges: [
        { text: 'Claude Code Optimized', icon: 'Bot', highlighted: true },
        { text: 'Stripe Verified Partner', icon: 'CreditCard' },
        { text: 'GDPR & SOC2 Ready', icon: 'Shield' }
      ],
      socialProofText: editableContent.hero.socialProofText,
      backgroundEffect: 'dots'
    }
  },

  // ============================================
  // PROBLEM/SOLUTION - Why they need this
  // ============================================
  problemSolution: {
    id: 'problem-solution',
    enabled: true,
    order: 2,
    content: {
      headline: {
        en: 'Stop Wasting Time on Boilerplate',
        es: 'Deja de Perder Tiempo en Boilerplate'
      },
      problem: {
        title: {
          en: 'Traditional Approach',
          es: 'Enfoque Tradicional'
        },
        points: [
          {
            id: 'p1',
            text: {
              en: '6 months building authentication',
              es: '6 meses construyendo autenticación'
            },
            icon: 'X'
          },
          {
            id: 'p2',
            text: {
              en: 'Weeks integrating Stripe billing',
              es: 'Semanas integrando Stripe'
            },
            icon: 'X'
          },
          {
            id: 'p3',
            text: {
              en: 'No admin panel or analytics',
              es: 'Sin panel admin ni analytics'
            },
            icon: 'X'
          },
          {
            id: 'p4',
            text: {
              en: 'Starting from scratch every time',
              es: 'Empezar desde cero cada vez'
            },
            icon: 'X'
          }
        ],
        timeEstimate: {
          en: '6+ months to first customer',
          es: '6+ meses hasta el primer cliente'
        }
      },
      solution: {
        title: {
          en: 'With Our Boilerplate',
          es: 'Con Nuestro Boilerplate'
        },
        points: [
          {
            id: 's1',
            text: {
              en: 'Auth, billing, admin ready in 5 minutes',
              es: 'Auth, billing, admin listo en 5 minutos'
            },
            icon: 'Check'
          },
          {
            id: 's2',
            text: {
              en: 'Claude Code commands for everything',
              es: 'Comandos Claude Code para todo'
            },
            icon: 'Check'
          },
          {
            id: 's3',
            text: {
              en: 'A/B testing & email journeys built-in',
              es: 'A/B testing y email journeys integrado'
            },
            icon: 'Check'
          },
          {
            id: 's4',
            text: {
              en: 'Ship features, not infrastructure',
              es: 'Envía features, no infraestructura'
            },
            icon: 'Check'
          }
        ],
        timeEstimate: {
          en: '3 days to paying customers',
          es: '3 días hasta clientes pagando'
        }
      }
    } as any
  },

  // ============================================
  // FEATURES - Organized by value proposition
  // ============================================
  features: {
    id: 'features-main',
    enabled: true,
    order: 3,
    content: {
      headline: editableContent.features.headline,
      subheadline: editableContent.features.subheadline,
      layout: 'grid',
      features: [
        // AI-First Features (Unique selling points)
        {
          id: 'claude-code',
          icon: 'Bot',
          title: {
            en: 'Claude Code Native',
            es: 'Claude Code Nativo'
          },
          description: {
            en: 'Custom commands, MCP tools, and AI-optimized architecture. Generate features with one command',
            es: 'Comandos personalizados, herramientas MCP, y arquitectura optimizada para IA. Genera features con un comando'
          },
          highlight: true,
          badge: {
            en: 'AI-Powered',
            es: 'Con IA'
          }
        },
        {
          id: 'ab-testing',
          icon: 'TrendingUp',
          title: {
            en: 'One-Click A/B Testing',
            es: 'A/B Testing en Un Click'
          },
          description: {
            en: 'Test variations without code. Edit content from admin panel, see what converts better',
            es: 'Prueba variaciones sin código. Edita contenido desde el panel admin, ve qué convierte mejor'
          },
          highlight: true,
          badge: {
            en: 'Exclusive',
            es: 'Exclusivo'
          }
        },

        // Growth Features
        {
          id: 'email-journeys',
          icon: 'Mail',
          title: {
            en: 'Email Journey Control',
            es: 'Control de Email Journeys'
          },
          description: {
            en: 'Toggle welcome series, trial reminders, and retention emails from admin panel',
            es: 'Activa series de bienvenida, recordatorios de trial, y emails de retención desde el panel'
          },
          badge: {
            en: 'Growth',
            es: 'Growth'
          }
        },
        {
          id: 'info-bar',
          icon: 'Megaphone',
          title: {
            en: 'Global Announcement Bar',
            es: 'Barra de Anuncios Global'
          },
          description: {
            en: 'Show maintenance alerts, promotions, or urgent messages. Configurable per user segment',
            es: 'Muestra alertas de mantenimiento, promociones, o mensajes urgentes. Configurable por segmento'
          }
        },

        // Core Infrastructure
        {
          id: 'auth',
          icon: 'Shield',
          title: {
            en: 'Complete Auth System',
            es: 'Sistema Auth Completo'
          },
          description: {
            en: 'Magic links, OAuth (Google, GitHub), email/password, and role-based access control',
            es: 'Magic links, OAuth (Google, GitHub), email/contraseña, y control de acceso basado en roles'
          }
        },
        {
          id: 'billing',
          icon: 'CreditCard',
          title: {
            en: 'Stripe Subscriptions',
            es: 'Suscripciones Stripe'
          },
          description: {
            en: 'Pricing tables, customer portal, webhooks, and attribution tracking configured',
            es: 'Tablas de precios, portal de cliente, webhooks, y tracking de atribución configurado'
          }
        },
        {
          id: 'admin',
          icon: 'Settings',
          title: {
            en: 'Admin Dashboard',
            es: 'Panel de Administración'
          },
          description: {
            en: 'View MRR, manage users, configure features, see analytics. No external tools needed',
            es: 'Ve MRR, gestiona usuarios, configura features, ve analytics. Sin herramientas externas'
          },
          badge: {
            en: 'Complete',
            es: 'Completo'
          }
        },
        {
          id: 'database',
          icon: 'Database',
          title: {
            en: 'Supabase + RLS',
            es: 'Supabase + RLS'
          },
          description: {
            en: 'PostgreSQL with Row Level Security. Real-time subscriptions and edge functions ready',
            es: 'PostgreSQL con Row Level Security. Suscripciones real-time y edge functions listas'
          }
        },
        {
          id: 'i18n',
          icon: 'Globe',
          title: {
            en: 'Multi-language Ready',
            es: 'Multi-idioma Listo'
          },
          description: {
            en: 'English and Spanish included. SEO-optimized URLs and content per language',
            es: 'Inglés y español incluidos. URLs y contenido optimizado para SEO por idioma'
          }
        }
      ]
    }
  },

  // ============================================
  // HOW IT WORKS - Simple steps
  // ============================================
  howItWorks: {
    id: 'how-it-works',
    enabled: true,
    order: 4,
    content: {
      headline: {
        en: 'From Zero to Production in Minutes',
        es: 'De Cero a Producción en Minutos'
      },
      subheadline: {
        en: 'Literally. We timed it.',
        es: 'Literalmente. Lo cronometramos.'
      },
      layout: 'timeline',
      steps: [
        {
          id: 'step-1',
          number: '01',
          title: {
            en: 'Clone & Setup',
            es: 'Clonar y Configurar'
          },
          description: {
            en: 'Run our setup script. It configures everything: database, environment variables, dependencies',
            es: 'Ejecuta nuestro script de setup. Configura todo: base de datos, variables de entorno, dependencias'
          },
          icon: 'Download'
        },
        {
          id: 'step-2',
          number: '02',
          title: {
            en: 'Connect Stripe',
            es: 'Conectar Stripe'
          },
          description: {
            en: 'Add your pricing table ID. Webhooks are pre-configured. Start accepting payments immediately',
            es: 'Añade tu ID de tabla de precios. Los webhooks están preconfigurados. Acepta pagos inmediatamente'
          },
          icon: 'CreditCard'
        },
        {
          id: 'step-3',
          number: '03',
          title: {
            en: 'Deploy to Vercel',
            es: 'Deploy a Vercel'
          },
          description: {
            en: 'One command deploys everything. Automatic CI/CD, preview environments, and edge optimization',
            es: 'Un comando despliega todo. CI/CD automático, entornos de preview, y optimización edge'
          },
          icon: 'Rocket'
        },
        {
          id: 'step-4',
          number: '04',
          title: {
            en: 'Start Shipping Features',
            es: 'Empieza a Enviar Features'
          },
          description: {
            en: 'Use Claude Code commands to generate CRUD, components, and entire features. Ship daily',
            es: 'Usa comandos de Claude Code para generar CRUD, componentes, y features completas. Envía diariamente'
          },
          icon: 'Zap'
        }
      ]
    } as any
  },

  // ============================================
  // TECH STACK - Show modern stack
  // ============================================
  techStack: {
    id: 'tech-stack',
    enabled: true,
    order: 5,
    content: {
      headline: {
        en: 'Built with the Latest and Greatest',
        es: 'Construido con lo Último y Mejor'
      },
      subheadline: {
        en: 'Production-proven technologies that scale',
        es: 'Tecnologías probadas en producción que escalan'
      },
      categories: [
        {
          id: 'frontend',
          name: {
            en: 'Frontend',
            es: 'Frontend'
          },
          technologies: [
            { name: 'Next.js', logo: 'NextJS', version: '15.0', badge: { en: 'Latest', es: 'Última' } },
            { name: 'React', logo: 'React', version: '19.0' },
            { name: 'TypeScript', logo: 'TypeScript', version: '5.0' },
            { name: 'Tailwind CSS', logo: 'TailwindCSS', version: '3.4' }
          ]
        },
        {
          id: 'backend',
          name: {
            en: 'Backend & Database',
            es: 'Backend y Base de Datos'
          },
          technologies: [
            { name: 'Supabase', logo: 'Supabase', badge: { en: 'Auth + DB', es: 'Auth + BD' } },
            { name: 'PostgreSQL', logo: 'PostgreSQL', version: '15' },
            { name: 'Stripe', logo: 'Stripe', badge: { en: 'Payments', es: 'Pagos' } },
            { name: 'Resend', logo: 'Mail', badge: { en: 'Emails', es: 'Emails' } }
          ]
        },
        {
          id: 'dx',
          name: {
            en: 'Developer Experience',
            es: 'Experiencia de Desarrollo'
          },
          technologies: [
            { name: 'Claude Code', logo: 'Bot', badge: { en: 'AI-Native', es: 'IA-Nativo' } },
            { name: 'Shadcn/ui', logo: 'Component', badge: { en: 'UI Library', es: 'Librería UI' } },
            { name: 'Magic UI', logo: 'Sparkles', badge: { en: 'Animations', es: 'Animaciones' } },
            { name: 'Vitest', logo: 'TestTube', badge: { en: 'Testing', es: 'Testing' } }
          ]
        }
      ],
      showVersions: true
    } as any
  },

  // ============================================
  // SOCIAL PROOF - Trust signals
  // ============================================
  socialProof: {
    id: 'social-proof',
    enabled: true,
    order: 6,
    content: {
      type: 'stats',
      headline: {
        en: 'Built by Developers Who Ship',
        es: 'Construido por Desarrolladores que Envían'
      },
      subheadline: {
        en: 'We\'ve built and scaled 20+ SaaS products. This is everything we wished we had',
        es: 'Hemos construido y escalado 20+ productos SaaS. Esto es todo lo que deseábamos tener'
      },
      items: [
        {
          id: 'speed',
          type: 'stat',
          content: {
            value: '10x',
            label: {
              en: 'Faster Development',
              es: 'Desarrollo Más Rápido'
            },
            trend: 'up'
          } as any
        },
        {
          id: 'components',
          type: 'stat',
          content: {
            value: '50+',
            label: {
              en: 'Pre-built Components',
              es: 'Componentes Pre-construidos'
            }
          } as any
        },
        {
          id: 'setup',
          type: 'stat',
          content: {
            value: '<5',
            label: {
              en: 'Minutes to Setup',
              es: 'Minutos para Setup'
            },
            suffix: 'min'
          } as any
        },
        {
          id: 'saves',
          type: 'stat',
          content: {
            value: '$47K',
            label: {
              en: 'Average Dev Cost Saved',
              es: 'Costo de Dev Ahorrado'
            },
            prefix: '$'
          } as any
        }
      ]
    }
  },

  // ============================================
  // PRICING - Stripe integration
  // ============================================
  pricing: {
    id: 'pricing-main',
    enabled: true,
    order: 7,
    content: {
      headline: editableContent.pricing.headline,
      subheadline: editableContent.pricing.subheadline,
      stripePricingTableId: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || '',
      stripePricingTablePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      showComparison: true,
      badge: {
        text: editableContent.pricing.badge,
        variant: 'destructive'
      }
    }
  },

  // ============================================
  // AFFILIATE MODULE - Partner program
  // ============================================
  affiliateModule: {
    id: 'affiliate-module',
    enabled: false, // Controlled from admin panel
    order: 7.5,
    content: {
      badge: {
        text: {
          en: '💰 Partner Program',
          es: '💰 Programa de Socios'
        },
        variant: 'secondary'
      },
      headline: {
        en: 'Earn Recurring Commissions',
        es: 'Gana Comisiones Recurrentes'
      },
      subheadline: {
        en: 'Join our affiliate program and earn 30% commission on every referral',
        es: 'Únete a nuestro programa de afiliados y gana 30% de comisión en cada referido'
      },
      features: [
        {
          icon: 'DollarSign',
          title: {
            en: 'High Commissions',
            es: 'Altas Comisiones'
          },
          description: {
            en: '30% recurring commission on all referred customers',
            es: '30% de comisión recurrente en todos los clientes referidos'
          }
        },
        {
          icon: 'TrendingUp',
          title: {
            en: 'Passive Income',
            es: 'Ingresos Pasivos'
          },
          description: {
            en: 'Build a sustainable revenue stream with monthly payouts',
            es: 'Construye un flujo de ingresos sostenible con pagos mensuales'
          }
        },
        {
          icon: 'Users',
          title: {
            en: 'Full Support',
            es: 'Soporte Completo'
          },
          description: {
            en: 'Get marketing materials and dedicated affiliate support',
            es: 'Obtén materiales de marketing y soporte dedicado para afiliados'
          }
        }
      ],
      stats: [
        {
          value: {
            en: '€2,500',
            es: '€2,500'
          },
          label: {
            en: 'Avg. Monthly Earnings',
            es: 'Ganancias Mensuales Prom.'
          }
        },
        {
          value: {
            en: '30%',
            es: '30%'
          },
          label: {
            en: 'Commission Rate',
            es: 'Tasa de Comisión'
          }
        },
        {
          value: {
            en: '500+',
            es: '500+'
          },
          label: {
            en: 'Active Partners',
            es: 'Socios Activos'
          }
        }
      ],
      cta: {
        text: {
          en: 'Become a Partner',
          es: 'Hazte Socio'
        },
        href: '/affiliates'
      },
      ctaSubtext: {
        en: 'Free to join • No minimum sales • Monthly payouts',
        es: 'Gratis para unirse • Sin ventas mínimas • Pagos mensuales'
      }
    }
  },

  // ============================================
  // URGENCY - FOMO elements
  // ============================================
  urgency: {
    id: 'urgency-banner',
    enabled: true,
    order: 8,
    content: {
      enabled: true,
      type: 'mixed',
      position: 'before-pricing',
      content: {
        message: {
          en: 'Black Friday Special Ending Soon',
          es: 'Especial Black Friday Termina Pronto'
        },
        highlight: {
          en: 'Save $200',
          es: 'Ahorra $200'
        },
        endDate: '2024-12-01T23:59:59Z',
        discountPercentage: 40,
        discountCode: 'BLACKFRIDAY40',
        originalPrice: '$497',
        discountedPrice: '$297',
        spotsLeft: 23
      },
      style: 'card'
    } as any
  },

  // ============================================
  // FAQ - Address objections
  // ============================================
  faq: {
    id: 'faq',
    enabled: true,
    order: 9,
    content: {
      headline: {
        en: 'Questions? We\'ve Got Answers',
        es: '¿Preguntas? Tenemos Respuestas'
      },
      layout: 'accordion',
      items: [
        {
          id: 'faq-1',
          question: {
            en: 'How is this different from other boilerplates?',
            es: '¿Cómo es diferente de otros boilerplates?'
          },
          answer: {
            en: 'We\'re the only boilerplate built specifically for Claude Code with AI-native architecture. Plus, we include growth features like A/B testing and email journeys that others charge extra for',
            es: 'Somos el único boilerplate construido específicamente para Claude Code con arquitectura IA-nativa. Además, incluimos features de growth como A/B testing y email journeys que otros cobran extra'
          }
        },
        {
          id: 'faq-2',
          question: {
            en: 'Do I need to know Supabase or Stripe?',
            es: '¿Necesito conocer Supabase o Stripe?'
          },
          answer: {
            en: 'No. Everything is pre-configured. Just add your API keys and you\'re ready. We include detailed documentation for everything',
            es: 'No. Todo está preconfigurado. Solo añade tus API keys y estás listo. Incluimos documentación detallada para todo'
          }
        },
        {
          id: 'faq-3',
          question: {
            en: 'Can I use this with GPT or other AI models?',
            es: '¿Puedo usar esto con GPT u otros modelos de IA?'
          },
          answer: {
            en: 'Yes! While optimized for Claude Code, the architecture works with any AI assistant. The codebase is clean and well-documented',
            es: 'Sí! Aunque está optimizado para Claude Code, la arquitectura funciona con cualquier asistente de IA. El código es limpio y bien documentado'
          }
        },
        {
          id: 'faq-4',
          question: {
            en: 'What kind of support do I get?',
            es: '¿Qué tipo de soporte obtengo?'
          },
          answer: {
            en: 'Lifetime updates, access to our Discord community, and priority support for the first 30 days. Plus detailed video tutorials',
            es: 'Actualizaciones de por vida, acceso a nuestra comunidad Discord, y soporte prioritario los primeros 30 días. Además tutoriales en video detallados'
          }
        },
        {
          id: 'faq-5',
          question: {
            en: 'Is this a one-time payment?',
            es: '¿Es un pago único?'
          },
          answer: {
            en: 'Yes! Pay once, use forever. This includes all future updates and new features we add',
            es: 'Sí! Paga una vez, usa para siempre. Esto incluye todas las actualizaciones futuras y nuevas features que añadamos'
          }
        }
      ],
      showContactCTA: true
    } as any
  },

  // ============================================
  // FINAL CTA - Close the deal
  // ============================================
  cta: {
    id: 'cta-bottom',
    enabled: true,
    order: 10,
    content: {
      style: 'gradient',
      headline: editableContent.cta.headline,
      subheadline: editableContent.cta.subheadline,
      ctaPrimary: {
        text: editableContent.cta.ctaPrimary,
        href: '/register'
      },
      ctaSecondary: {
        text: editableContent.cta.ctaSecondary,
        href: '#demo'
      }
    }
  }
};

// Function to get content (future: from database)
export async function getHomeContent(): Promise<HomePageContent> {
  // TODO: Future implementation
  // const { data } = await supabase
  //   .from('home_sections')
  //   .select('*')
  //   .order('order');

  // For now, return static content
  return homeContent;
}

// Function to get specific section (future: with A/B variant)
export async function getHomeSection<T>(
  sectionKey: keyof HomePageContent,
  _variant: 'A' | 'B' = 'A'
): Promise<T | null> {
  // TODO: Future implementation with variant support
  // const { data } = await supabase
  //   .from('home_sections')
  //   .select('*')
  //   .eq('section_key', sectionKey)
  //   .eq('variant', _variant)
  //   .single();

  const section = homeContent[sectionKey];
  return section?.content as T || null;
}