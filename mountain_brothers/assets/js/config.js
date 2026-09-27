/* ==========================================================================
   MOUNTAIN BROTHERS · config.js
   Punto ÚNICO de configuración de activos.
   Para publicar las fotografías definitivas basta con cambiar aquí la ruta
   (por ejemplo 'assets/images/hero-mountain.webp'). El HTML ya trae el
   placeholder como valor por defecto, así que la página funciona igual
   incluso sin JavaScript.
   ========================================================================== */

(function (MB) {
  'use strict';

  MB.config = {
    /* Mapa semántico de imágenes: clave → ruta del archivo */
    images: {
      'logo': 'assets/images/logo-mb.png',
      'palma-cera': 'assets/images/palma-cera.jpg',
      'frailejon-1': 'assets/images/frailejon-1.jpg',
      'frailejon-2': 'assets/images/frailejon-2.jpg',
      'hero-mountain': 'assets/images/hero-mountain.svg',
      'fondo-lp-poster': 'assets/images/fondo-lp-poster.jpg',
      'momento-1': 'assets/images/momento-1.jpg',
      'momento-2': 'assets/images/momento-2.jpg',
      'momento-3': 'assets/images/momento-3.jpg',
      'comunidad-cocora': 'assets/images/comunidad-cocora.jpg',
      'cocora': 'assets/images/cocora.svg',
      'paramo': 'assets/images/paramo.svg',
      'nevados': 'assets/images/nevados.svg',
      'tolima': 'assets/images/tolima.svg',
      'hiking': 'assets/images/hiking.svg',
      'equipment': 'assets/images/equipment.svg',
      'morrogacho': 'assets/images/morrogacho.png',
      'paramillo': 'assets/images/paramillo.png',
      'nevado-tolima': 'assets/images/nevado-tolima.png'
    },

    /* Marca */
    brand: {
      name: 'Mountain Brothers',
      tagline: 'Explora · Aprende · Avanza',
      territory: 'Quindío · Colombia'
    },

    /* Interruptor de contenido demostrativo.
       Todo el material marcado como demo se declara explícitamente en la
       interfaz (etiqueta "Demostración") para no presentarlo como real. */
    demoDisclaimers: true,

    /* Video de fondo del hero.
       'auto'   → respeta prefers-reduced-motion: quien pide menos movimiento
                  ve el póster (recomendado; accesible).
       'always' → reproduce siempre, ignorando prefers-reduced-motion.
       Si no ves el video en tu equipo, revisa el SO: con "reducir movimiento"
       activado, 'auto' deja el póster a propósito. */
    heroVideoMode: 'auto',

    /* Mapa semántico de vídeo: clave → ruta del archivo */
    videos: {
      intro: 'assets/videos/intro-mb.mp4',
      heroBg: 'assets/videos/fondo-lp.mp4',
      relatos: 'assets/videos/escalando_mb_escalada_tolima_1.mp4',
      momento1: 'assets/videos/video_corto_1.mp4',
      momento2: 'assets/videos/video_corto_2.mp4',
      momento3: 'assets/videos/video_corto_3.mp4',
      comunidad: 'assets/videos/comunidad-cocora.mp4'
    },

    /* Mapa semántico de audio: clave → ruta del archivo */
    audios: {
      relatos: 'assets/audios/Supervivencia_y_catarsis_en_el_Nevado_Tolima.m4a'
    }
  };

  /**
   * Aplica el mapa de imágenes a todos los <img data-image="clave">.
   * Idempotente: si la ruta ya coincide, no toca el DOM.
   */
  MB.config.applyImages = function applyImages() {
    var nodes = document.querySelectorAll('img[data-image]');
    Array.prototype.forEach.call(nodes, function (img) {
      var key = img.getAttribute('data-image');
      var src = MB.config.images[key];
      if (src && img.getAttribute('src') !== src) {
        img.setAttribute('src', src);
      }
    });
  };

  /**
   * Aplica el mapa de vídeo a todos los <video data-video="clave">.
   * Idempotente: si la ruta ya coincide, no toca el DOM.
   */
  MB.config.applyVideos = function applyVideos() {
    var nodes = document.querySelectorAll('video[data-video]');
    Array.prototype.forEach.call(nodes, function (video) {
      var key = video.getAttribute('data-video');
      var src = MB.config.videos[key];
      if (src && video.getAttribute('src') !== src) {
        video.setAttribute('src', src);
      }
    });
  };
})(window.MB = window.MB || {});
