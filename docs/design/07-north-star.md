# LevelUp — Estrella polar: el mundo vivo (por qué volverás cada día)

> La pregunta clave del proyecto. Si la respuesta es "marco un check y gano XP", a las 2-3 semanas se acaba la novedad y se cierra la app. Este documento define cómo evitarlo **sin combate ni minijuegos**, manteniendo el foco en la vida real.

---

## 0. El principio que lo cambia todo: premia la EXPECTATIVA, no el clic

Si la recompensa llega **al marcar** el hábito, el cerebro aprende: *abro → marco → cierro*.

Si la recompensa llega **después**, se crea **expectativa** → un motivo real para volver.

**El loop nuevo (anti-engagement, en serio):**
```
Mañana: entrenas (vida real) → marcas el hábito
        → tu héroe/mascota sale de EXPEDICIÓN durante el día (tú vives tu vida)
Noche:  vuelves para DESCUBRIR qué trajo
        → te apetece repetir mañana
```
No pasas horas dentro de la app. Tienes un motivo para regresar. Y el foco sigue en mejorar tu vida, no en usar la app.

> **Regla de oro:** la **consecuencia** del hábito (XP, racha, óxido, mascota) es **inmediata y honesta**. Lo que se **difiere** es el **descubrimiento** (cosmético, fragmento, historia, hallazgo). El XP se sigue ganando solo trabajando.

---

## 1. Los 7 motores → sistemas concretos

| Motor psicológico | Sistema en LevelUp |
|---|---|
| **1. Ver "qué cambió"** (progreso visual) | El **CAMPAMENTO** que crece (tienda→fogata→casa→taller→establo→jardín→biblioteca…). Cada hito construye algo. La Home deja de ser una barra: es un lugar que evoluciona. |
| **2. Coleccionismo** | **Enciclopedia de Descubrimientos** + cosméticos, títulos, insignias, fondos, mascotas, cartas. Sistemas que aguantan 100s de ítems; se siembran pocos y crecen. |
| **3. Sorpresa** | **Recompensa variable** al volver de expedición: cofre, regalo de la mascota, objeto raro, zona secreta, carta de un NPC. Nunca sabes qué tocará. |
| **4. Historia** | **Capítulos de 20s** que avanzan **solo cuando mejoras hábitos**. Llegas a un bosque → ruinas → conoces a alguien → reconstruís un pueblo. |
| **5. Personalización** | Ropa, peinado, armadura, colores, mascota, **casa/campamento**, icono, marco. No cambia el juego: cambia el **orgullo**. |
| **6. Base que evoluciona** | El **CAMPAMENTO** (ver motor 1). La "moneda" es la disciplina. La idea más diferenciadora. |
| **7. Mascota con personalidad** | La mascota **hace cosas** (lee, entrena, duerme, pesca, junto al fuego). Mundo vivo. |
| **+ NPCs** | Herrero, exploradora, anciana sabia, entrenador, cocinero, bibliotecario. Frases cortas que reaccionan a TUS hábitos ("llevas 5 entrenamientos, se nota"). |
| **+ Descubrimientos** | No "subes nivel": **descubres** (receta, mariposa, planta, ciervo, templo, libro). Quieres completar la enciclopedia. |

---

## 2. La arquitectura unificadora

> **Tu disciplina alimenta un mundo vivo que evoluciona mientras vives tu vida real. No juegas a la app: cuidas un mundo que crece con tu constancia y vuelves a descubrir qué cambió.**

Tres capas:
1. **El motor honesto** (ya existe): hábitos → XP/nivel/racha/atributos/óxido/temporada. La verdad del esfuerzo. No se toca.
2. **El mundo persistente** (nuevo): el **campamento** + la mascota + NPCs + enciclopedia. Es el lienzo del "¿qué cambió?".
3. **El loop de expectativa** (nuevo, la bisagra): cumplir → **expedición** → volver a descubrir. Conecta la capa 1 con la 2 difiriendo el descubrimiento.

---

## 3. Guardarraíles de diseño sano (que no se nos escape a manipulación)

- **Nada se pudre ni caduca.** La expedición espera pacientemente; vuelves cuando vuelves. Curiosidad, no ansiedad. Sin "vuelve o pierdes".
- **La consecuencia honesta es inmediata** (XP, racha, mascota). Lo diferido es **solo upside** (descubrimiento). Saltarte un día sigue teniendo su coste real; la expedición nunca te castiga por tardar.
- **La app sigue empujándote a SALIR.** El descubrimiento de la noche premia que viviste tu día, no que estuviste en la app.
- **El campamento se construye con disciplina, no con tiempo de pantalla ni dinero.** Cero compras.

---

## 4. La realidad honesta de alcance: SISTEMAS vs ARTE

- **Los sistemas son código** (los puedo construir): temporizador de expedición, máquina de estados del campamento, desbloqueo de descubrimientos, disparadores de diálogo de NPC, flags de historia, colecciones, personalización.
- **El "wow" es ARTE y CONTENIDO** (el cuello de botella real): un campamento ilustrado que crece, la mascota animada haciendo cosas, retratos de NPC, 80 cosméticos, escenas de bioma. Eso es pipeline de **ilustración / Rive**, no de programación.
- **Estrategia:** construir los **sistemas ya** con arte placeholder (SVG/emoji), probar que el loop engancha, y **producir/encargar el arte** después (cuando el sistema demuestre su valor). El sistema aguanta crecer de 5 a 100 ítems sin reescribir.

---

## 5. Plan por fases (de mayor a menor palanca)

- **Fase A — Loop de Expedición (la bisagra).** Cumplir la misión principal lanza una expedición (dura tu jornada, p.ej. resoluble a partir de X horas o al día siguiente, **sin caducar**). Al volver, recompensa variable → alimenta Descubrimientos/cosméticos/historia. Cambia el núcleo de "click→premio→cierro" a "actúa→el mundo se mueve→vuelve a descubrir". **Empezar aquí.**
- **Fase B — El Campamento (el lienzo del "qué cambió").** Estado persistente que construye estructuras por hitos; los hallazgos de expedición materializan aquí. Sustituye/expande la Home.
- **Fase C — Descubrimientos / Enciclopedia.** Colección con entradas; las expediciones y hábitos las desbloquean.
- **Fase D — Historia + NPCs.** Capítulos de 20s y habitantes que reaccionan a tus hábitos, avanzando solo con constancia.
- **Fase E — Personalización amplia.** Cosméticos para héroe/mascota/campamento; marcos, iconos.
- **Transversal — Pipeline de ARTE** (Rive/ilustración) cuando se decida invertir: es lo que convierte "digno" en "inolvidable".

---

## 6. Recomendación

Empezar por la **Fase A (Expedición)**: es la idea de mayor palanca (cambia el porqué-vuelvo) y la más fiel a la filosofía anti-engagement. Con arte placeholder ya transforma la sensación. Luego el **Campamento** como lugar donde todo eso se ve crecer.

> Esto convierte LevelUp de "tracker con piel de RPG" a "un mundo que crece con tu vida real". Es un proyecto de meses y una inversión de arte — pero el sistema empieza ahora.
