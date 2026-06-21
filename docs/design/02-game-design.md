# LevelUp — Game Design, Economía y Balance

> El "manual del juego". Números concretos para implementar. Todos los valores son **configurables** (viven en data, no hardcodeados) — ver `04-architecture.md`.

---

## 1. Filosofía de la economía

- **Única moneda: la constancia real.** No hay oro, gemas ni compras.
- **XP** es el recurso central → sube niveles → desbloquea evolución, mapa, equipo, logros.
- **Atributos** dan profundidad (sub-progresiones por área de vida).
- Economía **inflacionaria controlada**: ganar es fácil al principio (dopamina temprana) y se vuelve más exigente (compromiso a largo plazo), pero **nunca frustrante**.

---

## 2. Experiencia (XP) — valores base

| Acción | XP base | Notas |
|--------|--------:|-------|
| No beber alcohol (día limpio) | **150** | El más valioso: es el objetivo emocional central |
| Entrenar | **120** | Misión principal frecuente |
| Dormir +7h | **80** | |
| Caminar 10.000 pasos | **70** | Escalable por tramos (ver 2.1) |
| Comer bien | **60** | |
| Leer | **50** | |
| Beber 2L de agua | **40** | Acumulable por vasos (ver 2.1) |
| Meditar | **30** | |

**Máximo diario base** (todos los hábitos): `150+120+80+70+60+50+40+30 = 600 XP/día`.

### 2.1 XP parcial (hábitos graduales)
No todo es 0/100. Para hábitos numéricos damos XP proporcional para que el esfuerzo parcial también cuente (refuerza, no castiga):

- **Agua:** 10 XP por cada 0,5 L, máx 40 (a los 2 L). 
- **Pasos:** 7 XP por cada 1.000 pasos, máx 70 (a los 10.000). Bonus +20 si superas 15.000.
- **Sueño:** 0 si <5h; escala lineal 5h→7h; full 80 a partir de 7h; cap.
- **Lectura/meditación:** booleano simple en MVP (o por minutos en v2).

### 2.2 Multiplicadores (eventos diarios)
Aplican sobre el XP base de una acción concreta (ver sección 9). Ej.: "Llueve → entrenar x2" convierte 120 en 240. Se muestran SIEMPRE antes de reclamar para que el usuario lo sienta.

### 2.3 Bonus de racha
La constancia se premia con un multiplicador global suave al XP del día:

| Racha (días) | Multiplicador global |
|--------------|----------------------|
| 0-2 | x1.00 |
| 3-6 | x1.05 |
| 7-13 | x1.10 |
| 14-29 | x1.15 |
| 30-99 | x1.20 |
| 100+ | x1.25 (cap) |

> Suave a propósito: premia sin hacer que perder la racha se sienta catastrófico.

### 2.4 Penalización por fallar (decay) — "El personaje se oxida"

> Decisión del usuario (overrides el brief original "sin castigos"): **fallar tiene consecuencia real de XP.** Lo diseñamos con red de seguridad para que pese sin provocar abandono. Filosofía: **consecuencia sin culpa** (ver `00 §5` pilar 3).

**Reglas:**
- **Disparador:** cada **hábito activo** (de los que el usuario eligió) que **no se complete en el día** resta XP, de forma **independiente** por hábito.
- **Cuantía:** `penalización = round(XP_base_del_hábito * MISS_PENALTY_RATIO)`, con `MISS_PENALTY_RATIO = 0.25`. Restas **un cuarto** de lo que habrías ganado. Tabla:

  | Hábito fallado | XP que perdías de ganar | Penalización (×0.25) |
  |----------------|------------------------:|---------------------:|
  | No beber alcohol | 150 | **-38** |
  | Entrenar | 120 | **-30** |
  | Dormir +7h | 80 | **-20** |
  | Caminar 10k | 70 | **-18** |
  | Comer bien | 60 | **-15** |
  | Leer | 50 | **-13** |
  | Agua 2L | 40 | **-10** |
  | Meditar | 30 | **-8** |

  Peor caso (8 hábitos activos, día totalmente vacío) = **-152 XP/día** (suma de la columna).

- **SUELO DURO (red de seguridad):** el XP total **nunca baja del umbral de tu nivel actual**. Es decir, **nunca bajas de nivel** ni "desevolucionas" tu personaje. En el peor de los abandonos te quedas al inicio de tu nivel, esperándote.
- **Solo hábitos activos:** no se penaliza un hábito que el usuario no eligió.
- **Cuándo se aplica:** al pasar de día (00:00 local). Al reconciliar el día anterior, por cada hábito activo no reclamado → resta (respetando el suelo).
- **Sin culpa en el copy:** "Tu personaje se oxidó un poco. Una misión hoy y vuelves a brillar." Nunca "fallaste / perdiste".
- **Interacción con el Saboteador:** fallar "no beber" ya le cura +150 HP; la penalización de -38 XP es adicional y coherente (es el enemigo principal).

**Balance resultante:** un usuario constante gana mucho más de lo que pierde (máx +600 vs máx -150). Un usuario que falla mucho frena su progreso y ve a su personaje "oxidarse", pero **nunca pierde lo conseguido** → siente la consecuencia sin caer en la espiral de rendirse. `MISS_PENALTY_RATIO` es configurable para rebalancear.

---

## 3. Curva de niveles

**Fórmula de coste para subir de nivel L → L+1:**

```
xpParaSiguiente(L) = round(100 * L^1.7)
```

Diseño (rebalanceado, **más exigente**): primeros niveles rápidos para enganchar, pero la curva sube con fuerza → subir de nivel medio/alto es un logro de **constancia de semanas**, no de días.

| Nivel actual L | XP para subir a L+1 | XP acumulada para alcanzar este nivel |
|---:|---:|---:|
| 1 | 100 | 0 |
| 2 | 325 | 100 |
| 3 | 647 | 425 |
| 4 | 1.056 | 1.072 |
| 5 | 1.543 | 2.128 |
| 6 | 2.103 | 3.671 |
| 7 | 2.733 | 5.774 |
| 8 | 3.430 | 8.507 |
| 9 | 4.190 | 11.937 |
| 10 | 5.012 | 16.127 |
| 11 | 5.893 | 21.139 |
| 12 | 6.833 | 27.032 |
| 13 | 7.829 | 33.865 |
| 14 | 8.880 | 41.694 |
| 15 | 9.985 | 50.574 |
| 20 | 16.284 | 112.592 |
| 30 | 32.442 | 344.398 |
| 50 | 77.312 | 1.393.275 |

### Ritmo esperado (validación del balance)
Con XP máx/día ≈ 600 (perfecto) y ≈ 450 (comprometido con racha):
- **Niveles 1-3:** día 1 (enganche inmediato).
- **Nivel 5:** ~día 4-6.
- **Nivel 10:** ~**27 días** (perfecto) a ~**36 días** (comprometido) → un mes de constancia. Cruzar a **Guerrero** (tier) se siente ganado.
- **Nivel 20 (Veterano):** ~6-8 meses. **Nivel 50 (Leyenda):** años — meta de por vida.

> Decisión: la curva anterior (`60·L^1.5`) era demasiado blanda (nivel 10 en ~12 días). Esta hace que cada nivel pese. Para retocar dificultad solo se cambian `LEVEL_CURVE_BASE`/`LEVEL_CURVE_EXPONENT` en `data/levels.ts` (cero cambios de lógica).

---

## 4. Atributos (sub-progresión)

5 atributos. Cada hábito sube uno o varios. Son **barras independientes** que dan identidad al personaje y desbloquean efectos visuales.

| Atributo | Sube con | Significado |
|----------|----------|-------------|
| **Vitalidad** | No alcohol, agua, comer bien | Salud / vida |
| **Fuerza** | Entrenar | Poder físico |
| **Disciplina** | Leer, meditar | Mente / constancia |
| **Energía** | Dormir | Descanso / vigor |
| **Resistencia** | Caminar / cardio | Aguante |

**Puntos de atributo por acción:** cada acción da `floor(XP_base / 10)` puntos a su atributo principal.
Ej.: entrenar → +12 Fuerza; no alcohol → +15 Vitalidad; dormir → +8 Energía.

**Niveles de atributo:** cada atributo sube de rango cada 100 puntos (Rango I, II, III...). Rangos altos = efectos cosméticos (aura, brillo del arma, etc.). No afectan la jugabilidad (no hay combate por stats), son **expresión de progreso**.

---

## 5. Evolución del personaje (tiers visuales)

El personaje = "tu yo del futuro". Cambia de aspecto al cruzar umbrales de nivel.

| Tier | Niveles | Aspecto |
|------|---------|---------|
| **Iniciado** | 1-4 | Básico: ropa simple, postura encorvada |
| **Aprendiz** | 5-9 | Mejor ropa, postura más firme, primer accesorio |
| **Guerrero** | 10-19 | Armadura ligera, capa, postura confiada |
| **Veterano** | 20-34 | Armadura completa, detalles, aura tenue |
| **Héroe** | 35-49 | Equipo épico, efectos de partículas |
| **Leyenda** | 50+ | Aspecto legendario, animaciones únicas, aura intensa |

Cada cambio de tier es un **momento Level-Up especial** (animación ampliada, "Has evolucionado").
Dentro de un tier, los atributos altos y el equipamiento (sección 8) añaden variación visual continua.

---

## 6. La Mascota (vínculo emocional)

La mascota es un **espejo afectivo** del usuario: su bienestar depende de tu constancia. Nunca muere (regla dura — sin culpa).

### 6.1 Ciclo de vida
```
🥚 Huevo  →  🐣 Cría  →  🐥 Joven  →  🦅 Adulta  →  ✨ Evolución final
```
Avanza por **días de cuidado acumulados** (días con al menos la misión principal cumplida), no por nivel del personaje:

| Etapa | Días de cuidado |
|-------|-----------------|
| Huevo | 0-2 |
| Cría (nace) | 3 |
| Joven | 10 |
| Adulta | 25 |
| Evolución final | 60 (fin de un ciclo de temporadas) |

> El nacimiento (día 3) coincide con el primer "tramo" de la Temporada 1 → recompensa temprana memorable.

### 6.2 Estados de ánimo (según constancia reciente)
Se basa en los **últimos 3 días**:

| Estado | Condición | Comportamiento visual |
|--------|-----------|------------------------|
| 😄 Feliz | 1+ misión hoy | Corre, juega, salta, celebra al reclamar |
| 🙂 Bien | misión ayer, no hoy aún | Activa, espera |
| 😴 Cansada | 1-2 días sin cumplir | Bosteza, se mueve lento |
| 😢 Triste | 3+ días sin cumplir | Cabizbaja, duerme mucho |

Al volver a cumplir tras un bajón: **animación especial de reencuentro** ("¡te echaba de menos!"). Refuerza el vínculo, jamás regaña.

### 6.3 Reglas duras
- ❌ La mascota **nunca muere ni se va**.
- ❌ Su tristeza **no resta XP ni nada**: es solo representación emocional.
- ✅ Volver siempre la recupera rápido (en 1 día cumplido pasa de triste a feliz).

---

## 7. El Saboteador (el alcohol como enemigo)

El alcohol no es un hábito en una lista: es el **antagonista** del juego.

### 7.1 Mecánica (Temporada 1)
- El Saboteador tiene **HP**. Objetivo: reducirlo a 0 → derrotarlo al final de la temporada.
- **Día sin alcohol → le quitas vida.** 
- **Recaída → recupera algo de vida** (no game over, solo retrasa).

**Números (Temporada 1, 21 días):**
- HP inicial: **2.100**.
- Daño por día limpio: **100**.
- Curación por recaída: **+150** (nunca por encima del HP máx).
- 21 días limpios perfectos = 2.100 daño = derrota justo al final. ✅
- Margen: como el máximo daño teórico (2.100) iguala el HP, una recaída obliga a "recuperar" días → tensión narrativa real pero superable (los días extra de la temporada o el bonus de fin de semana compensan).

### 7.2 Representación visual
- Barra de HP del Saboteador en Home (parte inferior).
- Se ve más débil, encogido y desvaído conforme baja su HP.
- Al derrotarlo: **cinemática de victoria** + recompensa de temporada.
- En recaída: el Saboteador "sonríe" y recupera algo de color. **Sin texto de culpa** — solo "El Saboteador recupera fuerzas. Mañana es tu revancha."

### 7.3 Escalado por temporada
Cada temporada puede tener su propio antagonista temático (el Saboteador evoluciona o aparecen otros: la Pereza, la Excusa...). Mismo patrón de mecánica.

---

## 8. Equipamiento (cosmético, todo desbloqueable)

Sin compras. Se obtiene por **logros, niveles y temporadas**. Solo estético; cero ventaja de juego.

| Objeto | Cómo se desbloquea | Slot |
|--------|--------------------|------|
| Botella Legendaria | 7 días sin alcohol | Accesorio |
| Libro del Sabio | 30 lecturas | Mano |
| Botas del Explorador | 50 km caminados | Pies |
| Guantes del Guerrero | 100 entrenamientos | Manos |
| Medalla de Constancia | 100 días de racha | Pecho |
| Capa del Renacido | Completar Temporada 1 | Espalda |
| Corona de Disciplina | Completar Temporada 4 | Cabeza |

El usuario equipa lo que quiera desde la pantalla "Yo". Cada pieza modifica el render del personaje.

---

## 9. Eventos diarios

Cada mañana, un evento que cambia las reglas del día → cada día se siente distinto. Se elige 1 evento al azar (ponderado) del pool, mostrado al abrir la app.

| Evento | Efecto | Condición/Tema |
|--------|--------|----------------|
| 🌧️ Día lluvioso | Entrenar da **XP x2** | Aleatorio |
| 🎉 Tentación del finde | No beber da **XP x3** | Viernes/sábado |
| 🌙 Noche reparadora | Dormir +7h sube **Disciplina extra** | Aleatorio |
| 💧 Ola de calor | Agua da **XP x2** | Aleatorio |
| 🏃 Camino abierto | Pasos dan **XP x1.5** | Aleatorio |
| 📖 Día de claridad | Leer da **XP x2** | Aleatorio |
| ⚔️ Día de revancha | Daño al Saboteador **x2** | Tras una recaída |
| 🌟 Día dorado | **Todo el XP x1.5** | Raro (1/semana aprox) |

Reglas:
- Máximo 1 evento activo por día.
- El evento se muestra como banner tappable en Home (con su narrativa corta).
- Los eventos son **siempre positivos** (bonus), nunca penalizaciones.

---

## 10. Misiones diarias

- **1 misión principal** (destacada, suele ser entrenar o el foco de la temporada).
- **3-5 secundarias** (resto de hábitos activos del usuario).
- Generadas cada día a las 00:00 local según los objetivos elegidos + la temporada activa.
- **Mission Complete:** cuando se cumplen TODAS las del día → overlay celebratorio (sonido, partículas, "MISSION COMPLETE"), bonus de XP de cierre de día (+50).

---

## 11. Temporadas

Estructura narrativa de medio plazo. **Se desbloquean en orden** (no se saltan).

| # | Nombre | Duración | Foco | Antagonista | Recompensa |
|---|--------|----------|------|-------------|------------|
| 1 | **RESET** | 21 días | Sin alcohol, entrenar, dormir, agua, caminar | El Saboteador | Capa del Renacido + Mapa Bosque→Cima |
| 2 | **STRENGTH** | 30 días | Fuerza, proteína, progresión | La Comodidad | Equipo de Guerrero + zona Montaña |
| 3 | **CUT** | 30 días | Nutrición, déficit, pasos, cardio | La Tentación | Aura de Definición + zona Volcán |
| 4 | **DISCIPLINE** | 60 días | Hábitos avanzados, constancia, rutinas | El Caos / La Excusa | Corona de Disciplina + zona Castillo |

Cada temporada tiene: **su mapa, sus logros, sus recompensas, su antagonista, sus frases, su pantalla de inicio** (splash narrativo propio).

**Desbloqueo:** completar la temporada anterior (llegar al final del mapa / derrotar al jefe). Si fallas días, la temporada **no expira por tiempo**: avanzas por días cumplidos, no por fecha (clave para no castigar). El "día de la temporada" = nº de días con misión principal cumplida.

> Decisión de diseño importante: temporadas medidas en **días cumplidos**, no en días de calendario. Así, faltar un día retrasa pero nunca "pierde" la temporada. Constancia sobre perfección.

---

## 12. El Mapa de aventura

Reemplaza al calendario como elemento principal. Cada **casilla = un día de la temporada**; cada **zona = una semana** (o tramo).

```
🌳 Bosque → ⛰️ Montaña → 🕳️ Cueva → 🌋 Volcán → 🏛️ Templo → 🏙️ Ciudad → 🏰 Castillo → 🗻 Cima
```

- Avanzas una casilla por día cumplido (al menos la misión principal).
- Cada zona cambia el **fondo, paleta y música/ambiente**.
- La casilla final de la temporada contiene al **jefe** (el antagonista).
- Casillas especiales: cofres (recompensa), eventos narrativos, mini-hitos.
- El mapa es navegable: ver pasado (lo recorrido, con orgullo) y futuro (lo que viene, con curiosidad).

---

## 13. Logros

Muchos, de todo tipo. Categorías y ejemplos (lista de arranque ~25 para MVP; ampliable):

**Primeras veces**
- Primer entrenamiento · Primer día limpio · Primera misión completa · Nace tu mascota.

**Constancia (rachas)**
- 7 / 21 / 30 / 50 / 100 / 365 días de racha.

**Volumen**
- 100 entrenamientos · 50 km caminados · 100 lecturas · 100 días limpios.

**Progresión**
- Nivel 5 · Nivel 10 · Nivel 25 · Nivel 50.

**Temporadas**
- Completar RESET · Completar las 4 temporadas · Derrotar al Saboteador sin recaídas.

**Hábitos específicos**
- 7 noches durmiendo +7h · 30 días bebiendo 2L · Semana perfecta (todo cada día 7 días).

Cada logro: icono, título, descripción, recompensa (XP y/o cosmético), animación de desbloqueo + sonido.

---

## 14. Diario nocturno

- Se ofrece por la noche (no obligatorio, sin culpa si se salta).
- 2 preguntas fijas: **"¿Cómo me sentí hoy?"** y **"¿Qué aprendí hoy?"**
- Respuesta libre + selector de ánimo (emoji/escala).
- Da un pequeño bonus de XP (+15) por reflexionar.
- Consultable en el tiempo: timeline de entradas → el usuario ve su evolución emocional (insight, no métrica fría).

---

## 15. Estadísticas (visuales, orgullo medible)

Nada de tablas enormes. Tarjetas visuales con números grandes y micro-gráficos:

- Nivel y XP total.
- Entrenamientos totales.
- **Días sin alcohol** (contador grande, el más destacado).
- **Dinero ahorrado** (configurable por el usuario): `días sin alcohol × cervezas/día × precio por cerveza`. Defaults: 3 cervezas/día × 2,50 € = 7,50 €/día. El usuario edita precio y cantidad en Ajustes.
- Peso (si el usuario lo registra; opcional).
- Rachas (actual y récord).
- Horas dormidas (media semanal).
- Km caminados.

Cada stat enlaza con su narrativa ("Has ahorrado 240€ y evitado 30 resacas").

---

## 16. Resumen de balance (cheat-sheet para implementar)

```
XP base/día máx:        600 (sin multiplicadores)
Bonus racha:            x1.00 → x1.25
Eventos:                x1.5 / x2 / x3 sobre acción concreta
Penalización/fallo:     -round(XP_base * 0.25) por hábito activo fallado
                        SUELO: nunca bajas del umbral de tu nivel (no de-level)
                        Peor día: -152 XP
Coste nivel L→L+1:      round(100 * L^1.7)   (rebalanceado, más exigente)
Nivel 10:               16.127 XP acumulada (~27-36 días)
Nivel 20 / 50:          112.592 / 1.393.275 XP acumulada
Puntos atributo/acción: floor(XP_base / 10)
Rango de atributo:      cada 100 puntos
Mascota nace:           día 3 de cuidado
Saboteador (T1):        HP 2100, daño 100/día, cura recaída +150
Temporadas:             se miden en DÍAS CUMPLIDOS, no calendario
Mission Complete bonus: +50 XP
Diario nocturno bonus:  +15 XP
Dinero ahorrado:        días_sin_alcohol × cervezas/día × precio  (config usuario; def 3 × 2,5€)
```

Todos estos valores viven en archivos de configuración/datos versionables, para poder **rebalancear sin tocar lógica**.
