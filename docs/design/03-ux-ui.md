# LevelUp — UX/UI, Motion, Sonido y Accesibilidad

> Define el CÓMO se ve y se siente. Referencia principal: **Archero** (dirección de arte y sensación de progreso constante). También: Duolingo (claridad + celebración) + Pokémon (criatura + aventura).

---

## 0. Dirección Archero (referencia maestra)

LevelUp debe transmitir la **sensación de avanzar constantemente** que tiene Archero. Reglas concretas que TODO debe cumplir:

1. **Personaje siempre visible y mejorando.** El héroe muestra su armadura por tier y **el equipamiento equipado se pinta encima** (capa, corona, arma, medalla, botas, orbe) con el color de su rareza. Más progreso = personaje visiblemente más equipado.
2. **Rareza con color y brillo** (la espina dorsal del progreso de loot):
   - Común = gris `#9CA3AF` · Raro = azul `#3B82F6` · Épico = morado `#A855F7` · Legendario = dorado `#F59E0B`.
   - Cada pieza lleva su color en el borde + un glow (sombra) de su rareza. El aura del personaje toma el color de su mejor pieza equipada.
3. **Juice en cada recompensa.** Al reclamar: **número "+XP" que sube y se desvanece** + destellos/partículas, sonido y háptica. Subir nivel/derrotar jefe = overlay con flash. Nada se gana en silencio.
4. **Mundos con bioma propio.** Cada zona del mapa tiene su **color** (Bosque verde, Volcán naranja, Castillo violeta, Cima celeste…) y su emoji-badge. Avanzar = cambiar de mundo.
5. **Outline + profundidad.** Los avatares SVG llevan **contorno oscuro** (`#1f2530`) y sombras blandas; las barras (XP/HP/atributos) son gruesas con gradiente. Look "chunky" y legible, no plano.
6. **Cofres y recompensas que estallan.** Las casillas de recompensa muestran cofre; al abrirlos (futuro), la recompensa sale flotando. Hoy: marcadores de cofre + glow de rareza.
7. **Paleta vibrante sobre fondo oscuro** (dark-first), con acentos saturados (violeta + dorado) y glows — no pasteles apagados.

> Regla de oro Archero: si una pantalla no comunica "estás avanzando", le falta algo (un número que sube, un brillo, una pieza nueva, un color de mundo).

---

## 1. Dirección de arte

**Estilo:** RPG de aventura moderno, **vectorial/ilustración limpia**, NO pixel-art, NO infantil.
- Formas suaves, esquinas redondeadas, profundidad sutil (sombras blandas, gradientes).
- Ilustraciones de personaje/mascota/zonas con personalidad pero estilizadas.
- "Premium y acogedor", como un juego mobile cuidado, no como una hoja de cálculo.

**Palabras clave de mood:** épico, cálido, vivo, claro, satisfactorio, orgulloso.

---

## 2. Sistema de color

Base **modo oscuro primero** (la app es de noche/mañana, el dark se siente premium y descansa la vista). Modo claro como variante.

### Paleta (tokens semánticos)
```
--bg-base        #0E1116  (fondo profundo, casi negro azulado)
--bg-elevated    #171B22  (cards, sheets)
--bg-overlay     #1F242D

--primary        #6C5CE7  (violeta mágico — XP, CTA principal, marca)
--primary-glow   #8B7BFF
--accent-xp      #FFD24A  (dorado — experiencia, niveles, recompensa)
--accent-success #2ECC71  (verde — hábito cumplido, mascota feliz)
--accent-danger  #E74C6F  (rojo cálido — Saboteador, recaída) NUNCA agresivo
--accent-water   #4AC4F0  (agua)
--accent-energy  #6C5CE7
--accent-strength#FF7A45  (fuerza)

--text-high      #F4F6FB
--text-mid       #A9B2C3
--text-low       #6B7689
```

### Color por atributo (consistencia visual)
| Atributo | Color |
|----------|-------|
| Vitalidad | Verde `#2ECC71` |
| Fuerza | Naranja `#FF7A45` |
| Disciplina | Violeta `#6C5CE7` |
| Energía | Azul `#4AC4F0` |
| Resistencia | Amarillo `#FFD24A` |

### Color por zona del mapa (ambiente)
Cada zona retematiza el fondo: Bosque (verdes), Montaña (azules fríos), Cueva (morados oscuros), Volcán (naranjas/rojos), Templo (dorados), Ciudad (neutros cálidos), Castillo (violetas regios), Cima (blancos/azul cielo).

---

## 3. Tipografía

- **Display / títulos:** una sans geométrica con carácter (p.ej. *Clash Display*, *Satoshi*, *Sora*). Para "MISSION COMPLETE", niveles, nombres de temporada.
- **UI / cuerpo:** sans legible y neutra (p.ej. *Inter*). Para todo el texto funcional.
- **Números grandes:** tabular, peso bold, para XP/nivel/stats (sensación de "marcador de juego").
- Jerarquía clara: 1 solo H1 por pantalla (también por accesibilidad).

---

## 4. Layout y componentes

- **Bottom tab bar** de 5 (Home, Mapa, Mascota, Stats, Yo) con iconos llenos/animados al seleccionar.
- **Cards** con esquinas 16-20px, sombra suave, borde sutil luminoso en elementos activos.
- **Barras de progreso** (XP, atributos, HP enemigo) con gradiente + animación de llenado.
- **Bottom sheets** para registrar hábitos (gesto natural, pulgar).
- **Touch targets** ≥ 48px. Acciones primarias grandes y centradas abajo.
- **Un CTA dominante por pantalla** (regla de oro de conversión).

### Componentes clave a construir (design system)
`XPBar`, `LevelBadge`, `AttributeBar`, `MissionCard`, `ClaimButton`, `CharacterStage` (render del personaje + capas de equipo), `PetStage`, `EnemyHealthBar`, `MapTrack`, `EventBanner`, `AchievementToast`, `StatCard`, `SeasonHeader`.

---

## 5. Motion (animación) — el alma del feedback

Principios: **fluido, con propósito, satisfactorio, nunca lento.** Spring-based, no lineal. 60fps siempre.

| Momento | Animación | Duración |
|---------|-----------|----------|
| Reclamar XP | La barra se llena con "juice" (overshoot), partículas doradas vuelan al contador | 600-900ms |
| Subir de nivel | Flash, el personaje pulsa/crece, número de nivel hace scale-up con spring | 1.2s |
| Cambio de tier | Cinemática: el personaje se transforma con destello | 2-3s |
| Mission Complete | Overlay full-screen, confeti/partículas, sello "COMPLETE" entra con bounce | 1.5s |
| Mascota feliz | Idle loop alegre, salta al reclamar | loop |
| Evolución mascota | Secuencia de transformación (huevo se rompe, brilla) | 2-3s |
| Daño al Saboteador | Barra HP baja con shake, el enemigo se encoge | 500ms |
| Avanzar casilla mapa | El marcador se desliza a la siguiente casilla con trail | 800ms |
| Abrir cofre | Tapa se abre, luz, objeto sale flotando | 1.5s |

- **Optimistic UI:** el resultado se muestra al instante; si falla algo (raro, es local), se revierte.
- **Sin spinners** ni skeletons que añadan delay percibido: transiciones instantáneas.
- **Respetar `prefers-reduced-motion`:** versión reducida (sin partículas/shakes; mantiene la información, quita el adorno).

**Herramientas:** Reanimated (UI thread) + Skia (efectos/partículas custom) + Lottie (celebraciones complejas pre-renderizadas: level up, cofre, evolución). Detalle técnico en `04`.

---

## 6. Sonido (cada acción importante debe sentirse satisfactoria)

Diseño de audio tipo RPG cálido, no estridente. Volumen contenido, respeta silencio del sistema.

| Evento | Sonido |
|--------|--------|
| Reclamar XP | "shimmer" ascendente + tintineo de monedas suave |
| Subir nivel | fanfarria corta y brillante |
| Cambio de tier | fanfarria épica más larga |
| Mission Complete | acorde de victoria + "whoosh" del sello |
| Abrir cofre | crujido + brillo + nota mágica |
| Evolución mascota | sonido tierno + mágico ascendente |
| Daño al Saboteador | impacto sordo satisfactorio |
| Fin de temporada | tema de victoria orquestal corto |
| Tap en misión / UI | clicks sutiles, táctiles |

- **Háptica** (vibración) acompaña los momentos clave en móvil (impact medium en claim, success en level up).
- Todo el audio es **opt-out** desde ajustes; respeta modo silencio.

---

## 7. Brand Voice & UX Writing

> Regla del proyecto: **NUNCA hardcodear textos.** Todo viene de archivos de copies (i18n en/es). Ver `04` para el sistema.

**Tono:** narrador de RPG que cree en ti. Épico pero cálido. Tutea. Cero jerga de productividad.

| Contexto | ❌ Evitar | ✅ LevelUp |
|----------|----------|-----------|
| Misión | "Tarea: hacer ejercicio" | "⭐ Misión principal: Entrena y forja tu Fuerza" |
| Completar | "Marcar como hecho" | "Reclamar recompensa" |
| Vacío | "No hay datos" | "Tu aventura está por escribirse. Completa tu primera misión." |
| Fallo / racha rota | "Has fallado. Racha perdida." | "El descanso también es parte del viaje. Mañana retomas la aventura." |
| Recaída alcohol | "Has bebido. -puntos" | "El Saboteador recuperó fuerzas. Mañana es tu revancha." |
| Level up | "Nivel +1" | "¡Has evolucionado! Tu yo del futuro está más cerca." |
| Carga | "Loading..." | (nada — transición instantánea; si acaso "Preparando tu aventura...") |

**Principios de copy:**
- Beneficio > función. Acción clara. Conversacional.
- Nunca culpa. El fallo es "parte del viaje".
- Lenguaje de aventura: misión, recompensa, aventura, forjar, evolucionar, derrotar, zona, jefe.

---

## 8. Accesibilidad (obligatorio)

- Contraste AA mínimo en texto sobre fondos (cuidado con texto sobre ilustraciones → usar capa/sombra).
- No comunicar SOLO por color (el Saboteador y los estados llevan icono + texto, no solo rojo/verde).
- Touch targets ≥ 48px.
- `prefers-reduced-motion` respetado (sección 5).
- Lectores de pantalla: etiquetas en iconos-acción, anuncios de level up / claim vía live region equivalente.
- Texto escalable (respeta tamaño de fuente del sistema).
- Sonido y háptica nunca son el único canal de información.
- Subtítulos/alternativa textual en celebraciones (el logro se anuncia, no solo se ve).

---

## 9. Checklist UX antes de entregar cualquier pantalla

- [ ] ¿Se completa en los mínimos taps posibles?
- [ ] ¿Está claro qué hacer sin leer instrucciones?
- [ ] ¿Hay feedback visual + sonoro + háptico en cada acción importante?
- [ ] ¿Un solo CTA dominante?
- [ ] ¿Empty state que invita a la aventura (no "sin datos")?
- [ ] ¿Funciona one-handed (pulgar) en móvil?
- [ ] ¿Respeta reduced-motion y contraste?
- [ ] ¿Todos los textos vienen de copies (cero hardcode)?
- [ ] ¿La animación aporta o solo retrasa?
- [ ] ¿Transmite progreso/orgullo en vez de obligación?
