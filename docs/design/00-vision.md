# LevelUp — Visión y Pilares de Diseño

> Documento maestro. Todo lo demás (producto, juego, UX, arquitectura) deriva de aquí.
> Si una decisión contradice un pilar de este documento, la decisión está mal.

---

## 1. El pitch en una frase

**LevelUp convierte tu vida real en un RPG de aventuras: tu personaje eres tú, tu mascota depende de ti, y cada hábito cumplido en el mundo real te sube de nivel.**

No es una app de tareas. No es un gestor de hábitos. Es un **compañero de aventura** que celebra tu constancia.

---

## 2. El problema real que resolvemos

Las apps de hábitos fallan porque:

- Se sienten como **deberes** (otra checklist más).
- Premian **abrir la app**, no **vivir la vida**.
- Castigan el fallo y generan culpa → el usuario abandona.
- El progreso es **invisible** (un número, una racha fría).

LevelUp resuelve esto haciendo el progreso **tangible, visual y emocional**: ves a tu personaje evolucionar y a tu mascota crecer gracias a ti.

---

## 3. La filosofía anti-engagement (LA MÁS IMPORTANTE)

> **La app NO debe intentar retenerte dentro. Debe empujarte a salir, cumplir, y volver a reclamar la recompensa.**

Consecuencias de diseño concretas:

| Principio | Qué significa en la práctica |
|-----------|------------------------------|
| **Sesiones cortas y satisfactorias** | El uso ideal son 2-3 visitas/día de <60s: mañana (ver misiones), tras cumplir (reclamar), noche (diario). |
| **El valor está en el mundo real** | La recompensa (XP, evolución) se gana FUERA. La app solo la registra y celebra. |
| **Cero patrones oscuros** | Sin scroll infinito, sin notificaciones manipuladoras, sin "vuelve o pierdes todo", sin ansiedad artificial. |
| **El "claim" es el momento clave** | Reclamar una recompensa tras un hábito real es el loop dopaminérgico central, y es honesto: te lo ganaste de verdad. |
| **Menos pantalla, más vida** | Métrica de éxito interna: hábitos completados/semana ↑, tiempo en app/sesión ↓. |

---

## 4. Objetivo emocional

Cada mañana el usuario debe pensar:

> ✅ "Hoy quiero seguir mejorando a mi personaje."

Y **nunca**:

> ❌ "Tengo otra lista de tareas pendientes."

Emociones que la app debe producir, en orden de prioridad:

1. **Orgullo** por la constancia (el sentimiento que retiene de verdad).
2. **Progreso** constante y visible.
3. **Aventura** y curiosidad (¿qué hay en la siguiente zona del mapa?).
4. **Cuidado/afecto** (la mascota me necesita).
5. **Satisfacción** sensorial (sonidos y animaciones de recompensa).

---

## 5. Pilares de diseño (las 6 reglas de oro)

1. **El personaje soy yo.** Su evolución es mi evolución. Todo refuerza esta identificación.
2. **Progreso siempre visible.** Ninguna acción del usuario sin feedback visual inmediato.
3. **Consecuencia sin culpa.** Fallar SÍ tiene peso (pierdes algo de XP, tu personaje "se oxida") para que cumplir valga la pena — pero con red de seguridad: **nunca bajas de nivel ni pierdes a tu héroe**, y el lenguaje jamás avergüenza, siempre invita a volver. El castigo da stakes; el suelo evita la espiral de abandono. (Mecánica en `02 §2.4`.)
4. **Aventura, no productividad.** Lenguaje, arte y estructura de videojuego. Cero jerga de "tareas/pendientes/completado".
5. **Todo se gana jugando.** Sin compras, sin pay-to-win, sin moneda premium. La única "moneda" es la constancia real.
6. **Calma, no ansiedad.** Estética agradable, ritmo pausado, sin contadores agresivos ni FOMO tóxico.

---

## 6. Lo que LevelUp NO es (anti-objetivos)

- ❌ No es una to-do list ni un calendario.
- ❌ No es infantil ni pixel-art (es RPG moderno, limpio, "premium").
- ❌ No monetiza con compras dentro del juego.
- ❌ No busca maximizar tiempo en pantalla.
- ❌ No castiga ni avergüenza al usuario.
- ❌ No es un tracker médico (no diagnostica; motiva).

---

## 7. Públicos y tono

- **Usuario primario:** adulto (25-45) que quiere mejorar su estilo de vida (dejar alcohol, entrenar, dormir, leer) y disfruta de los videojuegos o de la estética gaming. No quiere sentirse en terapia ni en una hoja de Excel.
- **Tono de marca:** épico pero cálido. Motivador sin ser cursi. Como un buen narrador de RPG que cree en ti. (Detalle completo en `03-ux-ui.md` → Brand Voice.)

---

## 8. Métricas de éxito (Norte)

| Métrica | Por qué importa | Anti-métrica que rechazamos |
|---------|-----------------|------------------------------|
| **Hábitos reales completados / semana** | Es el valor de vida real | ~~Tiempo en app~~ |
| **Días de racha activa (D7, D21, D100)** | Constancia = el objetivo | ~~Sesiones/día~~ |
| **Temporadas completadas** | Compromiso a largo plazo | ~~Notificaciones abiertas~~ |
| **Retención D30 / D90** | La app realmente ayuda | ~~Scroll/engagement interno~~ |

> Regla: si una feature sube "tiempo en app" pero no sube "hábitos reales", la feature está mal diseñada.
