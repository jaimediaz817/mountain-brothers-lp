# HU: Stepper Vertical de Navegación por Secciones

## Estado actual (análisis)

### Secciones principales (14)
`#top` → `#primer-paso` → `#perfil` → `#guia` → `#camino` → `#altitud` → `#territorio` → `#recorridos` → `#explorar` → `#aprender` → `#reto` → `#comunidad` → `#relatos` → `#momentos`

### Navegación existente
- 7 links visibles en nav desktop + drawer móvil (no muestran todas las secciones)
- `MB.nav.setActiveLink()` ya resalta el link activo con `aria-current="true"` (ui.js:204-232)
- CSS ya tiene estilos base para `[aria-current="true"]` (components.css:482-493)

### Qué falta
Un **indicador vertical visual** (stepper) que muestre en qué sección estás al hacer scroll, independientemente de los links del nav.

---

## Objetivo
 Crear un stepper vertical fijo que indique visualmente la sección actual al navegar por la página.

---

## Principios de usabilidad UX/UI

1. **Feedback inmediato** — el punto activo debe cambiar al hacer scroll, sin delay perceptible
2. **Posición predecible** — fijo en lateral derecho, siempre visible en desktop
3. **Progresiva** — sin JS: sin stepper (fallback a nav links con aria-current)
4. **Accesibilidad** — `aria-hidden="true"` + `aria-label`; teclado: click en puntos → scrollTo suave
5. **Reduced motion** — sin animaciones si el usuario pide menos movimiento
6. **Móvil** — oculto en pantallas < 960px (el drawer móvil ya cubre la navegación)

---

## Plan de ejecución (4 pasos)

### PASO 1 — HTML: Estructura del stepper
- Añadir `<aside class="vertical-stepper">` fijo en el lado derecho de la viewport
- Contenido: línea vertical + puntos por sección + etiquetas al hover
- Solo visible en pantallas ≥ 960px (desktop)
- `aria-hidden="true"` + `aria-label` para accesibilidad

### PASO 2 — CSS: Estilos del stepper
- Posición fija, lateral derecho, centro vertical
- Línea de fondo sutil (var line)
- Puntos circulares por sección, activo resaltado con `--color-sand`
- Transiciones suaves (`var(--dur-sm)`)
- Oculto en móvil y con `prefers-reduced-motion`

### PASO 3 — JS: Lógica de actualización
- Extender `MB.nav.setActiveLink()` o crear `MB.stepper.init()`
- Usar el mismo `IntersectionObserver` existente
- Actualizar punto activo + mover vista del stepper si es necesario
- Soporte para click en puntos → `scrollTo` suave

### PASO 4 — Commit y push
- Commit con mensaje descriptivo
- Push a `origin/main`

---

## Criterios de aceptación
- [ ] Stepper visible en desktop (≥ 960px)
- [ ] Punto activo se actualiza al hacer scroll
- [ ] Click en puntos navega a la sección correspondiente
- [ ] Oculto en móvil
- [ ] Respeta `prefers-reduced-motion`
- [ ] Sin breaking changes en la página existente
- [ ] Commit y push a `origin/main`