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

  /* Active nav link based on scroll position */
  MB.nav.setActiveLink = function () {
    var links = util.qsa('.nav-links__item[href^="#"], .nav-drawer__link[href^="#"]');
    if (!links.length) { return; }

    var sections = links.map(function (link) {
      var id = link.getAttribute('href');
      return util.qs(id);
    }).filter(Boolean);

    if (!sections.length) { return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        var link = util.qs('.nav-links__item[href="#' + id + '"], .nav-drawer__link[href="#' + id + '"]');
        if (link) {
          if (entry.isIntersecting) {
            links.forEach(function (l) { l.removeAttribute('aria-current'); });
            link.setAttribute('aria-current', 'true');
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.1 });

    sections.forEach(function (sec) { observer.observe(sec); });
  };

  MB.nav.setActiveLink();

  /* ---------------------------------------------------------- stepper  */
  /**
   * Stepper vertical flotante (14 secciones). Dot-rail con vista previa
   * textual + progreso real de página + colapso persistente.
   * - Desbloquea [hidden] solo con JS (sin JS no existe, como to-top).
   * - Un único IntersectionObserver sincroniza stepper + nav principal.
   * - Colapso: localStorage 'mb-stepper-collapsed'; default expandido en
   *   >=1280px y colapsado en 960-1279px. En móvil el CSS lo oculta.
   */
  MB.stepper = {
    KEY: 'mb-stepper-collapsed',

    init: function () {
      var root = util.qs('[data-stepper]');
      if (!root) { return; }
      if (window.innerWidth < 960) { return; }

      /* Sin rAF/scrollTo el rail no aporta: no desbloquear. */
      if (!(window.requestAnimationFrame && 'scrollTo' in window)) { return; }

      root.hidden = false;

      var toggle = util.qs('[data-stepper-toggle]', root);
      var fill = util.qs('[data-stepper-fill]', root);
      var links = util.qsa('[data-stepper-link]', root);
      if (!links.length) { return; }

      var sections = links.map(function (link) {
        return util.qs('#' + link.getAttribute('data-stepper-link'));
      }).filter(Boolean);
      if (!sections.length) { return; }

      var stored = null;
      try { stored = window.localStorage.getItem(MB.stepper.KEY); } catch (e) {}

      function applyCollapsed(collapsed) {
        root.setAttribute('data-collapsed', collapsed ? 'true' : 'false');
        if (toggle) {
          toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
          toggle.setAttribute('aria-label', collapsed
            ? 'Expandir navegación por secciones'
            : 'Contraer navegación por secciones');
        }
      }

      var collapsed = stored === '1' ? true : stored === '0' ? false : window.innerWidth < 1280;
      applyCollapsed(collapsed);

      if (toggle) {
        toggle.addEventListener('click', function () {
          collapsed = root.getAttribute('data-collapsed') !== 'true';
          applyCollapsed(collapsed);
          try { window.localStorage.setItem(MB.stepper.KEY, collapsed ? '1' : '0'); } catch (e) {}
          stored = collapsed ? '1' : '0';
        });
      }

      /* Sin preferencia guardada: seguir el breakpoint al redimensionar */
      window.addEventListener('resize', function () {
        if (stored !== null) { return; }
        if (window.innerWidth < 960) { return; }
        applyCollapsed(window.innerWidth < 1280);
      }, { passive: true });

      function setActive(id) {
        links.forEach(function (link) {
          if (link.getAttribute('data-stepper-link') === id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
        /* Sincroniza el nav principal + drawer con la misma sección.
           El nav solo cubre 7 de 14 secciones: si la activa no tiene link,
           se conserva el último resaltado en vez de dejarlo vacío. */
        var navLinks = util.qsa('.nav-links__item[href^="#"], .nav-drawer__link[href^="#"]');
        var hasNavMatch = navLinks.some(function (link) {
          return link.getAttribute('href') === '#' + id;
        });
        if (hasNavMatch) {
          navLinks.forEach(function (link) {
            if (link.getAttribute('href') === '#' + id) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      }

      /* Scrollspy por posición (no por IntersectionObserver con umbral:
         las secciones miden 900-3200px y la banda -40%/-55% solo deja ~5%
         del viewport: el ratio nunca alcanza threshold 0.1 y el observer
         jamás dispara — bug heredado de MB.nav.setActiveLink).
         Activa = última sección cuyo top superó la línea del 40% viewport. */
      var currentId = null;

      function detectActive() {
        var line = window.innerHeight * 0.4;
        var active = sections[0].id;
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top <= line) {
            active = sections[i].id;
          } else {
            break;
          }
        }
        if (active !== currentId) {
          currentId = active;
          setActive(active);
        }
      }

      /* Progreso real de página + atenuado durante el scroll */
      var ticking = false;
      var dimTimer = null;

      function updateProgress() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
        if (fill) { fill.style.height = (ratio * 100).toFixed(1) + '%'; }
      }

      function onScroll() {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          updateProgress();
          detectActive();
          root.classList.add('is-dim');
          if (dimTimer) { window.clearTimeout(dimTimer); }
          dimTimer = window.setTimeout(function () {
            root.classList.remove('is-dim');
          }, 1800);
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      updateProgress();
      detectActive();
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

      var heroVideo = null;
      nodes.forEach(function (v) {
        if (v.getAttribute('data-video') === 'heroBg') { heroVideo = v; }
      });

      /* heroVideoMode: 'auto' respeta prefers-reduced-motion (póster);
         'always' reproduce siempre. Ver config.js. */
      if (util.reducedMotion() && MB.config.heroVideoMode !== 'always') {
        nodes.forEach(function (video) {
          video.removeAttribute('autoplay');
          video.pause();
          /* Sin movimiento: el póster ya comunica; quitar el <video>
             evita un frame negro si el autoplay fue bloqueado. */
          if (video.getAttribute('data-video') === 'heroBg') {
            video.style.display = 'none';
          }
        });
        return;
      }
      if (!('IntersectionObserver' in window)) {
        /* Sin observer: forzar play directo en el hero. */
        nodes.forEach(function (video) {
          video.muted = true;
          video.play().catch(function () {});
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* muted = true por JS además del atributo: algunos navegadores
               exigen la propiedad para permitir autoplay sin gesto.
               Play diferido: si readyState < 2, esperar a canplay antes de
               pedir play() — pedirlo antes lo deja en limbo (paused=true,
               readyState=4, sin evento playing). */
            var target = entry.target;
            target.muted = true;
            observer.unobserve(target);
            function tryPlay() {
              if (!target.paused && !target.ended) { return; }
              target.muted = true;
              var playing = target.play();
              if (playing && typeof playing.catch === 'function') {
                /* Autoplay bloqueado por el navegador: se queda el póster. */
                playing.catch(function () {});
              }
            }
            if (target.readyState >= 2) {
              tryPlay();
            } else {
              target.addEventListener('canplay', function onCanplay() {
                target.removeEventListener('canplay', onCanplay);
                tryPlay();
              });
              /* Carga explícita por si el preload la retrasó. */
              try { target.load(); } catch (e) {}
            }
            if (heroVideo && heroVideo !== target) { return; }
            return;
          }
          entry.target.pause();
        });
      }, { threshold: 0.15 });

      nodes.forEach(function (video) { observer.observe(video); });
      if (heroVideo) {
        /* Crossfade sin parpadeo: el <img> de respaldo se oculta solo cuando
           el video YA puede mostrar frames (canplay), no antes.
           Fallback: si en 4 s no hay canplay (red lenta), se muestra el
           video igual para no dejar el hero congelado parpadeando. */
        var heroBg = heroVideo.closest('.hero__bg');
        function heroCrossfade() {
          if (heroBg) { heroBg.classList.add('is-playing'); }
        }
        heroVideo.addEventListener('canplay', heroCrossfade);
        heroVideo.addEventListener('playing', heroCrossfade);
        window.setTimeout(function () {
          if (heroVideo.readyState >= 2) { heroCrossfade(); }
        }, 4000);
      }
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

      /* Oculta el indicador de scroll tras la primera interacción */
      var scrollCue = util.qs('.scroll-cue');
      if (scrollCue) {
        var hidden = false;
        function hideCue() {
          if (!hidden) {
            hidden = true;
            scrollCue.hidden = true;
            window.removeEventListener('scroll', onScroll, { passive: true });
          }
        }
        function onScroll() {
          if (window.scrollY > 100) { hideCue(); }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    }
  };

  /* ------------------------------------------------------------ altitude  */
  /* Sección de fisiología de altura: video controlado por scroll,
     revelado escalonado de steps, métricas animadas, player accesible. */
  MB.altitude = {
    init: function () {
      var section = util.qs('#altitud');
      if (!section) { return; }

      var bgVideo = util.qs('.altitude__video', section);
      var playerVideo = util.qs('.altitude__player-video', section);
      var playBtn = util.qs('[data-altitude-play]', section);
      var progress = util.qs('[data-altitude-progress]', section);
      var fill = util.qs('[data-altitude-fill]', section);
      var head = util.qs('[data-altitude-head]', section);
      var steps = util.qsa('.altitude__step', section);
      var metrics = util.qs('.altitude__metrics', section);
      var spo2El = util.qs('[data-altitude-spo2]', section);

      if (!('IntersectionObserver' in window) || util.reducedMotion()) {
        if (bgVideo) { bgVideo.style.display = 'none'; }
        if (playerVideo) { playerVideo.style.display = 'none'; }
        steps.forEach(function (s) { s.classList.add('is-visible'); });
        if (spo2El) { spo2El.textContent = '82'; }
        return;
      }

      /* 1. Background video: play cuando la sección entra en viewport */
      var bgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && bgVideo) {
            bgVideo.classList.add('is-playing');
            bgVideo.play().catch(function () {});
            bgObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      if (bgVideo) { bgObserver.observe(section); }

      /* 2. Steps reveal escalonado */
      var stepObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = Array.prototype.indexOf.call(steps, entry.target);
            var delay = idx * 120;
            setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
            stepObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -20% 0px', threshold: 0.15 });
      steps.forEach(function (s) { stepObserver.observe(s); });

      /* 3. Player video: seek sincronizado con scroll dentro de la sección */
      var playerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && playerVideo) {
            var onScroll = function () {
              var rect = section.getBoundingClientRect();
              var vh = window.innerHeight;
              var progressRatio = 1 - Math.max(0, Math.min(1, (rect.bottom - vh * 0.3) / (rect.height + vh * 0.7)));
              if (playerVideo.duration && !isNaN(playerVideo.duration)) {
                playerVideo.currentTime = progressRatio * playerVideo.duration;
                var pct = Math.round(progressRatio * 100);
                if (fill) { fill.style.width = pct + '%'; }
                if (head) { head.style.left = pct + '%'; }
                if (progress) { progress.setAttribute('aria-valuenow', String(pct)); }
              }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            playerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      if (playerVideo) { playerObserver.observe(section); }

      /* 4. Play/pause botón */
      if (playBtn && playerVideo) {
        playBtn.addEventListener('click', function () {
          var playing = playBtn.getAttribute('aria-pressed') === 'true';
          if (playing) {
            playerVideo.pause();
            playBtn.setAttribute('aria-pressed', 'false');
          } else {
            playerVideo.play().catch(function () {});
            playBtn.setAttribute('aria-pressed', 'true');
          }
        });
        playerVideo.addEventListener('play', function () { playBtn.setAttribute('aria-pressed', 'true'); });
        playerVideo.addEventListener('pause', function () { playBtn.setAttribute('aria-pressed', 'false'); });
      }

      /* 5. Progress bar: seek al click/teclado */
      if (progress && playerVideo) {
        function seekFromEvent(e) {
          var rect = progress.getBoundingClientRect();
          var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
          var ratio = Math.max(0, Math.min(1, x / rect.width));
          playerVideo.currentTime = ratio * (playerVideo.duration || 0);
        }
        progress.addEventListener('click', seekFromEvent);
        progress.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight') { e.preventDefault(); playerVideo.currentTime = Math.min(playerVideo.duration, (playerVideo.currentTime || 0) + 3); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); playerVideo.currentTime = Math.max(0, (playerVideo.currentTime || 0) - 3); }
          if (e.key === 'Home') { e.preventDefault(); playerVideo.currentTime = 0; }
          if (e.key === 'End') { e.preventDefault(); playerVideo.currentTime = playerVideo.duration || 0; }
        });
      }

      /* 6. Métrica SpO₂ animada al revelar métricas */
      if (metrics && spo2El) {
        var metricObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var target = 82;
              var from = 98;
              var duration = 1800;
              var start = null;
              function animate(t) {
                if (!start) { start = t; }
                var p = Math.min((t - start) / duration, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                spo2El.textContent = Math.round(from + (target - from) * eased);
                if (p < 1) { requestAnimationFrame(animate); }
              }
              requestAnimationFrame(animate);
              metricObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.3 });
        metricObserver.observe(metrics);
      }
    }
  };

  /* ------------------------------------------------------------- to-top  */
  /* Botón flotante "volver arriba": aparece tras cierto scroll y devuelve
     al inicio con movimiento suave (o inmediato si reduce-motion). Usa
     requestAnimationFrame para no saturar el hilo principal al hacer scroll. */
  MB.toTop = {
    THRESHOLD: 480,

    init: function () {
      var btn = util.qs('[data-to-top]');
      if (!btn) { return; }

      /* Sin rAF el botón queda con [hidden]: nunca se muestra ante fallos. */
      if (!(window.requestAnimationFrame && 'scrollTo' in window)) { return; }

      /* Desbloquea el botón; la visibilidad la decide .is-visible en CSS. */
      btn.hidden = false;

      var ticking = false;

      function readScroll() {
        ticking = true;
        window.requestAnimationFrame(function () {
          var top = window.pageYOffset ||
                    document.documentElement.scrollTop ||
                    document.body.scrollTop ||
                    0;
          btn.classList.toggle('is-visible', top > MB.toTop.THRESHOLD);
          ticking = false;
        });
      }

      function goTop() {
        var behavior = util.reducedMotion() ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, left: 0, behavior: behavior });
      }

      window.addEventListener('scroll', readScroll, { passive: true });
      btn.addEventListener('click', goTop);

      /* Estado inicial (p. ej. recarga con la página a mitad de scroll) */
      readScroll();
    }
  };
})(window.MB = window.MB || {});
