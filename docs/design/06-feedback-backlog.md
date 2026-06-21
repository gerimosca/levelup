# LevelUp — Backlog de feedback (revisión del usuario)

> Feedback de producto recogido el 2026-06. Prioridad declarada: **el personaje primero**.
> Estado: ✅ hecho · 🔜 siguiente · 🧭 necesita decisión/arte.

## 1. Personaje — "más animado, el SVG no basta"
- ✅ **Celebración al reclamar**: el héroe salta/reacciona al cumplir una misión.
- 🔜 **Customización** (tono de piel / pelo) guardada en la cuenta → "el personaje soy yo".
- 🔜 **Animación de ataque** al subir de nivel / derrotar al Saboteador.
- 🧭 **Salto de calidad real**: un SVG por código tiene techo. Para que el personaje se sienta "de juego" (animaciones fluidas, poses, partículas) lo correcto es **Rive** (animación vectorial con runtime web + React Native, encaja con el plan de app móvil) o **sprites/arte ilustrado**. Eso es **trabajo de arte/assets** (editor Rive o ilustración), no de código. Recomendación: cuando queramos el acabado pro, autoramos un personaje Rive y lo enchufamos (la lógica/equipo ya está lista para recibirlo).

## 2. Misiones de hoy — rotación 🔜
- Algunas misiones **fijas diarias** (p.ej. no alcohol, entrenar) + el **resto rota por día** (un pool, se eligen N distintas cada día de forma sembrada por fecha) para no repetir siempre lo mismo. Cambio en `core/missions` (generación diaria con pool + selección determinista por día).

## 3. Diario nocturno — ❌ ELIMINAR
- ✅ Eliminado de la UI (no se ve viable). (La tabla `journal_entries` queda inerte en BD.)

## 4. Eventos diarios — replantear
- ✅ Quitado "Ola de calor" (agua x2). Los eventos triviales no aportan.
- 🧭 Replantear los eventos hacia algo con más significado (o reducirlos a los potentes: revancha tras recaída, día dorado, finde sin alcohol x3). Pendiente de decisión de diseño.

## 5. Mapa — "muy simple" 🧭
- El sendero actual es funcional pero plano. Ideas: parallax/escenas por bioma, nodos con arte, cofres que se abren con animación rica, el héroe caminando entre nodos, jefe con presencia. Probablemente requiere **arte** para el salto grande; por código se puede mejorar profundidad (capas, scenery animada).

## 6. Mascota — "no genera impacto" ✅
- ✅ **Guardiana de la racha**: la mascota acumula **escudos de racha** (1 cada 7 días de cuidado, máx según etapa: cría 1 · joven/adulta 2 · final 3). Si te saltas la misión principal, **gasta escudos para salvar tu racha** (1 por día saltado). La consecuencia de XP ("óxido") NO se toca — solo protege la racha. Impacto real + emocional, sin regalar XP. Pantalla Mascota muestra escudos + explica el rol; toast en Home cuando salva la racha. Migración `pet.shields`.

### (histórico de ideas para la mascota)
- Necesitaba **mecánica con impacto**. Opciones a decidir:
  - La mascota da **bonus** mientras la cuidas (p.ej. +% pequeño a algún atributo, o reduce el "óxido" del castigo) — pero ojo con regalar progreso.
  - La mascota **evoluciona en habilidades cosméticas** y reacciona con más fuerza (te "felicita", desbloquea poses).
  - La mascota como **medidor emocional** que abre el diario/insights (pero quitamos diario).
  - Recomendación: vincular su crecimiento a rachas y darle un rol visible (te acompaña en mapa/home reaccionando), sin tocar la economía de XP.

## 7. Stats / "Tu progreso" — gráfico, no texto ✅ (v1)
- ✅ Rediseñado: héroe grande (días sin alcohol + dinero) con **contadores animados** (CountUp), **anillo de racha** con objetivo (siguiente hito) + mejor racha, **gráfica de constancia** de 14 días (barras de hábitos/día), y tarjetas con contadores. Datos de actividad reales desde `habit_logs` (`StatsView.activity`).
- 🔜 (futuro) más profundidad: tendencias mes vs mes, gráfica de XP en el tiempo, radar de atributos.

## 8. Héroe / endgame — "¿qué pasa cuando tengo todo el equipo?" 🧭
- Falta **progresión post-equipo**. Opciones: subir de rareza el mismo objeto (mejoras), prestigio/temporadas nuevas con loot nuevo, skins, niveles de maestría por atributo, logros legendarios. Decisión de diseño de meta-progresión.

## 9. Atributos — "no me dicen nada / ¿por qué unas barras más que otras?"
- ✅ Añadido **significado**: cada atributo explica qué representa y **con qué hábito sube** (por eso unas crecen más: dependen de los hábitos que cumples). Texto explicativo en la pantalla Héroe.
- 🔜 (futuro) que los atributos **hagan algo** (efectos cosméticos por rango, o desbloqueos) — ligado al endgame (#8).

---

### Resumen de prioridad
1. **Personaje** (en curso): celebración ✅ → customización 🔜 → ataque 🔜 → Rive 🧭.
2. **Misiones rotativas** 🔜.
3. **Stats gráficos** 🔜.
4. Decisiones de diseño: **mascota con impacto**, **endgame**, **eventos**, **mapa** (varios necesitan arte).
