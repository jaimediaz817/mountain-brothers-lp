# Mountain Brothers — Landing

Landing page minimalista para **Mountain Brothers** (Quindío, Colombia): ecosistema de
aire libre, tecnología y comunidad. Construida en **HTML + CSS + JavaScript vanilla**,
sin frameworks, sin build ni dependencias, para poder abrirla con doble clic desde el
sistema de archivos o servirla con cualquier servidor estático.

> **Contenido demo.** El test, el guía IA y el buscador son demostraciones funcionales
> con escenarios preparados. No hay backend, no se envía nada a ningún servidor y eso
> se declara explícitamente en la interfaz.

---

## 1. Cómo abrirla

```bash
# Opción A · doble clic sobre index.html (funciona por file://)

# Opción B · servidor local (recomendado para revisar con DevTools)
cd mountain_brothers
python -m http.server 8080
# → http://localhost:8080
```

No hay paso de instalación ni de compilación: no existe `package.json` a propósito.

---

## 2. Estructura

```
mountain_brothers/
├── index.html                 # Única página · 14 secciones · sprite SVG inline
├── assets/
│   ├── css/
│   │   ├── tokens.css         # Variables: paleta, tipografía, espaciado, capas z
│   │   ├── base.css           # Reset, tipografía, utilidades, fallback sin JS
│   │   ├── components.css     # Componentes reutilizables (btn, card, chat, quiz…)
│   │   └── sections.css       # Estilos propios de cada una de las secciones
│   ├── js/
│   │   ├── config.js          # Punto único de configuración de imágenes y vídeo
│   │   ├── data.js            # Contenido: test, guía, knowledge, territorios, retos
│   │   ├── ui.js              # Utilidades, componentes y vídeo con autoplay
│   │   ├── quiz.js            # Test del aventurero (6 preguntas · 4 perfiles)
│   │   ├── guide.js           # Mountain AI Guide (chat demostrativo)
│   │   ├── knowledge.js       # Mountain Knowledge (buscador + fichas <details>)
│   │   └── main.js            # Arranque, menú, reveals, scrollspy, cierre
│   ├── images/                # Logotipo, favicon y placeholders SVG (ver §4)
│   ├── videos/                # Vídeo intro oficial (intro-mb.mp4) + registro de escalada
│   └── audios/                # Podcast de Relatos de la Montaña (M4A)
└── README.md
```

**Orden de los estilos:** `tokens → base → components → sections`. Si un valor no
está en `tokens.css`, no se usa en ningún otro sitio.

---

## 3. Secciones de la página

1. **Hero** — declaración de principios + dos CTAs
2. **El camino** — intro, vídeo oficial y tres perfiles de entrada
3. **Test del aventurero** — quiz funcional con resultado y siguiente paso
4. **Mountain AI Guide** — chat demostrativo con progreso en 5 dimensiones
5. **Tu camino** — rutas, disciplinas y colchón de seguridad
6. **El territorio** — cinta de color vivo, carrusel de flora (palma de cera y
   frailejones), Quindío, valle de Cocora, páramo, Nevados y Tolima
7. **Recorridos** — guías de ruta con ficha técnica, equipo, seguridad e infografía
8. **Experiencias** — cinco propuestas con grilla asimétrica
9. **Mountain Knowledge** — buscador con filtros y fichas desplegables
10. **El reto de la cumbre** — objetivo vivo, hitos y advertencia honesta
11. **Comunidad** — tres líneas de trabajo
12. **Relatos de la Montaña** — programa de historias: podcast (audio) + registro visual (vídeo)
13. **CTA final** — cierre editorial
14. **Footer** — navegación, territorio y notas

---

## 4. Cambiar las imágenes por fotos reales

Los SVG de `assets/images/` son **placeholders editoriales** (gradientes + formas),
coherentes con la paleta, para que la grilla y los aspect ratios estén resueltos sin
depender de fotos que aún no existen.

### 4.1 Fotografías del cuerpo de la página

Todo pasa por **`assets/js/config.js`**, en el mapa `MB.config.images`:

```js
images: {
  'logo':          'assets/images/logo-mb.png',
  'palma-cera':    'assets/images/palma-cera.jpg',    // carrusel Territorio
  'frailejon-1':   'assets/images/frailejon-1.jpg',   // carrusel Territorio
  'frailejon-2':   'assets/images/frailejon-2.jpg',   // carrusel Territorio
  'hero-mountain': 'assets/images/hero-mountain.webp',  // era .svg
  'cocora':        'assets/images/cocora.webp',
  'paramo':        'assets/images/paramo.webp',
  'nevados':       'assets/images/nevados.webp',
  'tolima':        'assets/images/tolima.webp',
  'hiking':        'assets/images/hiking.webp',
  'community':     'assets/images/community.webp',
  'equipment':     'assets/images/equipment.webp'
}
```

Las claves son **semánticas** (`hero-mountain`, `cocora`, `tolima`…), no de archivo:
el HTML ya apunta a esas claves con `<img data-image="cocora" src="…svg">`, de modo
que se puede cambiar el formato y la ruta sin tocar `index.html`. El `src` del SVG
queda como valor por defecto: si el JS no corre, la página muestra el placeholder.

Formatos sugeridos: AVIF o WebP con JPEG de respaldo. Recomendaciones de tamaño:
hero ≈ 2000 px de ancho; figuras de sección ≈ 1200–1400 px; `loading="lazy"` y
`decoding="async"` ya están puestos.

**Logotipo.** `assets/images/logo-mb.png` (1708×921, fondo transparente y tinta
blanca) va en la nav y en el pie con la clase `brand__mark`. Como la nav es siempre
"claro sobre oscuro" (transparente y después barra translúcida, nunca se aclara) y
el pie es `is-dark`, la tinta blanca siempre se ve. El emblema ya incluye el nombre
y el tagline, por eso no lleva texto al lado. Pesa 362 KB; si se quiere aligerar
basta con exportarlo a 1024 px de ancho (~149 KB) sin pérdida visible.

**Carrusel de Territorio.** Las tres fotos reales (`palma-cera`, `frailejon-1`,
`frailejon-2`) vienen de `imagenes_generadas/posters/` como PNG de ~2,3 MB cada una;
se convirtieron a JPEG de 1600 px / calidad 85 (≈ 280 KB por imagen: 7 MB → 855 KB).
Para sustituirlas basta con reemplazar el archivo en `assets/images/` manteniendo el
nombre, o cambiar la ruta en `config.js`. El comportamiento vive en `MB.carousel`
(`assets/js/ui.js`): avance automático cada 6 s con botón de pausa visible, se detiene
al pasar el ratón, al enfocar con teclado y al salir de pantalla, admite flechas del
teclado y deslizar con el dedo, y **no arranca solo** si quien visita pide
`prefers-reduced-motion`. La cinta de color que abre la sección usa los tokens
`--color-vivo-*` de `tokens.css` (único croma saturado permitido en la página).

### 4.2 Vídeo de intro

`assets/videos/intro-mb.mp4` — 10 s · 1280×720 · H.264 + AAC · ~4,6 MB — se usa en
dos sitios desde **una sola clave**, `MB.config.videos.intro`:

| Dónde | Cómo se reproduce |
|---|---|
| Fondo del hero | `autoplay` + silenciado + en bucle, con la imagen del hero como póster y respaldo si algo falla |
| Sección "El camino" | Bloque `.intro-video` con control, audio y póster `og-cover.svg` |

Para sustituirlo: reemplazar el MP4 y, si cambia el nombre, editar
`MB.config.videos.intro` en `config.js`. Comportamiento ya implementado: el vídeo
del hero se pausa cuando sale de pantalla y no arranca si quien visita tiene
activado `prefers-reduced-motion`; el bloque con control solo se reproduce por
decisión del usuario (y con audio).

### 4.3 Audio y vídeo de "Relatos de la Montaña"

Dos recursos adicionales, usados en la sección homónima (`#relatos`):

| Archivo | Uso | Dónde |
|---|---|---|
| `assets/audios/Supervivencia_y_catarsis_en_el_Nevado_Tolima.m4a` | Podcast: episodio 01 del programa | `.podcast__player audio` |
| `assets/videos/escalando_mb_escalada_tolima_1.mp4` | Registro visual de escalada | `.story__video video` |

Ambos pasan por `MB.config.videos.relatos` y `MB.config.audios.relatos`.
El audio lleva un temporizador (`MB.podcast.init()` en `ui.js`) que muestra
`0:00 / 6:00` en tiempo real; el vídeo solo se reproduce por decisión del
visitante, con controles y póster `tolima.svg`.

### 4.3b Videos verticales: Momentos + Comunidad

Los 4 MP4 verticales que estaban sin ubicar ya estan colocados (todos 9:16, H.264):

| Archivo | Tamano | Uso | Clave en `config.js` |
|---|---|---|---|
| `assets/videos/video_corto_1.mp4` | ~2,0 MB · 464x832 · 5,2 s | Momento 01 “Volcan, grupo y fogata” | `videos.momento1` |
| `assets/videos/video_corto_2.mp4` | ~1,9 MB · 464x832 · 5,2 s | Momento 02 “Sendero, noche y estrellas” | `videos.momento2` |
| `assets/videos/video_corto_3.mp4` | ~2,1 MB · 464x832 · 5,2 s | Momento 03 “Palmas, sendero y fogata” | `videos.momento3` |
| `assets/videos/comunidad-cocora.mp4` | ~1,8 MB · 540x960 · 10 s · sin audio | Tarjeta “Grupos de caminata” en `#comunidad` | `videos.comunidad` |
| `assets/videos/fondo-lp.mp4` | ~1,2 MB · 770x436 · 7,4 s · sin audio · faststart | Fondo de `.hero.is-dark` | `videos.heroBg` |

Detalles de implementacion:

- `#momentos` ya traia el cableado (`data-momento-src` + `momentos.js` con `IntersectionObserver`): solo se corrigieron los textos (los `aria-label` y titulos anteriores describían amanecer/arista que no corresponden al material) y se generaron posters reales (`assets/images/momento-1/2/3.jpg`, extraídos del propio MP4 a tamano nativo).
- `comunidad-cocora.mp4` se recomprimió desde el original de 11,5 MB (`.orig-respaldo/personas-caminando-orig-11MB.mp4`, con errata “viedo” en el nombre, conservado como respaldo fuera de la pagina) a 540p sin pista de audio: como es autoplay silenciado en bucle, el audio era peso muerto.
- La tarjeta usa `.media--vertical` (3/4, altura max. 26 rem) + `MB.video` (`data-autoplay`): autoplay silenciado con pausa fuera de pantalla y sin arranque con `prefers-reduced-motion`. El `poster` queda como respaldo sin JS.
- `data-image` en los `<video>` solo existe para que el QA de manifiesto (`mb-qa.js`) no marque huérfanas las claves de poster; `applyImages()` solo toca `<img>`, así que no altera los videos.

### 4.3b Video de fondo del hero

`assets/videos/fondo-lp.mp4` — 1,2 MB · 770×436 · 7,4 s · **sin pista de audio**.
Es el fondo de `.hero.is-dark`.

Detalles de implementacion:

- **Sin audio a proposito.** El archivo original traia AAC stereo; se elimino (`-an`) porque un fondo silenciado en bucle no lo necesita, pesa menos y evita bloqueos de autoplay en navegadores estrictos.
- **`+faststart` obligatorio.** El `moov` va al inicio del archivo (`moov` antes de `mdat`). Sin esto el navegador debe descargar el MP4 completo antes de pintar el primer frame, y en un servidor sin *range requests* el video queda "cargando" para siempre.
- **Servidor local con Range.** `python -m http.server` responde `200` a `Range:` en vez de `206`, y los navegadores modernos necesitan `206` para reproducir en streaming. Para desarrollo en local usa el helper del repo:
  `python mb-serve.py 8010` → `http://127.0.0.1:8010/`. GitHub Pages sí soporta Range de serie.
- **Respaldo `<img>`.** El `<img>` de `.hero__bg` es el primer frame del propio video (`assets/images/fondo-lp-poster.jpg`), no otra imagen: asi el cambio fijo → movimiento no produce un salto visual. Va con `z-index: 0` y el video con `z-index: 1`.
- **Crossfade sin parpadeo.** El video nace con `opacity: 0`; cuando dispara `canplay` (o a los 4 s si ya hay `readyState >= 2`), se añade `.hero__bg.is-playing`: el video entra fundido y el img sale fundido. Nunca se ven los dos peleando.
- **Play diferido.** `MB.video` no llama a `play()` si `readyState < 2`: espera a `canplay`. Pedirlo antes deja el video en un limbo (`paused: true`, `readyState: 4`, sin evento `playing`).
- **`muted` antes de `autoplay`** en el atributo HTML, y `video.muted = true` tambien por JS: algunos navegadores exigen la propiedad, no solo el atributo.

#### Si no ves el video en tu equipo

Casi siempre es `prefers-reduced-motion`. En `config.js`:

```js
heroVideoMode: 'auto'    // respeta prefers-reduced-motion → póster (por defecto)
heroVideoMode: 'always'  // reproduce siempre, ignora prefers-reduced-motion
```

Con `'auto'`, si el sistema operativo pide menos movimiento, el video se pausa
**a proposito** (accesibilidad: un bucle continuo es justo lo que esa preferencia
quiere evitar) y se ve el poster.

Para comprobarlo en el navegador:

```js
matchMedia('(prefers-reduced-motion: reduce)').matches
```

Si devuelve `true`, windows lo tiene activado en
`Configuracion > Accesibilidad > Efectos visuales > Efectos de animacion`.


### 4.4 Imágenes de metadatos (no pasan por `config.js`)

| Archivo | Uso |
|---|---|
| `favicon.png` | Favicon 256×256 y apple-touch-icon. Generado a partir del emblema del logotipo sobre fondo oscuro, para que se vea en pestañas claras |
| `og-cover.svg` → `og-cover.png` | Vista previa en redes / WhatsApp (1200×630) |

`favicon.png` ya está conectado en el `<head>`. La portada OG hay que sustituirla
por archivo y actualizar su ruta en `<meta property="og:image">`.


---

## 5. Cambiar contenido

Casi todo el contenido vive en **`assets/js/data.js`**, separado de la maqueta:

| Clave | Qué controla |
|---|---|
| `MB.data.quiz` | Preguntas, opciones, pesos y descripciones de los 4 perfiles |
| `MB.data.guide` | Intenciones, preguntas sugeridas, saludos y métricas del guía |
| `MB.data.knowledge` | Categorías y temas del buscador |
| `MB.data.territories` | Nombre, rol y estado de cada territorio |
| `MB.data.experiences` | Las 4 experiencias (título, extracto, texto) |
| `MB.data.challenge` | Ficha, hitos y texto de advertencia del reto |

Los textos narrativos (hero, secciones, footer) y todas las etiquetas de honestidad
(disclaimer, "Demostración", "meta aspiracional") están en `index.html` y no deben
editarse desde JS.

---

## 6. Decisiones y trade-offs

| Decisión | Por qué |
|---|---|
| **Scripts clásicos, no `<script type="module">`** | Los módulos ES están bloqueados por CORS en `file://`. Con scripts clásicos la página funciona con doble clic, que es como se suele abrir en clase. |
| **Sprite SVG inline en el `index.html`** | Iconos sin peticiones, sin librerías y con `currentColor`, así heredan el color del contexto. |
| **Temas por clases de semántica (`.is-forest`)** | Los hijos definen `--bg-base`, `--text-base`, `--accent`… y heredan; el componente no cambia, solo el ambiente. |
| **Test en línea, no modal** | Un modal secuestra el foco y rompe el recorrido narrativo. El resultado aparece bajo el test y el foco va al título del resultado. |
| **Empates del test → perfil más conservador** | Ante duda, se recomienda el nivel de exigencia menor: es la opción que no promete nada de más. |
| **Clásicos (`<details>`) en Knowledge** | Desplegables accesibles y funcionales de serie; JS solo añade el filtrado. |
| **Placeholders SVG en vez de fotos de stock** | Evita presentar imágenes ajenas como si fueran del proyecto y mantiene la grilla resuelta. |
| **`z-index` por capas** | El drawer (190) queda por debajo de la nav (200) para que su botón de cerrar nunca quede inalcanzable. |

### Reglas de contenido que no se negocian

- No se inventan precios, distancias, tiempos ni nombres de rutas.
- El test **no** es diagnóstico médico ni certificación (se declara en dos sitios).
- El guía y el buscador van etiquetados como demostración.
- El Nevado del Tolima aparece como **meta aspiracional**, no como ruta operatoria.
- La comunidad va marcada como demostración en su propia sección.

---

## 7. Accesibilidad y robustez

- Enlace de salto, orden de foco lógico y foco visible (`:focus-visible`).
- `aria-live` para resultados del test, respuestas del guía y resultados del buscador.
- Menú móvil como acordeón real: `aria-expanded`, cierre con `Esc` y con clic fuera,
  devolución del foco al disparador.
- Imágenes con texto alternativo que describe lo que aportan (no repiten el titular).
- **Sin JavaScript**: el contenido sigue visible; el test, el guía y el filtro
  muestran una explicación en lugar de fingir que funcionan.
- **`prefers-reduced-motion`**: desactiva transiciones, reveals y desplazamiento suave.
- Contraste verificado en ambos temas (texto sobre fondo ≥ 4.5:1, acentos ≥ 3:1).

---

## 8. Verificación

Dos scripts de comprobación (fuera del repositorio, en la raíz temporal) recorren
assets, anclas, sprite, equilibrio de etiquetas y CSS, carga de módulos en un `vm`,
lógica del test por fuerza bruta, detección de intenciones del guía, búsqueda del
catálogo y las reglas de contenido:

```bash
node mb-qa.js      "$(pwd -W)"   # → TODO OK · 0 fallos
node mb-classes.js "$(pwd -W)"   # → 0 clases usadas sin definir · 0 CSS sin uso

# Sintaxis de todos los módulos
for f in assets/js/*.js; do node --check "$f"; done
```

**Estado actual:** 0 fallos de QA, 0 clases CSS huérfanas, 0 reglas CSS sin uso,
`node --check` limpio en los 7 módulos.

---

## 9. Alcance y límites

**Está incluido:** maqueta completa responsive, los tres mini-apps funcionales
(test, guía y buscador), temas claro/oscuro, fallback sin JS, placeholders editoriales
y metadatos SEO/OG.

**No está incluido (y se dice en la interfaz):** backend, envío de datos, autenticación,
contenido real de la Knowledge Base, fotografías definitivas y cualquier dato operativo
(ver §6).

**Pendiente de la siguiente fase:** sustituir placeholders por fotografías del proyecto,
sustituir `MB.data.knowledge.topics` por la Knowledge Base real, y si se necesita
persistencia del test, añadir un `localStorage` mínimo (hoy las respuestas se descartan,
que es lo que promete el texto).
