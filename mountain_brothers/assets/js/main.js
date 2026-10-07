/* ==========================================================================
   MOUNTAIN BROTHERS · main.js
   Orquestador. Único punto de arranque: inicializa cada módulo en orden
   y protege la página si algo falla (fail-open, nunca contenido invisible).
   ========================================================================== */

(function (MB) {
  'use strict';

  function boot() {
    /* 1 · Activos y datos */
    MB.config.applyImages();
    MB.config.applyVideos();

    /* 2 · Comportamiento transversal */
    MB.reveal.init();
    MB.nav.init();
    MB.stepper.init();
    MB.parallax.init();
    MB.video.init();
    MB.carousel.init();
    MB.misc.init();
    MB.toTop.init();
    MB.altitude.init();
    MB.epline.init();

    /* 3 · Producto */
    MB.quiz.init();
    MB.guide.init();
    MB.knowledge.init();
    MB.momentos.init();

    document.documentElement.setAttribute('data-mb', 'ready');
  }

  function safeBoot() {
    try {
      boot();
    } catch (error) {
      /* Si algo falla, devolvemos la clase no-js: el CSS deja visible todo
         el contenido y la landing sigue siendo legible y navegable. */
      document.documentElement.classList.add('no-js');
      if (window.console && window.console.error) {
        window.console.error('[Mountain Brothers] Error al inicializar:', error);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeBoot);
  } else {
    safeBoot();
  }
})(window.MB = window.MB || {});
