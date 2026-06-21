# game-core — Motor de juego de LevelUp

TypeScript **puro** (sin React/Next/Supabase). Es la "verdad" del juego: economía de XP,
niveles, atributos, racha, penalizaciones, enemigo, mascota, temporadas, misiones y logros.

## Por qué está aislado

1. **Determinista y testeable.** Funciones puras → un bug aquí rompe la economía, así que se testea a fondo.
2. **Rebalanceable sin tocar lógica.** Los números viven en `data/` (Open/Closed).
3. **Portable a móvil.** Cuando exista la app Expo, importa este motor **sin cambios**; solo se reescribe la UI. Por eso **está prohibido importar React/Next/Supabase aquí**.

> Hoy vive en `src/game-core/` (alias `@/game-core`) para no convertir el repo en monorepo de golpe.
> Cuando llegue la app móvil, se extrae a `packages/game-core` sin cambios de código. Ver `docs/design/04-architecture.md`.

## Estructura

```
game-core/
├── index.ts              # API pública (la UI consume solo desde aquí)
├── types.ts              # Tipos del dominio
├── data/                 # BALANCE (rebalanceable): habits, levels, (seasons, events...)
├── xp/                   # cálculo de XP y penalización (decay)
├── leveling/             # nivel y tier desde el XP total
├── streak/               # racha y su multiplicador
└── __tests__/            # tests del motor
```

## Reglas

- **Nada de React/Next/Supabase** en este árbol. Solo TS y utilidades puras.
- La UI **nunca** calcula reglas de juego: llama a `game-core`.
- Cambiar balance = editar `data/`. Añadir hábito/temporada = archivo nuevo en `data/` (no editar lo existente).

## Tests

```bash
npx vitest run src/game-core
```

Cubren: curva de niveles (nivel 10 ≈ 6.664 XP), XP parcial de hábitos graduales, multiplicadores
(evento + racha), y la **red de seguridad de la penalización** (nunca bajar de nivel).

## Estado (Fase 1 completa ✅)

Implementado y testeado (54 tests): `xp` (reward + parcial + multiplicadores), `penalty` (decay con
suelo de nivel), `leveling` (nivel/tier), `streak`, `attributes`, `enemy` (Saboteador), `pet`
(etapa + ánimo), `season` (días cumplidos + mapa), `events` (selección sembrada determinista),
`missions` (generación diaria + Mission Complete), `achievements`, `lib/seeded-random`.
Datos: `data/habits`, `data/levels`, `data/seasons/s1-reset`, `data/events`, `data/achievements`,
`data/equipment`.

Pendiente (futuras temporadas/v2): `data/seasons/s2..s4`, atributos persistidos avanzados,
config remota de balance.
