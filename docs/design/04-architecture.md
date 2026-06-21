# LevelUp — Arquitectura Técnica

> Modular y escalable. Diseñada para rebalancear el juego sin tocar lógica, añadir hábitos/temporadas como módulos nuevos (Open/Closed), y **poder migrar a app móvil nativa sin reescribir el motor de juego**.

---

## 0. Decisión de plataforma (TOMADA)

**Elegido por el usuario:** app **web primero**, accesible desde un sitio web y usable desde el móvil (navegador), **con login y usuarios propios**. Más adelante, transición opcional a **app móvil nativa**.

Traducción técnica:
- **Web app responsive + PWA** (instalable en móvil, "se siente app").
- **Cuentas de usuario reales** → backend en la nube con base de datos (no local-first).
- **Reutilizamos el boilerplate Next.js de este repo** como cimientos (auth, i18n, Supabase, arquitectura VSA ya están).
- **Motor de juego en TypeScript puro** → reutilizable tal cual en una futura app React Native/Expo. Ése es el seguro para la migración a móvil.

> Sub-decisión: el boilerplate trae módulos SaaS que LevelUp NO necesita (billing/Stripe, affiliates, cross-sell) porque **no hay monetización**. Se retiran/ignoran. Conservamos: auth, i18n, Supabase, layout/UI, estructura VSA, scripts i18n.

---

## 1. Stack tecnológico

| Capa | Tecnología | Por qué |
|------|------------|---------|
| Framework | **Next.js 16 (App Router, RSC)** — del boilerplate | Web responsive, PWA, SEO de landing, DX conocida |
| Lenguaje | **TypeScript** | Tipado fuerte; motor de juego compartible con futura RN |
| Auth | **Supabase Auth** (email, magic-link, OAuth) | Login con usuarios propios; ya integrado en el repo |
| Base de datos | **Supabase (PostgreSQL + RLS)** | Datos por usuario, seguros por fila; ya integrado |
| Estado cliente | **Zustand** + **Immer** | Estado de juego en cliente, optimistic UI |
| Validación | **Zod** | Input de hábitos y config (patrón del repo) |
| **Motor de juego** | **TS puro** en `packages/game-core` (sin React/Next) | Determinista, testeable, **portable a React Native** |
| Animación UI | **Framer Motion** | Transiciones fluidas, springs, gestos |
| Personaje/Mascota | **Rive** (`@rive-app/react-canvas`) | State-machines de animación (evolución, ánimos); **runtime también existe en React Native** → reutilizable |
| Celebraciones | **Lottie** (`lottie-react`) | Level up, cofres, mission complete (pre-renderizado) |
| Efectos/partículas | **Canvas / WebGL** (PixiJS o react-three-fiber) *si hace falta* | Solo si Rive/Lottie no bastan |
| Sonido | **Howler.js** | SFX de recompensa cross-browser |
| Háptica | **Vibration API** (web, limitada) → nativa en v-móvil | Feedback táctil donde el navegador lo permita |
| PWA | **next-pwa / Serwist** (service worker) | Instalable, offline básico, splash, icono |
| i18n | **next-intl** (en/es), copies externos | Cero hardcode (sistema del repo) |
| Fechas | **date-fns** + zona horaria del usuario | Lógica de "día de juego" y rachas |
| Notificaciones | **Web Push** (service worker) | Recordatorios suaves; nativas en v-móvil |
| Testing | **Vitest** (motor + handlers) + **Playwright** (E2E) | Foco en el motor de juego |
| Hosting | **Vercel** (web) + **Supabase** (datos/auth) | Deploy sencillo, ya alineado con el repo |

**Estrategia offline/optimista:** la PWA cachea la shell y usa **optimistic UI** (reclamas → se ve al instante → se sincroniza con Supabase). Si no hay red, se encola y sincroniza al volver. El usuario nunca ve spinners en el loop principal.

---

## 2. Arquitectura modular (VSA del repo + motor de juego portable)

Mantenemos el patrón **VSA + CQRS** del proyecto (`query` / `command` / `handler` / `actions`) y añadimos un **motor de juego puro y separado** que es la clave de la escalabilidad y de la futura migración a móvil.

```
levelup/  (monorepo ligero)
├── packages/
│   └── game-core/                # MOTOR DE JUEGO — TS PURO, SIN NEXT/REACT  ★ portable a RN
│       ├── src/
│       │   ├── xp/               # cálculo XP, multiplicadores, racha
│       │   ├── leveling/         # curva de niveles, tiers
│       │   ├── attributes/       # puntos y rangos de atributo
│       │   ├── streak/           # rachas
│       │   ├── enemy/            # el Saboteador (HP, daño, cura)
│       │   ├── pet/              # ánimos y evolución
│       │   ├── season/           # progreso por días cumplidos, mapa
│       │   ├── events/           # selección de evento diario (sembrada)
│       │   ├── missions/         # generación de misiones del día
│       │   ├── achievements/     # evaluación de logros
│       │   └── data/             # CONFIG DEL JUEGO (rebalanceable, sin lógica)
│       │       ├── habits.ts
│       │       ├── levels.ts
│       │       ├── seasons/      # s1-reset.ts, s2-strength.ts, ...
│       │       ├── events.ts
│       │       ├── achievements.ts
│       │       └── equipment.ts
│       └── __tests__/            # tests unitarios del motor (100% determinista)
│
└── apps/
    └── web/                      # App Next.js (el boilerplate, depurado)
        ├── src/
        │   ├── features/         # SLICES VSA (un dominio = una carpeta)
        │   │   ├── auth/         # (del boilerplate) login/registro
        │   │   ├── onboarding/   # elegir objetivos, crear personaje, huevo
        │   │   ├── home/         # core loop: misiones, claim
        │   │   ├── character/    # render personaje + equipo (Rive)
        │   │   ├── pet/          # mascota (Rive)
        │   │   ├── missions/     # registro de hábitos
        │   │   ├── map/          # mapa de temporada
        │   │   ├── enemy/        # el Saboteador
        │   │   ├── season/       # temporadas
        │   │   ├── stats/        # estadísticas
        │   │   ├── journal/      # diario nocturno
        │   │   └── achievements/ # logros
        │   │   #  cada feature: types/ + .query.ts + .command.ts + .handler.ts + .actions.ts + components/
        │   │
        │   ├── shared/           # auth, supabase, ui (shadcn), config/brand
        │   ├── store/            # Zustand (estado de juego en cliente)
        │   ├── i18n/             # next-intl
        │   └── app/[locale]/     # rutas: (auth) (app) (landing)
        │       ├── (landing)/    # web pública: explica LevelUp, CTA registro
        │       └── (app)/        # app protegida: home, map, pet, stats, me
        └── public/               # PWA manifest, iconos, assets Rive/Lottie/audio
```

### Reglas de arquitectura
- **`game-core` es puro:** no importa React, Next ni Supabase. Funciones deterministas → 100% testeable y **reutilizable en React Native** sin cambios. Aquí vive toda la "verdad" del juego.
- **`data/` separa balance de lógica:** rebalancear XP/temporadas = editar datos, no código.
- **Nuevos hábitos / temporadas = nuevos archivos en `data/`** (Open/Closed).
- **Las Server Actions (VSA) orquestan:** validan (Zod) → llaman a `game-core` para calcular → persisten en Supabase (command) → revalidan. La UI no calcula reglas de juego.
- **Sin imports cross-feature** entre slices (regla del repo); comparten vía `game-core`, `shared/`, `store/`.

> **Por qué esto habilita el móvil:** cuando se cree la app Expo, reusa `packages/game-core` (idéntico) + el mismo backend Supabase + los mismos assets Rive. Solo se reescribe la capa de UI. La lógica de juego, la economía y los datos no se tocan.

---

## 3. Modelo de datos (Supabase / PostgreSQL + RLS)

Todas las tablas con **RLS por `auth.uid()`** (cada usuario solo ve lo suyo) y FK a `auth.users` con `ON DELETE CASCADE` (patrón del repo).

```
profiles          (id=auth.users, display_name, settings_jsonb, created_at)   # ya existe en el repo
player_state      (user_id PK/FK, level, xp_total, current_season_key, created_at)
attributes        (user_id, type, points)                  # 5 filas por usuario
habit_logs        (id, user_id, habit_key, day_date, value, xp_awarded, claimed_at)
streaks           (user_id, current, longest, last_active_day)
season_progress   (user_id, season_key, days_completed, started_at, completed_at)
enemy_state       (user_id, season_key, hp_current, hp_max)
pet               (user_id, stage, care_days, mood, last_interaction)
achievements      (user_id, achievement_key, unlocked_at)
equipment         (user_id, item_key, unlocked_at, equipped_slot)
daily_event       (user_id, day_date, event_key)
journal_entries   (id, user_id, day_date, mood, felt_text, learned_text)
```

- **Idempotencia por día:** `UNIQUE(user_id, habit_key, day_date)` en `habit_logs`. Reclamar 2 veces no duplica XP (clave para optimistic UI + sync).
- **"Día de juego" = día local del usuario** (guardamos `day_date` ya resuelto a la TZ del usuario; el arranque del día es 00:00 local).
- **Evento del día sembrado** por `hash(user_id + day_date)` → determinista, mismo evento en cualquier dispositivo, testeable (sin `Math.random` libre).
- **Datos sensibles** (alcohol, sueño): protegidos por RLS; solo el usuario y `service_role` acceden. Nada público.

---

## 4. Flujo de una acción (ejemplo: reclamar "Entrenar")

```
UI MissionCard "Reclamar"  (cliente)
  → store: aplica resultado OPTIMISTA al instante (XP sube, animación dispara)
  → Server Action  claimHabitAction(habitKey, value)
       → handler: valida (Zod) + auth (getUser)
       → game-core: xp.calc(base, evento, racha) + attributes.award + enemy.applyDamage
                    + season.advanceIfFirstToday + leveling.checkLevelUp + achievements.evaluate + pet.refreshMood
       → command: upsert idempotente en Supabase (habit_logs, player_state, ...)
       → revalidatePath
  → si el server difiere del optimista (raro): se concilia; si error de red: se encola y reintenta
  → UI: animación Claim + sonido (Howler) + háptica (si disponible)
  → si levelUp → overlay LevelUp ; si missionComplete → overlay
```

El cálculo de `game-core` es **síncrono y puro**; la persistencia es async pero la UI es optimista (cero spinners en el loop).

---

## 5. Escalabilidad y mantenibilidad

- **Rebalanceo sin riesgo:** todos los números en `game-core/data/`. Ajustar XP no toca lógica ni UI.
- **Añadir hábito:** 1 entrada en `data/habits.ts` (+ colector de auto-tracking opcional). Las misiones se generan desde datos → cero cambios en UI base.
- **Añadir temporada:** 1 archivo en `data/seasons/`. Mapa, jefe, recompensas y narrativa son datos.
- **Migración a móvil (futuro):** nueva `apps/mobile` (Expo) que importa `packages/game-core` y usa el mismo Supabase. Solo se reescribe UI. Rive y Lottie tienen runtime en RN → assets reutilizables.
- **Config remota / A/B (futuro):** los `data/` pueden servirse desde Supabase para retocar balance sin redeploy.

---

## 6. Testing (pragmático, foco en el motor)

- **Unit (obligatorio):** todo `game-core` — curva de niveles, multiplicadores, racha (casos borde de cambio de día/TZ), daño al Saboteador, evolución de mascota, generación de misiones, logros. Un bug aquí rompe la economía.
- **Handlers (VSA):** validación + idempotencia del claim (no duplicar XP).
- **No testear:** render puro de UI estándar.
- **E2E (Playwright):** registro/login → onboarding → primera misión → claim → level up. Flujo crítico.
- **Snapshot de balance:** test que fija la tabla de niveles y el XP/día máx para detectar rebalanceos accidentales.

---

## 7. Seguridad y privacidad

- **RLS en todas las tablas** (cada usuario solo accede a sus datos). Políticas para `user` y `service_role` (patrón del repo).
- **Datos sensibles** (alcohol, sueño, peso): nunca públicos, nunca compartidos sin acción explícita del usuario.
- Server Actions validan auth (`getUser`) y entrada (Zod) **siempre**.
- **Sin tracking publicitario.** Analítica de producto mínima y anónima (o ausente en MVP).
- **Export y borrado de datos** disponibles (control del usuario; `ON DELETE CASCADE` limpia todo).
- HTTPS, cookies seguras (Supabase Auth gestiona sesión).

---

## 8. Camino a la app móvil nativa (resumen)

Cuando se decida dar el salto:
1. `apps/mobile` con Expo + Expo Router (UI nativa).
2. Importa `packages/game-core` **sin cambios** (misma economía, mismos datos).
3. Mismo backend Supabase (mismas tablas, misma auth).
4. Reutiliza assets **Rive** (personaje/mascota) y **Lottie** (celebraciones) — ambos con runtime RN.
5. Gana lo nativo de verdad: HealthKit/Health Connect (auto-tracking pasos/sueño), háptica rica, notificaciones nativas, presencia en stores.

La inversión hoy (motor puro + datos separados + Rive) es exactamente lo que hace barata esa transición.
