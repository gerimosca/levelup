# LevelUp — Especificación del mundo vivo (campamento + expedición)

> Detalle accionable de la [estrella polar](./07-north-star.md). Decisiones tomadas con el usuario:
> **(1)** la expedición la lanza la **misión principal** (1/día) · **(2)** vuelve **a las pocas horas, el mismo día** (nada caduca) · **(3)** el **Campamento ES la Home**.
> Este documento es el plano para construir sin reescribir. Marcado: ✅ decidido · ⬜ propuesto (a confirmar).

---

## 1. El nuevo loop diario

```
MAÑANA   Cumples tu MISIÓN PRINCIPAL (entrenar, en la vida real) → marcas.
         → CONSECUENCIA HONESTA, inmediata: +XP, racha, avanza temporada, mascota. (igual que ahora)
         → Y tu HÉROE SALE DE EXPEDICIÓN (sale del campamento; queda 'fuera').
DÍA      Vives tu vida. La expedición "viaja". (No hay nada que hacer en la app.)
TARDE/   A las ~6 h de salir (configurable) la expedición está LISTA.
NOCHE    → Vuelves, abres la Home (= Campamento) y ves al héroe REGRESAR.
         → REVELAS el hallazgo (recompensa VARIABLE).
         → El hallazgo se MATERIALIZA en el campamento / enciclopedia.
         → Mañana querrás repetir para ver qué trae.
```

**Claves de diseño:**
- ✅ La **consecuencia** (XP/racha/óxido) es **inmediata y honesta**; lo **diferido es solo el descubrimiento** (puro upside). Saltarte un día mantiene su coste; la expedición jamás castiga por tardar.
- ✅ **Nada caduca.** Si no vuelves esa noche, el hallazgo te espera al siguiente abrir. Curiosidad, no FOMO.
- ✅ **1 expedición/día** (atada a la misión principal, que solo se cumple una vez al día).
- ⬜ `EXPEDITION_HOURS = 6` (lista a las 6 h de salir; y siempre lista al cambiar de día local). Ajustable.

---

## 2. Recompensas (lo que NO es XP)

La XP solo se gana trabajando. Todo lo "coleccionable/mundo" son **5 familias**:

| Familia | Qué es | De dónde sale |
|---|---|---|
| **Materiales** 🪵🪨 | "Moneda" del campamento (madera, piedra, tela, hierro…). Se gastan para construir. | Hábitos cumplidos (poquito) + expediciones (más). |
| **Descubrimientos** 🦋📜 | Entradas de **enciclopedia** (flora, fauna, recetas, reliquias, lugares). Cosméticos, no funcionales. | Expediciones + hitos. |
| **Cosméticos** 🎩 | Skins de héroe/mascota, **decoraciones de campamento**, marcos, iconos. | Expediciones (raros), logros, cofres. |
| **Historia** 📖 | Fragmentos / cartas de NPC que avanzan la narrativa. | Expediciones + construir estructuras + temporada. |
| **Mascota** 🐣 | Objetos/regalos para la mascota, mejoras cosméticas. | Expediciones (la mascota "trae regalos"). |

**Tabla de loot de la expedición** (⬜ propuesta, ponderada y sembrada por `userId:fecha`):
- Siempre: un puñado de **materiales**.
- Frecuente: 1 **descubrimiento** nuevo (si quedan por encontrar en la zona actual).
- A veces: **carta de NPC / fragmento de historia**.
- Poco: **cosmético** (rareza común→épico).
- Raro: hallazgo **legendario** (cosmético raro o descubrimiento especial).

> La variabilidad es lo que genera "¿qué tocará hoy?". Pero **el grueso siempre avanza algo** (materiales) → nunca es frustrante.

---

## 3. El Campamento (la Home)

La Home deja de ser una ficha: es **tu campamento, que se construye**. Héroe y mascota **viven** ahí (la mascota hace cosas: lee, entrena, duerme, junto al fuego → motor 7). Los hallazgos **se ven aparecer**.

**Árbol de construcción** (motor 6; orden propuesto ⬜):
```
🪵 Tienda → 🔥 Fogata → 🏠 Casa → 🌳 Arboleda → 🛖 Taller → 🐎 Establo
→ 🌺 Jardines → 💧 Fuente → 📚 Biblioteca → 🏋️ Gimnasio → 🗿 Estatuas → 🏪 Mercado → …
```
- Cada estructura **cuesta materiales** (construir = haber hecho hábitos) y sigue un orden tipo árbol (cada una habilita la siguiente).
- Construir una estructura **desbloquea algo**: un **NPC**, una función, un **capítulo de historia**, nuevos tipos de expedición o cosméticos. Ej.: Biblioteca → bibliotecario (NPC) + enciclopedia; Gimnasio → entrenador (NPC); Taller → mejoras/recetas.
- Es "construir una ciudad", pero la moneda es **la disciplina**.

**Qué se ve en la Home/Campamento:**
- La escena del campamento (crece con cada estructura) + héroe + mascota animados.
- Un **tablón de misiones** (toque → misiones de hoy, claim) → mantiene el campamento como lienzo.
- Estado de **expedición**: "tu héroe está fuera…" / "¡ha vuelto con algo!" (toque → revela).
- Avisos de "qué cambió" (nueva estructura, NPC que te habla, descubrimiento).

---

## 4. Reorganización de pantallas (IA)

Con el Campamento como Home, la nav inferior (5) propuesta ⬜:

| Tab | Antes | Ahora |
|---|---|---|
| 🏕️ **Campamento** | Home (ficha héroe) | **El mundo vivo**: campamento + misiones + expedición + mascota viva |
| 🗺️ **Mundo** | Mapa de temporada | La **región** que exploras con expediciones; el sendero/jefe de temporada vive aquí; descubrimientos pueblan zonas |
| 👤 **Héroe** | = | Personaje + equipo + **personalización** |
| 🐣 **Mascota** | = | Detalle + escudos + actividades |
| 📖 **Enciclopedia** | (Stats) | **Descubrimientos** (colección). *Stats se accede desde el campamento o se fusiona.* |

⬜ Decisión pendiente: ¿la 5ª tab es **Enciclopedia** o **Stats**? (Propongo Enciclopedia en la nav y Stats accesible desde una estructura del campamento, p.ej. la Biblioteca/Estatuas — diegético.)

---

## 5. Modelo de datos (esbozo, para no reescribir)

Nuevas tablas (Supabase, RLS por `user_id`):
```
expeditions      (user_id, day_date, status 'out'|'ready'|'claimed',
                  departed_at, ready_at, reward_jsonb, claimed_at)   UNIQUE(user_id, day_date)
inventory        (user_id, item_key, qty)        -- materiales + ingredientes (moneda del campamento)
camp_structures  (user_id, structure_key, level, built_at)
discoveries      (user_id, discovery_key, found_at)
story_progress   (user_id, chapter_key, seen_at)
npc_state        (user_id, npc_key, last_line_at)        -- opcional, para no repetir frases
```
Reutiliza lo existente:
- `equipment` (cosméticos de héroe; se extiende a cosméticos de mascota/campamento o tabla `cosmetics`).
- El **motor honesto** (player_state/streaks/attributes/season/enemy/pet) **no se toca**.
- **Datos del juego en game-core** (`data/`): árbol del campamento, tabla de loot, catálogo de descubrimientos, capítulos, NPCs → todo declarativo y rebalanceable.

---

## 6. Cómo encaja con lo ya construido

- **Misiones rotativas, óxido, racha, atributos, temporada, enemigo, mascota-escudos, equipo, cofres, stats gráficos** → siguen igual. El mundo vivo es una **capa nueva encima**, no un reemplazo del motor.
- **Hábitos → materiales**: cada hábito reclamado da un poco de material (⬜ confirmar) → el campamento se construye con tu trabajo real, no con tiempo de pantalla.
- **Mapa actual** → evoluciona a "Mundo" (la región explorable). El sendero de temporada sigue, pero ahora es parte de un mundo que se puebla.

---

## 7. Plan por fases

- **Fase A — Expedición + Campamento mínimo (juntos).** Como el campamento es la Home y donde se materializa el hallazgo: sistema de expedición (sale al cumplir misión principal, vuelve a las 6 h, no caduca, recompensa variable) + Home-campamento con 3-4 estructuras, materiales e inventario, y la secuencia de "vuelta y revelación". Arte placeholder (SVG/emoji). **El cambio de feel más grande.**
- **Fase B ✅ — Árbol del campamento completo (12 estructuras) + primeros NPCs.** Estructuras: tienda→fogata→casa→arboleda→taller→establo→jardines→fuente→biblioteca→gimnasio→estatuas→mercado (costes crecientes). 6 NPCs ligados a estructuras (anciana/fogata, exploradora/arboleda, herrero/taller, bibliotecario/biblioteca, entrenador/gimnasio, cocinero/mercado): aparecen en la escena al construir, dan un **saludo del día** que reacciona a tu racha/nivel, y un aviso "nuevo habitante" al construir su estructura. `data/npcs.ts` + `pickNpcGreeting`. Arte placeholder emoji.
- **Fase C ✅ — Enciclopedia de descubrimientos.** 19 descubrimientos en 5 categorías (flora/fauna/recetas/reliquias/lugares) con rareza. Las expediciones traen ~60% de las veces un descubrimiento nuevo (sembrado, prioriza rarezas bajas primero). Pantalla **Códice** (5ª pestaña, reemplaza a Stats en la nav; Stats accesible desde Héroe): grid por categoría, encontrados con emoji+nombre, no encontrados como ❓/???, barra de progreso X/Y. El overlay de expedición revela el descubrimiento. Migración `discoveries`.
- **Fase D ✅ — Historia (crónica de capítulos cortos).** 12 capítulos ligados a estructuras (1 por estructura; tienda = prólogo), arco "reconstruir tu vida en una tierra nueva" (temporada 1 reset). Avanza SOLO con disciplina (construir cuesta materiales). Al construir, overlay "Nuevo capítulo" con el texto (~20s). Se leen en la pestaña **Crónica** del Códice (junto a Descubrimientos); capítulos no desbloqueados muestran "Construye X para continuar". `data/story.ts` (sin migración: se derivan de `camp_structures`). NPCs reactivos ya venían de Fase B (saludo diario por racha/nivel).
- **Fase E — Personalización amplia** (héroe/mascota/campamento) + mascota con actividades contextuales.
- **Transversal — ARTE** (Rive/ilustración): lo que convierte "digno" en "inolvidable".

---

## 8. Decisiones que faltan por cerrar (no bloquean el esqueleto)
1. ⬜ ¿Los **hábitos** dan materiales (además de la expedición), o solo la expedición? *(Propongo: sí, un poco por hábito → construir = trabajar.)*
2. ⬜ **5ª tab**: Enciclopedia vs Stats (ver §4).
3. ⬜ Lista concreta de **materiales** y **costes** de las primeras estructuras.
4. ⬜ **Tabla de loot** exacta de la expedición (probabilidades).
5. ⬜ Estilo visual del campamento (cenital tipo aldea vs lateral) — afecta al arte futuro.
6. ⬜ Estructura de la **historia** (¿1 capítulo por estructura construida? por zona? por temporada?).
