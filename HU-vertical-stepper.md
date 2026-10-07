# HU: Stepper Vertical de Navegación por Secciones — flotante, colapsable, con vista previa

## Estado actual (análisis)

### Secciones principales (14)
`#top` → `#primer-paso` → `#perfil` → `#guia` → `#camino` → `#altitud` → `#territorio` → `#recorridos` → `#explorar` → `#aprender` → `#reto` → `#comunidad` → `#relatos` → `#momentos`

### Navegación existente
- 7 links visibles en nav desktop + drawer móvil (no muestran todas las secciones)
- `MB.nav.setActiveLink()` ya resalta el link activo con `aria-current="true"` (ui.js:205)
- CSS ya tiene estilos base para `[aria-current="true"]` (components.css:482)
- `.to-top` flotante abajo-derecha `z-index:150` (components.css:152), `.site-nav` `z-index:200` (tokens `--z-nav`)

### Qué falta
Un **rail vertical flotante** a la derecha que: (1) indique siempre dónde estás, (2) dé **vista previa** del nombre de cada sección sin ocupar una columna entera, (3) se pueda **contraer/retraer** a puntos mínimos, (4) no choque con `to-top` ni con el nav.

---

## Objetivo
Crear un stepper vertical flotante, colapsable, solo desktop, que complemente al nav (7 links) cubriendo las 14 secciones con scrollspy + progreso + vista previa al hover/foco.

---

## Principios UX/UI (tendencias 2025-2026)

1. **Dot-rail expandible, no lista permanente** — patrón Linear/Vercel/docs: puntos finos; solo el activo muestra etiqueta; el resto la revela en hover/foco como tooltip pill. Evita una columna de 14 filas.
2. **2 estados + memoria** — expandido (pill glass con etiquetas) / colapsado (solo riel). `localStorage mb-stepper-collapsed`. Default: **siempre colapsado**; expandir es a petición del usuario.
3. **Feedback doble** — punto activo (`--color-sand`) + barra de progreso vertical de página (scroll real, no solo índice). `prefers-reduced-motion`: sin smooth, sin transiciones.
4. **No estorbar la lectura** — fijo derecha-centro (`z-index:140`, bajo `to-top:150` y `nav:200`), `max-height:70vh` con scroll interno, `opacity` atenuada en scroll y plena en hover/foco/parada.
5. **Progresiva** — sin JS: sin stepper (`[hidden]` por defecto, JS lo desbloquea como hace `to-top`). Nunca contenido invisible por fallo (fail-open).
6. **Accesibilidad real** — `<nav aria-label>`, enlaces reales, `aria-current="true"` sincronizado con el nav principal, botón toggle con `aria-expanded` + `aria-controls`, foco visible, `scroll-padding-top:6rem` ya existente. Nada de `aria-hidden` sobre contenido interactivo.
7. **Móvil** — oculto en `<960px` (`display:none`). El drawer móvil ya cubre la navegación.
8. **Sin miniaturas de imagen** — decisión consciente: la vista previa es textual (etiqueta). Thumbnails para 14 secciones = coste perf/CLS sin aporte narrativo.

---

## Etiquetas cortas (vista previa)
| # | id | etiqueta |
|---|----|----------|
| 01 | `#top` | Inicio |
| 02 | `#primer-paso` | Primer paso |
| 03 | `#perfil` | Perfil |
| 04 | `#guia` | Guía IA |
| 05 | `#camino` | Tu camino |
| 06 | `#altitud` | Altitud |
| 07 | `#territorio` | Territorio |
| 08 | `#recorridos` | Recorridos |
| 09 | `#explorar` | Explorar |
| 10 | `#aprender` | Aprender |
| 11 | `#reto` | Reto |
| 12 | `#comunidad` | Comunidad |
| 13 | `#relatos` | Relatos |
| 14 | `#momentos` | Momentos |

---

## Plan de ejecución

### PASO 1 — HTML: estructura (`index.html`, antes de `.to-top`)
```html
<nav class="vertical-stepper" data-stepper data-collapsed="false" aria-label="Navegación por secciones" hidden>
  <span class="vertical-stepper__track" aria-hidden="true"><span class="vertical-stepper__fill" data-stepper-fill></span></span>
  <ol class="vertical-stepper__list" id="stepper-list">
    <li><a class="vertical-stepper__item" href="#top" data-stepper-link="top"><span class="vertical-stepper__dot" aria-hidden="true"></span><span class="vertical-stepper__label">Inicio</span></a></li>
    <!-- … 14 items … -->
  </ol>
  <button class="vertical-stepper__toggle" type="button" data-stepper-toggle aria-expanded="true" aria-controls="stepper-list" aria-label="Contraer navegación por secciones">
    <svg aria-hidden="true"><use href="#i-chevron-down"></use></svg>
  </button>
</nav>
```
- `<nav>` real (no `aside aria-hidden`). `[hidden]` por defecto → JS lo desbloquea.
- Iconos del sprite existente (`#i-chevron-down` rotado). Cero peticiones nuevas.

### PASO 2 — CSS: `assets/css/components.css`, bloque `VERTICAL STEPPER`
- Fijo: `right: max(var(--space-sm), env(safe-area-inset-right))`, `top:50%`, `translateY(-50%)`, `z-index:140`.
- Glass como nav scrolled: `rgba(11,16,15,0.78) + blur(16px)`, borde pill, `color: warm-white` siempre (legible sobre sección clara/oscura/bosque).
- Geometría con variables (`--sdot/--strack/--srow`): la línea va centrada al centro exacto de los dots (`left = sdot/2 - strack/2`, `top/bottom = srow/2`), sin valores a ojo. Filas compactas (`--srow:1.7rem`) para que las 14 quepan sin scroll interno; el `overflow:auto` queda solo como seguridad.
- Etiquetas `text-eyebrow` (11px) `medium`, activa en `semibold` + blanca.
- Track vertical 2px + fill `--color-sand` con altura = progreso real de scroll.
- Dot 10px, activo 12px sand + anillo; label `text-xs uppercase tracking-wide`.
- Expandido: labels visibles. Colapsado (`[data-collapsed="true"]`): labels ocultas salvo activa en tooltip + cualquier item muestra tooltip pill en `:hover/:focus-visible`.
- `.is-dim`: `opacity:.55` durante scroll, plena en hover/foco.
- `display:none` bajo `60rem`. `prefers-reduced-motion`: transiciones a `0.001ms` (hereda de `base.css`).
- Solo tokens, sin hex nuevos. Convención pill = interactivo.

### PASO 3 — JS: `MB.stepper` en `assets/js/ui.js` + wiring en `main.js`
- `MB.stepper.init()`: desbloquea `[hidden]`, restaura colapso (`localStorage`; default colapsado salvo `'0'` explícito), toggle con `aria-expanded` + persistencia, **scrollspy por posición en `rAF`** (última sección con `top <= 40% viewport`) que actualiza **a la vez** stepper + `.nav-links__item` + `.nav-drawer__link` (`aria-current`), progreso vía `scrollY/(doc-vh)`, `is-dim` con timeout 1.8s. NOTA: no se usa `IntersectionObserver` con `threshold:0.1` + banda `-40%/-55%` porque las secciones miden 900-3200px y el ratio visible nunca alcanza 0.1 — ese observer jamás dispara (bug heredado de `MB.nav.setActiveLink`, que se deja intacto).
- Fallback: sin `IntersectionObserver` → marca primera sección, sin romper.
- `main.js`: llamar `MB.stepper.init()` en comportamiento transversal. Mantener `MB.nav.setActiveLink()` como estaba (el stepper lo reutiliza, no lo duplica).
- Clicks: comportamiento ancla nativo (ya hay `scroll-behavior:smooth` + `scroll-padding-top:6rem` + respeta `reduced-motion`).

### PASO 4 — Commit y push
- Commit descriptivo, push a `origin/main`.

---

## Criterios de aceptación
- [ ] Visible solo en desktop (`≥960px`), oculto en móvil
- [ ] 14 puntos; el activo se actualiza al hacer scroll (sincronizado con nav)
- [ ] Vista previa: etiqueta del activo siempre visible; resto en hover/foco
- [ ] Toggle contrae a riel mínimo / expande a lista; persiste en `localStorage`; `aria-expanded` correcto
- [ ] Barra de progreso vertical refleja scroll real de página
- [ ] No tapa `to-top` ni nav; `max-height:70vh` con scroll interno si no caben
- [ ] Click navega a la sección (con offset de navbar)
- [ ] Teclado completo + foco visible + `aria-current`
- [ ] Respeta `prefers-reduced-motion`; sin JS no aparece y nada se rompe
- [ ] Sin breaking changes; solo tokens existentes
- [ ] Commit y push a `origin/main`
