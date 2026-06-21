# LevelUp — Documento de Producto (PM)

> Define el QUÉ y el flujo. El CÓMO visual va en `03-ux-ui.md`; las reglas de juego en `02-game-design.md`.

---

## 1. Core Loop (el ciclo central)

El producto entero gira sobre un loop diario de 4 pasos:

```
   ┌────────────────────────────────────────────────────────┐
   │                                                        │
   ▼                                                        │
1. VER (mañana)        →   2. VIVIR (día)   →   3. RECLAMAR  →  4. EVOLUCIONAR
La app me muestra          Cumplo el hábito      Vuelvo y       Subo XP, mejora
las misiones del día,      en la VIDA REAL       pulso "Reclamar" mi personaje, mi
el evento y mi estado.     (fuera de la app).    → celebración.  mascota, el mapa.
   │                                                                    │
   └────────────────────────────────────────────────────────────────────┘
                         (al día siguiente, repite)
```

**El paso 3 (Reclamar) es el corazón emocional.** Es honesto (te lo ganaste de verdad) y es el momento de máxima recompensa sensorial.

### Loop secundario (semanal)
Avanzar zonas del mapa → desbloquear logros → ver estadísticas → cerrar semana.

### Loop terciario (temporada, 21-60 días)
Completar la historia de una temporada → derrotar al jefe → desbloquear la siguiente.

---

## 2. Mapa de pantallas (Information Architecture)

Navegación principal: **bottom tab bar de 5 ítems** (pulgar-friendly, sin menús ocultos).

```
┌─────────────────────────────────────────────────────────────┐
│  APP                                                         │
│                                                             │
│  [Onboarding] (solo primera vez)                            │
│       │                                                     │
│       ▼                                                     │
│  ┌──────────────── BOTTOM TABS ────────────────┐           │
│  │  🏠 Home   🗺️ Mapa   🐣 Mascota   📊 Stats   👤 Yo  │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
│  Overlays / modales (no son tabs):                          │
│   • Claim de recompensa (animación)                         │
│   • Subida de nivel                                         │
│   • Evento diario (mañana)                                  │
│   • Diario nocturno                                         │
│   • Mission Complete                                        │
│   • Cofre / desbloqueo de equipo                            │
│   • Detalle de misión (registrar hábito)                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Tabs

| Tab | Propósito | Contenido clave |
|-----|-----------|-----------------|
| **🏠 Home** | El centro de mando diario | Personaje, nivel, barra XP, mascota, misiones del día, racha, temporada, botón Reclamar |
| **🗺️ Mapa** | Sensación de aventura y progreso | Mapa de la temporada, casillas (días), zonas, posición actual, jefe |
| **🐣 Mascota** | Vínculo afectivo | Mascota en grande, su estado/ánimo, su evolución, interacción |
| **📊 Stats** | Orgullo medible | Stats visuales: nivel, entrenamientos, alcohol evitado, dinero ahorrado, sueño, rachas |
| **👤 Yo (Personaje)** | Identidad y colección | Personaje a pantalla completa, atributos, equipamiento, logros |

> Decisión: 5 tabs es el máximo cómodo. Home concentra el 80% del uso diario; el resto son de "exploración" ocasional.

### 2.2 Overlays principales

- **Evento diario** → aparece la primera vez que abres la app cada mañana.
- **Detalle de misión** → bottom sheet para registrar/confirmar un hábito (con su valor, p.ej. horas de sueño, vasos de agua).
- **Claim** → animación a pantalla completa al reclamar XP.
- **Level Up** → toma la pantalla, muestra al personaje mejorando.
- **Mission Complete** → cuando se cierran todas las misiones del día.
- **Diario nocturno** → 2 preguntas, se ofrece por la noche.

---

## 3. Pantalla Home (la más importante) — wireframe lógico

```
┌─────────────────────────────────────────┐
│  TEMPORADA 1 · RESET        🔥 Racha 7   │  ← barra superior (contexto)
├─────────────────────────────────────────┤
│  ┌─ EVENTO DE HOY ──────────────────┐    │
│  │ 🌧️ Llueve · Entrenar da XP x2     │    │  ← banner de evento (tappable)
│  └──────────────────────────────────┘    │
│                                           │
│            ✨ [ PERSONAJE ] ✨            │  ← héroe visual, animado
│              (Nivel 8)                    │
│        ▓▓▓▓▓▓▓▓░░░░  620/882 XP          │  ← barra de experiencia
│                                           │
│              🐣 (mascota, peque,          │  ← mascota acompaña al héroe
│                  reacciona)               │
│                                           │
├─────────────────────────────────────────┤
│  MISIONES DE HOY                          │
│  ┌─────────────────────────────────────┐ │
│  │ ⭐ PRINCIPAL · Entrenar      +120 XP │ │  ← misión principal destacada
│  │    [ ✔ Completar ]                  │ │
│  └─────────────────────────────────────┘ │
│  ⚔️ No beber alcohol   +150  [Reclamar]   │  ← secundarias compactas
│  💤 Dormir +7h         +80   [ ▢ ]        │
│  💧 2L de agua         +40   [ ▢ ]        │
│  👟 10.000 pasos       +70   [ ▢ ]        │
│  📖 Leer               +50   [ ▢ ]        │
├─────────────────────────────────────────┤
│   [ ⚔️  EL SABOTEADOR — HP ▓▓▓░░ 60% ]    │  ← enemigo de la temporada
└─────────────────────────────────────────┘
```

Reglas de la Home:
- **Una sola acción dominante**: el botón de reclamar/completar la misión disponible.
- Si no hay nada que reclamar, el CTA invita a la próxima misión.
- Todo es **visual primero, número después**.
- Sin scroll largo: cabe en una pantalla; las secundarias se compactan.

---

## 4. Onboarding (primera experiencia)

Objetivo: en <90 segundos el usuario tiene personaje, mascota (huevo) y su primera misión, sintiendo que **empieza una aventura**, no que rellena un formulario.

```
1. SPLASH narrativo + ENTRAR
   "Tu yo del futuro te está esperando. Empieza la aventura."
   → Registro/login (email, magic-link u OAuth). Lo mínimo para tener cuenta.
     Se presenta como "Crea tu héroe", no como un formulario frío.

2. ELIGE TU CAMINO (no "configura hábitos")
   Selección visual de objetivos → mapea a hábitos:
   [ Dejar el alcohol ] [ Entrenar ] [ Dormir mejor ]
   [ Caminar ] [ Leer ] [ Beber agua ] [ Comer mejor ]
   (multi-select, mínimo 3)

3. NACE TU PERSONAJE
   Personalización mínima (no bloquear): tono de piel/color base.
   Se le pone nombre (opcional, default "Héroe").

4. RECIBE TU HUEVO 🥚
   "Esta criatura crecerá contigo. Cuídala cumpliendo tus hábitos."

5. TU PRIMERA MISIÓN
   Se presenta la Temporada 1 · RESET y la misión de hoy.
   CTA: "Comenzar la aventura"
```

Principios del onboarding:
- **Login lo más ligero posible** (magic-link/OAuth preferidos sobre contraseña). Necesario porque hay cuenta propia, pero enmarcado como "crear tu héroe", no como burocracia.
- **Cero campos de texto obligatorios** más allá del email. Todo lo demás es selección visual.
- **Decisiones reversibles** (puedes cambiar objetivos luego en Ajustes).
- Termina con una **acción**, no con un tutorial pasivo.

---

## 5. Hábitos soportados (MVP)

| Hábito | Tipo de registro | Atributo principal | XP base |
|--------|------------------|--------------------|---------|
| Entrenar | Booleano (hecho/no) | Fuerza | 120 |
| No beber alcohol | Booleano (día limpio) | Vitalidad | 150 |
| Dormir +7h | Numérico (horas) | Energía | 80 |
| Beber 2L agua | Contador (vasos) | Vitalidad | 40 |
| Caminar 10k pasos | Numérico (pasos) | Resistencia | 70 |
| Leer | Booleano / minutos | Disciplina | 50 |
| Meditar | Booleano / minutos | Disciplina | 30 |
| Comer bien | Booleano | Vitalidad | 60 |

> Detalle de XP, atributos y balance en `02-game-design.md`.
> Integraciones (HealthKit/Google Fit para pasos y sueño) → ver `04-architecture.md`. En MVP el registro puede ser manual; auto-tracking es fase 2.

---

## 6. Notificaciones (con cuidado, según filosofía)

Pocas, útiles, nunca manipuladoras. Configurables, opt-out fácil.

| Momento | Notificación | Tono |
|---------|--------------|------|
| Mañana (hora elegida) | "Nuevo día, nueva aventura. El evento de hoy te espera." | Invitación |
| Hábito sin registrar (tarde) | "Tu personaje tiene energía para una misión más hoy." | Suave, sin culpa |
| Noche | "¿Cómo fue el día? Tu diario te espera." | Cálido |
| Logro / level up perdido offline | "¡Subiste a nivel 9 mientras tanto! Ven a verlo." | Celebración |

❌ Prohibido: "¡Vas a perder tu racha!", contadores de miedo, spam diario múltiple.

---

## 7. Alcance del MVP vs futuro

### MVP (v1) — "La aventura básica funciona"
- Onboarding + selección de objetivos.
- Home con personaje, nivel, XP, misiones diarias, racha.
- Registro manual de hábitos + Claim con celebración.
- Sistema de XP, niveles y atributos.
- Mascota (huevo → 1ª evolución) con estados de ánimo.
- El Saboteador (enemigo) como barra de progreso de la temporada.
- **Temporada 1 · RESET** completa (21 días) con su mapa.
- Mission Complete + Level Up + sonidos.
- Logros base (~15).
- Diario nocturno.
- Stats básicas.
- Modo oscuro.
- Cuentas de usuario (login) + persistencia en la nube (Supabase), accesible web/móvil.
- PWA instalable en móvil.

### v2 — "Profundidad"
- Temporadas 2-4.
- Auto-tracking (HealthKit / Google Fit) pasos y sueño.
- Más evoluciones de mascota y personaje.
- Equipamiento cosmético completo.
- Eventos diarios variados.
- Cofres.
- Auto-tracking de pasos/sueño (Web ↔ futura app nativa con HealthKit/Health Connect).
- Notificaciones push (web push) suaves.

### v3+ — "Comunidad y largo plazo"
- Logros sociales (compartir tarjeta de progreso).
- Temporadas estacionales / eventos especiales.
- Retos opcionales con amigos (sin ranking tóxico).

---

## 8. Riesgos de producto y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| El usuario hace trampa (marca hábito sin hacerlo) | No lo perseguimos: si se engaña, se engaña a sí mismo. Foco en honestidad, no en vigilancia. Auto-tracking en v2 reduce fricción. |
| Fatiga tras la novedad | Eventos diarios, temporadas con historia, evolución visual constante mantienen frescura. |
| Sensación de castigo al fallar | Diseño explícito sin penalización dura (ver pilar 3). La racha se "congela", no se borra brutalmente (regla en `02`). |
| Onboarding demasiado largo | Límite duro: <90s, cero texto obligatorio. |
| Scope creep (demasiados hábitos) | MVP fija 8 hábitos. Nuevos hábitos = nuevos módulos (ver arquitectura). |
