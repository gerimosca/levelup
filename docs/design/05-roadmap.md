# LevelUp — Roadmap de Desarrollo Modular

> Orden de construcción pensado para tener algo **jugable y satisfactorio cuanto antes**, e ir añadiendo capas sin romper lo anterior.

---

## Fase 0 — Fundación (setup)
**Meta:** boilerplate Next.js depurado y navegable, con design system base y auth.
- [x] Motor de juego en **`src/game-core/`** (TS puro, alias `@/game-core`) en lugar de monorepo, para no romper build/lint/husky. Extraíble a `packages/` cuando llegue la app móvil. Incluye `xp`, `penalty` (decay con suelo), `leveling`, `streak`, `data/habits`, `data/levels` + **27 tests verdes**.
- [ ] Retirar módulos no usados del boilerplate (billing/Stripe, affiliates, cross-sell) — diferido, no urgente (quedan inertes; no hay monetización).
- [x] Nuevo route group **`(game)`** con `layout.tsx` protegido (`requireUser`) + **bottom nav** de 5 tabs (home/map/pet/stats/me). Reusa `AppProvider`.
- [x] **Tema RPG oscuro** scopeado vía `[data-theme='rpg']` en `globals.css` (no afecta a la landing). Tokens de `03-ux-ui`.
- [x] Componente `XpBar` (presentación) + `PlaceholderScreen`. Home renderiza nivel/XP **calculados en vivo por `game-core`**.
- [x] Copies en/es para los 6 namespaces nuevos — validado por `i18n:validate` (35/35).
- [x] **PWA** básica: `src/app/manifest.ts` (instalable). _Pendiente: iconos PNG reales + service worker (@serwist)._
- [x] Middleware: rutas del juego añadidas a la protección.
- [x] Store **Zustand** (`src/shared/game/player-store.ts`) + esquema de tablas Supabase con RLS (`supabase/migrations/20251121000000_levelup_game.sql`, pendiente `db push`).
- [x] Managers de **audio** (`audio-manager.ts`, stub sin dep) + **háptica** (`haptics.ts`, Vibration API).
- [ ] `AttributeBar` + más primitivas UI — junto con la pantalla "Yo" (Fase 3).

**Entregable:** ✅ shell navegable de 5 secciones con tema RPG oscuro, Home mostrando nivel/XP del motor, protegido por auth, instalable como PWA. Pendientes menores: store, audio, iconos PNG, SW.

---

## Fase 1 — El motor de juego (core puro, sin UI bonita) ✅
**Meta:** la economía funciona y está testeada.
- [x] `data/habits.ts`, `data/levels.ts`, `data/seasons/s1-reset.ts`, `data/events.ts`, `data/achievements.ts`, `data/equipment.ts`.
- [x] `xp`, `leveling`, `attributes`, `streak`.
- [x] `enemy` (Saboteador), `season` (días cumplidos + mapa), `missions`, `events` (selección sembrada), `achievements`, `pet`, `lib/seeded-random`.
- [x] **54 tests unitarios** de todo el motor (curva, decay con suelo, enemigo, mascota, temporada, misiones, eventos deterministas, logros). `npx vitest run src/game-core`.
- [x] Type-check del proyecto: **0 errores**.

**Entregable:** ✅ dado un input de hábitos, el motor calcula XP, nivel, atributos, racha, daño al enemigo, misiones, eventos y logros — verificado por tests. Listo para conectar a la UI en Fase 2.

---

## Fase 2 — Home jugable (el core loop completo) ✅
**Meta:** el ciclo VER → RECLAMAR → EVOLUCIONAR funciona de verdad.
- [x] Slice VSA **`src/features/game/`** (types/query/command/handler/actions) que orquesta `@/game-core` + Supabase.
- [x] Home (`HomeClient`) con contexto de temporada, héroe + `XpBar` (en vivo), misiones del día, `EnemyHealthBar`, racha, banner de evento.
- [x] `MissionCard` + `claimHabitAction` (Server Action) con **claim optimista** + sonido + háptica.
- [x] Overlays `LevelUp` + `MissionComplete` (framer-motion).
- [x] **Persistencia real e idempotente** (UNIQUE por user+habit+día; bonus de Mission Complete una sola vez).
- [x] El claim actualiza XP/nivel, atributos, enemigo (Saboteador), racha, día de temporada, mascota y evalúa logros.
- [x] Verificado: type-check 0 errores · 54 tests · **build de producción verde** · dev smoke test (login 200, /home 307→login, manifest 200).

**Entregable:** ✅ un usuario logueado registra hábitos, reclama, sube de nivel y siente el loop. **Primer hito jugable de verdad.**

### Fixes de boilerplate necesarios (Windows / sin Stripe)
- [x] Cliente Stripe **lazy** (`shared/payments/stripe/server.ts`): ya no revienta login/build sin `STRIPE_SECRET_KEY`.
- [x] Middleware excluye `manifest.webmanifest` (la PWA se servía con 307).
- [x] **Bug Windows** en `scripts/i18n/generators/generate-static-translations.mjs`: el guard `import.meta.url === file://${argv[1]}` nunca corría en Windows → i18n estático no se generaba. Arreglado con `pathToFileURL`.

---

### Pulido de Fase 2 ✅ (hecho junto con Fase 3)
- [x] **Onboarding "elige tu camino"** inline en Home (mín. 3 objetivos) + columna `active_habits` (migración aplicada).
- [x] **Logger de recaída**: el Saboteador recupera vida (+150), sin castigo, con narrativa "mañana es tu revancha".
- [x] **Valor parcial** para hábitos graduales (diálogo de litros/horas/pasos antes de reclamar).
- [x] **Nombres reales de logros** en los toasts (copies).

## Fase 3 — Personaje y Mascota (vínculo emocional) ✅
**Meta:** el progreso es visual y emocional.
- [x] `CharacterStage` con **tiers visuales** (Iniciado→Leyenda): glifo + aura/glow + color por tier, animación idle (framer-motion).
- [x] **Pantalla "Yo"**: personaje, 5 atributos (barras + rango), logros desbloqueados, equipamiento (desbloqueado/bloqueado por logro). `getProfileAction`.
- [x] `PetStage` con **ánimos** (happy/ok/tired/sad → animaciones) + **evolución** huevo→cría→joven→adulta→final.
- [x] **Pantalla Mascota** con la criatura grande + progreso a la siguiente etapa (`nextPetStageInfo`).
- [ ] Animación de evolución con **Lottie** (ahora es framer-motion) + reencuentro tras bajón — pulido futuro.

**Entregable:** ✅ el personaje evoluciona por tier y la mascota crece/refleja tu constancia. Verificado: type-check 0, 54 tests, build verde, dev smoke (todas las rutas 307→login).

---

## Fase 4 — Mapa y Temporada 1 completa ✅
**Meta:** sensación de aventura de medio plazo.
- [x] **Pantalla Mapa** (`MapClient`): zonas (Bosque→Cima), casillas por día, posición actual (current/done/locked), jefe (Saboteador) en la casilla final.
- [x] Temporada 1 · RESET de principio a fin (21 días por días cumplidos); barra de progreso + `season.completed` en el estado.
- [x] Intro narrativa de temporada + **cinemática de victoria** (`SeasonVictoryOverlay`, una vez vía localStorage) al completar/derrotar al Saboteador.
- [x] **Cofres** en la última casilla de cada zona (visual).
- [x] Teaser de desbloqueo de Temporada 2.

**Entregable:** ✅ una temporada completa con narrativa, mapa, zonas y jefe. **MVP funcional.** Verificado: type-check 0, 54 tests, build verde, dev smoke (`/map` 307→login).

---

## Fase 5 — Cierre de MVP (pulido y retención sana) ✅
- [x] **Diario nocturno** + timeline (`JournalClient`, 2 preguntas + ánimo, +15 XP/día una vez, ruta `/journal` enlazada desde Home).
- [x] **Pantalla Stats** visual (`StatsClient`): días sin alcohol, **dinero ahorrado** (8€/día config.), rachas, entrenamientos, km, lecturas, nivel.
- [x] Logros con toasts de desbloqueo (hecho en Fase 2; nombres reales en Fase 3).
- [x] **Ajustes** (`SettingsClient`, ruta `/settings` desde "Yo"): cambiar objetivos, toggle de sonido (localStorage), **exportar datos** (JSON), **borrar datos** (con confirmación).
- [x] **Pase de accesibilidad**: `MotionProvider` con `reducedMotion="user"` (respeta prefers-reduced-motion en todo el juego); labels/aria en controles.
- [x] Audio/háptica en momentos clave (claim, level up, mission complete, recaída); sonidos como stubs (faltan archivos de audio reales).
- [ ] **Notificaciones web push** — diferido (necesita service worker + VAPID; va con la PWA completa).

**Entregable:** ✅ **MVP completo y verificado** (type-check 0, 54 tests, build verde, dev smoke de todas las rutas). Listo para testers reales. Pendiente para "store-ready": sonidos reales, iconos PNG + service worker (PWA), notificaciones push.

---

## v2 — Profundidad
- [ ] Temporadas 2 (STRENGTH), 3 (CUT), 4 (DISCIPLINE).
- [ ] Más evoluciones de personaje (Veterano→Leyenda) y mascota (adulta→final).
- [ ] Catálogo completo de equipamiento + eventos diarios ampliados.
- [ ] Notificaciones web push suaves (mañana/noche).
- [ ] **App móvil nativa (Expo)** reusando `packages/game-core` + Supabase + assets Rive/Lottie.
- [ ] Auto-tracking pasos/sueño (HealthKit / Health Connect) — en la app nativa.

## v3+ — Largo plazo
- [ ] Compartir tarjeta de progreso (social sano, sin ranking tóxico).
- [ ] Temporadas estacionales / eventos especiales.
- [ ] Retos opcionales con amigos.
- [ ] Config remota de balance vía OTA (Expo Updates) + A/B de economía.

---

## Principios durante todo el desarrollo
1. **Cada fase deja algo demostrable** (nada de "todo o nada").
2. **No romper lo anterior:** features nuevas = archivos nuevos en `data/`/`features/`.
3. **El motor (`core/`) siempre testeado** antes de conectarlo a UI.
4. **Cero textos hardcodeados** desde el día 1.
5. **Rebalancear = editar `data/`,** nunca lógica.
6. Validar la sensación ("¿da ganas de abrirla mañana?") al final de cada fase, no solo la funcionalidad.
