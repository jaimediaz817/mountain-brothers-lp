/* ==========================================================================
   MOUNTAIN BROTHERS · ui.js
   Comportamiento transversal: navegación, reveal on scroll, parallax del hero
   y utilidades accesibles compartidas.
   Sin dependencias y sin módulos ES: funciona abriendo index.html en local.
   ========================================================================== */

(function (MB) {
  'use strict';

  /* ---------------------------------------------------------------- utils */
  MB.util = {
    qs: function (sel, ctx) { return (ctx || document).querySelector(sel); },

    qsa: function (sel, ctx) {
      return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    },

    reducedMotion: function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Mensaje de estado para lectores de pantalla.
     * El nodo destino debe existir con aria-live="polite" en el HTML.
     */
    announce: function (node, message) {
      if (!node) { return; }
      node.textContent = '';
      window.setTimeout(function () { node.textContent = message; }, 60);
    },

    /** Escapa texto antes de inyectarlo con innerHTML. */
    escape: function (value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    /**
     * Normaliza texto para comparar: minúsculas y sin acentos.
     * Lo usan el buscador de Knowledge y la detección de intención del guía.
     */
    normalize: function (text) {
      return String(text == null ? '' : text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }
  };

  var util = MB.util;

  /* ------------------------------------------------------------- reveal  */
  MB.reveal = {
    /**
     * Un único IntersectionObserver para todo lo animado:
     * [data-reveal], [data-fill] y [data-observe].
     * Es más barato que varios observers y evita cascadas descontroladas.
     */
    init: function () {
      var targets = util.qsa('[data-reveal], [data-fill], [data-observe]');
      if (!targets.length) { return; }

      if (!('IntersectionObserver' in window) || util.reducedMotion()) {
        targets.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          entry.target.classList.add('is-visible');
          entry.target.dispatchEvent(new CustomEvent('mb:reveal', { bubbles: true }));
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

      targets.forEach(function (el) { observer.observe(el); });
    },

    /**
     * Observa nodos inyectados después de init(): por ejemplo, las barras
     * del resultado del quiz o del AI Guide. Sin esto, un nodo añadido
     * tarde nunca activaría su animación.
     */
    watch: function (nodes) {
      if (!nodes || !nodes.length) { return; }
      var list = Array.prototype.slice.call(nodes);

      if (!('IntersectionObserver' in window) || util.reducedMotion()) {
        list.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          entry.target.classList.add('is-visible');
          entry.target.dispatchEvent(new CustomEvent('mb:reveal', { bubbles: true }));
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

      list.forEach(function (el) { observer.observe(el); });
    }
  };

  /* ----------------------------------------------------------------- nav  */
  MB.nav = {
    init: function () {
      var nav = util.qs('[data-nav]');
      var drawer = util.qs('[data-nav-drawer]');
      if (!nav || !drawer) { return; }

      var toggle = util.qs('[data-nav-toggle]', nav);
      var lastFocused = null;

      function isOpen() { return drawer.getAttribute('data-open') === 'true'; }

      function open() {
        lastFocused = document.activeElement;
        drawer.setAttribute('data-open', 'true');
        drawer.removeAttribute('aria-hidden');
        document.body.setAttribute('data-nav-open', 'true');
        if (toggle) { toggle.setAttribute('aria-expanded', 'true'); }
        var first = util.qs('a, button', drawer);
        if (first) { first.focus(); }
      }

      function close(returnFocus) {
        if (!isOpen()) { return; }
        drawer.setAttribute('data-open', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.removeAttribute('data-nav-open');
        if (toggle) { toggle.setAttribute('aria-expanded', 'false'); }
        if (returnFocus !== false && lastFocused) { lastFocused.focus(); }
      }

      MB.nav.close = close;

      if (toggle) {
        toggle.addEventListener('click', function () {
          if (isOpen()) { close(); } else { open(); }
        });
      }

      /* Cualquier enlace del drawer lo cierra antes de saltar al ancla */
      util.qsa('a', drawer).forEach(function (link) {
        link.addEventListener('click', function () { close(false); });
      });

      /* Escape cierra; Tab queda atrapado dentro del drawer */
      drawer.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          return;
        }
        if (event.key !== 'Tab') { return; }

        var focusables = util.qsa(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
          drawer
        );
        if (!focusables.length) { return; }

        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });

      /* El drawer solo existe en móvil: al pasar a desktop se cierra */
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 960) { close(false); }
      });

      /* Barra: transparente sobre el hero, translúcida al hacer scroll */
      var ticking = false;
      function updateState() {
        nav.setAttribute('data-state', window.scrollY > 24 ? 'scrolled' : 'top');
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(updateState);
      }, { passive: true });

      updateState();
    }
  };

  /* ------------------------------------------------------------ parallax */
  MB.parallax = {
    /**
     * Parallax del hero: muy leve y desactivado en móvil o con
     * prefers-reduced-motion. Buscamos profundidad, no mareo.
     */
    init: function () {
      var layer = util.qs('[data-parallax]');
      if (!layer || util.reducedMotion()) { return; }

      var strength = 0.12;
      var ticking = false;

      function apply() {
        ticking = false;
        if (window.innerWidth < 768) {
          layer.style.transform = '';
          return;
        }
        var offset = Math.min(window.scrollY * strength, 140);
        layer.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
      }

      window.addEventListener('scroll', function () {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(apply);
      }, { passive: true });

      window.addEventListener('resize', apply, { passive: true });
      apply();
    }
  };

  /* ------------------------------------------------------------- meters  */
  /**
   * Componente compartido de progreso (Mountain Progress).
   * Lo usan el Quiz y el AI Guide: una sola fuente de verdad para las
   * cinco dimensiones y para el formato de las barras.
   */
  MB.meters = {
    DIMENSIONS: [
      ['conocimiento', 'Conocimiento'],
      ['condicion', 'Condición física'],
      ['equipo', 'Equipo'],
      ['experiencia', 'Experiencia'],
      ['altitud', 'Altitud']
    ],

    /** Crea las barras. Idempotente: si ya existen, no duplica nodos. */
    render: function (container) {
      if (!container || container.children.length) { return; }

      var html = MB.meters.DIMENSIONS.map(function (dim, index) {
        return '' +
          '<div class="progress-bar" data-observe style="--fill-delay:' + (index * 90) + 'ms">' +
            '<div class="progress-bar__head">' +
              '<span>' + dim[1] + '</span>' +
              '<span class="progress-bar__value" data-meter-value="' + dim[0] + '">0%</span>' +
            '</div>' +
            '<div class="progress-bar__track">' +
              '<div class="progress-bar__fill" data-meter-fill="' + dim[0] + '" style="--value:0"></div>' +
            '</div>' +
          '</div>';
      }).join('');

      container.innerHTML = html;

      /* Las barras nacen después de init(): hay que observarlas ahora */
      MB.reveal.watch(MB.util.qsa('[data-observe]', container));
    },

    /** Anima barras y números hacia los nuevos valores (0-100). */
    update: function (container, values) {
      if (!container || !values) { return; }

      MB.meters.DIMENSIONS.forEach(function (dim) {
        var key = dim[0];
        var target = Math.max(0, Math.min(100, Number(values[key]) || 0));
        var fill = MB.util.qs('[data-meter-fill="' + key + '"]', container);
        var label = MB.util.qs('[data-meter-value="' + key + '"]', container);

        if (fill) { fill.style.setProperty('--value', String(target)); }
        if (!label) { return; }

        if (MB.util.reducedMotion()) {
          label.textContent = target + '%';
          return;
        }

        /* Tween corto del número: refuerza la sensación de progreso */
        var from = parseInt(String(label.textContent).replace('%', ''), 10) || 0;
        var start = null;
        var duration = 700;

        window.requestAnimationFrame(function step(timestamp) {
          if (start === null) { start = timestamp; }
          var progress = Math.min((timestamp - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          label.textContent = Math.round(from + (target - from) * eased) + '%';
          if (progress < 1) { window.requestAnimationFrame(step); }
        });
      });
    }
  };


  /* -------------------------------------------------------------- video  */
  /**
   * Vídeos con reproducción automática (fondo del hero).
   * - Con prefers-reduced-motion no se reproducen: manda el póster.
   * - Se pausan cuando salen de la pantalla: un bucle de 10 s no debe
   *   consumir CPU mientras se lee el resto de la página.
   * El vídeo con control de la sección de intro queda fuera de aquí: solo se
   * reproduce por decisión de quien lo visita.
   */
  MB.video = {
    init: function () {
      var nodes = util.qsa('video[data-autoplay]');
      if (!nodes.length) { return; }

      if (util.reducedMotion()) {
        nodes.forEach(function (video) {
          video.removeAttribute('autoplay');
          video.pause();
        });
        return;
      }

      if (!('IntersectionObserver' in window)) { return; }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var playing = entry.target.play();
            if (playing && typeof playing.catch === 'function') {
              /* Autoplay bloqueado por el navegador: se queda el póster. */
              playing.catch(function () {});
            }
            return;
          }
          entry.target.pause();
        });
      }, { threshold: 0.15 });

      nodes.forEach(function (video) { observer.observe(video); });
    }
  };

  /* ---------------------------------------------------------- carousel  */
  /**
   * Carrusel de Territorio. Deslizamiento por transform del track.
   * Reglas de usabilidad aplicadas:
   *  - autoplay con botón de pausa visible (WCAG 2.2.2)
   *  - se detiene al pasar el ratón, al enfocar con teclado y al salir de
   *    la pantalla; se reanuda solo cuando ninguna de esas condiciones aplica
   *  - sin autoplay si quien visita pide menos movimiento: manda el usuario
   *  - anuncia cambios SOLO en interacción manual (los saltos automáticos no
   *    deben interrumpir a un lector de pantalla)
   */
  MB.carousel = {
    INTERVAL: 6000,

    init: function () {
      util.qsa('[data-carousel]').forEach(function (root) {
        MB.carousel.mount(root);
      });
    },

    mount: function (root) {
      var track = util.qs('[data-carousel-track]', root);
      var slides = util.qsa('[data-carousel-slide]', root);
      var dots = util.qsa('[data-carousel-dot]', root);
      var total = slides.length;
      if (!track || total < 2) { return; }

      var viewport = util.qs('[data-carousel-viewport]', root);
      var indexLabel = util.qs('[data-carousel-index]', root);
      var status = util.qs('[data-carousel-status]', root);
      var prev = util.qs('[data-carousel-prev]', root);
      var next = util.qs('[data-carousel-next]', root);
      var toggle = util.qs('[data-carousel-toggle]', root);

      var index = 0;
      var timer = null;
      var userPaused = util.reducedMotion();
      var hoverPaused = false;
      var onScreen = true;

      function render() {
        track.style.transform = 'translate3d(-' + (index * 100) + '%, 0, 0)';

        slides.forEach(function (slide, i) {
          var active = i === index;
          slide.classList.toggle('is-active', active);
          slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        dots.forEach(function (dot, i) {
          var active = i === index;
          dot.classList.toggle('is-active', active);
          if (active) { dot.setAttribute('aria-current', 'true'); }
          else { dot.removeAttribute('aria-current'); }
        });

        if (indexLabel) {
          indexLabel.textContent = (index + 1 < 10 ? '0' : '') + (index + 1);
        }
      }

      function announce(message) { util.announce(status, message); }

      function stop() {
        if (timer) { window.clearInterval(timer); timer = null; }
      }

      function start() {
        stop();
        if (userPaused || hoverPaused || !onScreen) { return; }
        timer = window.setInterval(function () { go(index + 1); }, MB.carousel.INTERVAL);
      }

      function syncToggle() {
        if (!toggle) { return; }
        toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        toggle.setAttribute(
          'aria-label',
          userPaused ? 'Reanudar la reproducción automática'
                     : 'Pausar la reproducción automática'
        );
      }

      function go(nextIndex, manual) {
        index = ((nextIndex % total) + total) % total;
        render();
        if (manual) {
          announce('Imagen ' + (index + 1) + ' de ' + total + '.');
        }
        start();
      }

      if (prev) {
        prev.addEventListener('click', function () { go(index - 1, true); });
      }
      if (next) {
        next.addEventListener('click', function () { go(index + 1, true); });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { go(i, true); });
      });

      if (toggle) {
        toggle.addEventListener('click', function () {
          userPaused = !userPaused;
          syncToggle();
          /* start() decide: si userPaused es true, reanuda nada y corta */
          start();
          announce(userPaused ? 'Reproducción automática en pausa.'
                              : 'Reproducción automática activada.');
        });
      }

      root.addEventListener('mouseenter', function () { hoverPaused = true; stop(); });
      root.addEventListener('mouseleave', function () { hoverPaused = false; start(); });

      root.addEventListener('focusin', function () { hoverPaused = true; stop(); });
      root.addEventListener('focusout', function (event) {
        if (root.contains(event.relatedTarget)) { return; }
        hoverPaused = false;
        start();
      });

      root.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1, true); }
        if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1, true); }
      });

      /* Deslizar con el dedo */
      var startX = null;
      if (viewport) {
        viewport.addEventListener('pointerdown', function (event) {
          startX = event.clientX;
        });
        viewport.addEventListener('pointerup', function (event) {
          if (startX === null) { return; }
          var delta = event.clientX - startX;
          startX = null;
          if (Math.abs(delta) < 40) { return; }
          go(index + (delta < 0 ? 1 : -1), true);
        });
        viewport.addEventListener('pointercancel', function () { startX = null; });
      }

      /* Fuera de pantalla no gasta CPU ni mueve nada */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            onScreen = entry.isIntersecting;
            if (onScreen) { start(); } else { stop(); }
          });
        }, { threshold: 0.15 }).observe(root);
      }

      syncToggle();
      render();
      start();
    }
  };

  MB.misc = {
    init: function () {
      var year = util.qs('[data-year]');
      if (year) { year.textContent = String(new Date().getFullYear()); }
    }
  };

  /* ----------------------------------------------------- podcast timer  */
  /**
   * Temporizador del reproductor de audio de Relatos de la Montaña.
   * Muestra el progreso en tiempo real (0:00 / 6:00) sin depender de JS
   * para la reproducción: si el navegador no puede reproducir, el etiquetado
   * de estado sigue visible.
   */
  MB.podcast = {
    init: function () {
      var audio = document.getElementById('relatos-audio-el');
      var label = document.getElementById('relatos-time');
      if (!audio || !label) { return; }

      function fmt(seconds) {
        seconds = Math.max(0, Math.floor(seconds || 0));
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
      }

      function update() {
        var current = audio.duration && isFinite(audio.duration)
          ? fmt(audio.currentTime)
          : '0:00';
        var total = audio.duration && isFinite(audio.duration)
          ? fmt(audio.duration)
          : '0:00';
        label.textContent = current + ' / ' + total;
      }

      audio.addEventListener('timeupdate', update);
      audio.addEventListener('loadedmetadata', update);
      audio.addEventListener('durationchange', update);
    }
  };
})(window.MB = window.MB || {});
