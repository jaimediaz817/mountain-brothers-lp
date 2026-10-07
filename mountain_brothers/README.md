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

La página se abre de dos formas: doble clic sin servidor, o con un servidor
local (recomendado para desarrollar, revisar con DevTools y reproducir vídeo/audio).

### Opción A · doble clic sobre index.html

Abre `mountain_brothers/index.html` directamente desde el explorador. Funciona por
`file://`, pero algunos navegadores pueden bloquear el `autoplay` del audio/vídeo.

### Opción B · servidor local (recomendado)

Cualquiera de estas tres formas sirve `mountain_brothers/` con soporte
**Range/206**, necesario para que el navegador pueda *seek* dentro del vídeo/audio
sin tener que descargarlo todo antes de reproducirlo.

**Windows** — `server-mb.bat` (CMD o Git Bash):
```bat
server-mb.bat
# → http://localhost:8080/
```

**Git Bash / Linux / macOS** — `server-mb.sh` (primero: `chmod +x server-mb.sh`):
```bash
./server-mb.sh
# → http://localhost:8080/
```

**Node.js** — `dev-server.js` (con Range incluido; la opción más portable):
```bash
node dev-server.js 8080
# → http://localhost:8080/
```

> `mb-serve.py` es un helper de desarrollo que **no se sube a git** (`.gitignore`);
> si lo tienes local, `server-mb.bat`/`.sh` lo usan. `dev-server.js` ya incluye el
> `Range`, de modo que funciona sin depender de Python. `python -m http.server` en
> cambio **no responde `206` a `Range:`**, por lo que no es adecuado para vídeo/audio
> en streaming.

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
│   │   ├── momentos.js        # Vídeos verticales: autoplay por viewport
│   │   ├── epline.js          # "Línea del Episodio": player de audio automático
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
  'equipment':     'assets/images/equipment.webp',
  'podcast-cover': 'assets/images/podcast-cover.jpg'   // cover del programa (Relatos)
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
| `assets/audios/Supervivencia_y_catarsis_en_el_Nevado_Tolima.m4a` | Podcast: episodio 01 del programa | `.epline audio` |
| `assets/videos/escalando_mb_escalada_tolima_1.mp4` | Registro visual de escalada | `.story__video video` |

Ambos pasan por `MB.config.videos.relatos` y `MB.config.audios.relatos`.
El audio usa el player **"Línea del Episodio"** (`MB.epline.init()` en
`epline.js`): genera solo entre 4 y 8 partes según la duración real,
dibuja la onda en canvas conforme suena (AnalyserNode, sin decodificar el
archivo), ofrece riel de partes con seek, burbuja de preview, velocidad y
volumen recordados, retomar (`localStorage`), mini-player sticky y
`mediaSession`. El vídeo solo se reproduce por decisión del visitante, con
controles y póster `tolima.svg`.

El **mini-player flotante** (`.epline-mini`) es un reproductor completo, no un
indicador: play/pausa, salto ±15 s, título que devuelve al player, riel de
posición accionable (clic, arrastre y teclado `role="slider"`) y cierre.
Aparece solo después de la primera reproducción y mientras el player principal
esté fuera de pantalla; **se queda visible en pausa** —retomar es su razón de
ser— y solo se retira si quien visita lo cierra o vuelve a la sección. Como se
monta en `<body>`, dentro de `.epline-mini` se anclan `--text-muted` y
`--shadow-lift` a valores de tema oscuro: si no, heredarían los de la raíz y el
reloj saldría casi negro sobre la barra.

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


### 4.3c Capa cinematográfica del hero

Grano, viñeta, marco de visor y riel numerado sobre `.hero.is-dark`.
Todo es **CSS puro**: cero JS, cero nodos nuevos (viven en pseudo-elementos) y
cero peticiones de red (el ruido es un `feTurbulence` en `data:` URI dentro del
propio CSS). Reparto de pseudo-elementos:

| Elemento | Qué dibuja |
|---|---|
| `.hero__scrim` (4ª capa del `background`) | Viñeta cinematográfica |
| `.hero__scrim::after` | Grano fílmico animado |
| `.hero::after` | Cuatro esquinas en L (marco de visor) |
| `.hero__inner::before` | Riel: etiqueta `01 · Inicio` rotada + hairline con chispa |

Detalles de implementacion:

- **La viñeta va en ÚLTIMO lugar de la pila de `background`.** En CSS la primera
  capa se pinta encima, así que ponerla al final la deja por debajo de los
  degradados de legibilidad: oscurece las esquinas sin tocar el contraste del
  texto. No toques ese orden.
- **Grano al 7 %.** Es deliberadamente imperceptible como textura; se nota en que
  la imagen "respira", no en que se vea suciedad. Sube `opacity` en
  `.hero__scrim::after` solo si quieres un look más agresivo.
- **El grano se mueve por `transform`**, no por `background-position`: el
  elemento es 3× la caja (`inset: -100%`) y `.hero__scrim` lo recorta con
  `overflow: hidden`. Así la animación vive en el compositor y no repinta.
- **El borde superior del marco arranca a 6 rem, no a 1.25 rem.** La barra de
  navegación mide 89 px y el logo llega hasta y=80. Además, por debajo de ~1280 px
  el logo se pega al canto izquierdo y chocaría con la esquina. A 6 rem el marco
  empieza justo donde acaba la barra y nunca se cruza. Los otros tres bordes van
  a 1.25 rem. **Si cambias la altura del header, ajusta ese 6 rem.**
- **El riel solo aparece a partir de 80 rem (1280 px).** Vive 2.2 rem a la
  izquierda del texto, dentro del margen lateral del contenedor
  (`--container-pad`), y ese margen solo da aire suficiente a partir de ese
  ancho. Por debajo, el hero se queda limpio sin el riel.
- **El riel se ancla a `.hero__inner`, no a `.hero`.** Así la separación con el
  texto es estable en cualquier ancho. Va con `position: absolute` a propósito:
  `.hero__inner` es `display: grid`, y un `::before` en flujo se convertiría en
  una celda más y descolocaría todo el hero.
- **`--hero-hud` y `--hero-hud-spark`** se declaran en `.hero` (derivados de
  `--color-sand`). Son las que dan color al marco y al riel.
- **Con `prefers-reduced-motion: reduce`** el grano se congela y la chispa del
  riel desaparece, pero el marco, el riel y la viñeta se mantienen: son
  estáticos y no suponen movimiento. El video pasa a póster, como siempre.


### 4.3d Layout del hero en desktop

Por debajo de 64 rem el hero es una pila lineal: etiqueta → titular →
entradilla → botones → tarjeta del podcast. Desde 64 rem pasa a **dos
columnas** mediante `grid-template-areas` en `.hero__inner`: el texto respira a
la izquierda y la tarjeta se ancla abajo a la derecha (`align-self: end`), a la
misma línea de base que los CTA. El orden semántico del HTML no cambia: la
tarjeta sigue siendo el último hijo, solo cambia su celda.

Detalles que no se deben tocar a la ligera:

- **La columna derecha es `clamp(17rem, 31vw, 21rem)`.** El tope de 21 rem es
  el ancho máximo que deja al titular espacio suficiente para no partirse mal:
  «Todo comienza» ocupa 748 px a tamaño máximo, así que la columna izquierda
  nunca puede bajar de ~775 px en 1440. Si agrandas **la pista**, el titular
  rompe en «Todo» / «comienza» (la tarjeta, en cambio, puede desbordar su
  pista hacia la izquierda sin tocar el grid: ver el punto siguiente).
- **La tarjeta tiene ancho propio: `width: 28rem` + `justify-self: end`.** Es
  más ancha que su pista (336 px) y desborda hacia la izquierda sin ensanchar
  la columna del titular ni empujar los botones: el gutter de tinta
  (botones ↔ tarjeta) queda en ≥43 px en 1440/1920 y ≥53 px en 1280. No quites
  `max-width: none`: sin él, `100%` la recortaría a la pista.
- **La tarjeta es una rejilla de dos filas** (`display: grid` +
  `display: contents` en `.hero__audio-body` y `.hero__audio-line`): fila 1 =
  eyebrow (izq.) + `21 min` (dcha.); fila 2 = ecualizador + título + play.
  Con eso el título cabe en **una sola línea** en todos los anchos desktop
  (intrínseco 300 px) y la tarjeta baja de 113 px a **85 px** de alto. El
  `line-height: 1.3` de eyebrow y duración evita el interlineado heredado
  (1.75) que inflaba la fila 1.
- **Medidas verificadas** (Chrome/Playwright, 1024–1920): tarjeta 448×85,
  eyebrow y título a 1 línea siempre, sin solape vertical con titular ni
  entradilla, botones en una fila desde ~1151 px (más abajo se apilan y el
  gutter crece). La sonda está en `mb-hero-card.mjs` (fuera del repo).
- **`Episodio&nbsp;01`.** El nbsp impide el corte que dejaba el «01» huérfano
  en una segunda línea cuando la tarjeta no da abajo para una sola línea.
- **`max-width: none` en `.hero__inner`** es lo que habilita las dos columnas;
  el riel `::before` sigue anclado a su borde izquierdo y no entra en el grid
  (va con `position: absolute`).

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
