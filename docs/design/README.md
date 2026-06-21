# LevelUp — Documentación de Diseño

Documentación de producto, game design, UX/UI y arquitectura. **Léela antes de codear.**
Si una implementación contradice estos documentos, gana la documentación (o se actualiza con justificación).

| # | Documento | Sombrero | Qué define |
|---|-----------|----------|------------|
| 00 | [Visión y Pilares](./00-vision.md) | Fundador | Filosofía anti-engagement, objetivo emocional, las 6 reglas de oro |
| 01 | [Producto](./01-product.md) | Product Manager | Core loop, pantallas, onboarding, MVP scope, notificaciones |
| 02 | [Game Design](./02-game-design.md) | Game Designer | Economía, balance de XP, niveles, atributos, mascota, Saboteador, temporadas, mapa, logros |
| 03 | [UX/UI](./03-ux-ui.md) | Diseñador UX/UI | Sistema visual, color, tipografía, motion, sonido, brand voice, accesibilidad |
| 04 | [Arquitectura](./04-architecture.md) | Tech Lead | Stack, estructura modular, modelo de datos, escalabilidad |
| 05 | [Roadmap](./05-roadmap.md) | Tech Lead | Plan de construcción modular por fases |

## Plataforma elegida
**Web primero**: app web responsive + **PWA** instalable, usable desde el móvil, **con login y usuarios propios** (Supabase). Construida sobre el boilerplate Next.js de este repo. El **motor de juego va en TS puro** (`packages/game-core`) para poder migrar a **app móvil nativa** (Expo) más adelante sin reescribir la lógica. Detalle en `04 §0`.

## Estado
- ✅ Documentación de diseño v1 completa — **pendiente de tu revisión**.
- ⏳ Desarrollo: en pausa hasta que revises la doc y des el OK (o pidas ajustes).

## Resumen ejecutivo en 5 puntos
1. **No es una app de tareas:** es un RPG donde tu vida real sube de nivel a tu personaje (= tú).
2. **Filosofía anti-engagement:** te empuja a salir y cumplir hábitos reales, no a quedarte en la app.
3. **Loop central:** VER misiones → VIVIR el hábito (fuera) → RECLAMAR recompensa (celebración) → EVOLUClONAR.
4. **Sistemas:** personaje evolutivo + mascota emocional + el Saboteador (alcohol = enemigo) + temporadas con mapa de aventura + economía de XP balanceada (todo desbloqueable, cero compras).
5. **Tecnología:** web app + PWA con **Next.js + Supabase** (login, datos en la nube), motor de juego en TS puro reutilizable, balance separado en datos. Preparada para saltar a **app móvil nativa (Expo)** sin reescribir la lógica.
