/* ==========================================================================
   MOUNTAIN BROTHERS · momentos.js
   IntersectionObserver para reproducción inteligente de vídeos verticales.
   Solo reproduce cuando el elemento está en viewport; pausa al salir.
   Respeta prefers-reduced-motion y connection.saveData.
   ========================================================================== */

(function (MB) {
  'use strict';

  var util = MB.util;

  MB.momentos = {
    init: function init() {
      var container = util.qs('[data-momentos]');
      if (!container) { return; }

      var items = container.querySelectorAll('[data-momento]');
      if (!items.length) { return; }

      var reducedMotion = util.reducedMotion();
      var saveData = navigator.connection && navigator.connection.saveData;

      /* OJO rutas: el valor de --momento-poster se consume con var() en
         sections.css, así que su url() se resuelve relativo a ese CSS
         (assets/css/) y NO al documento. Por eso aquí lleva ../images/.
         El atributo poster del <video>, en cambio, sí se resuelve
         relativo al documento y usa assets/images/. */
      var postersCss = { momento1: '../images/momento-1.jpg', momento2: '../images/momento-2.jpg', momento3: '../images/momento-3.jpg' };
      var postersDoc = { momento1: 'assets/images/momento-1.jpg', momento2: 'assets/images/momento-2.jpg', momento3: 'assets/images/momento-3.jpg' };
      var fallbackPosterCss = function (fig) {
        var k = fig.getAttribute('data-momento-src');
        return postersCss[k] || '../images/momento-1.jpg';
      };

      if (reducedMotion || saveData) {
        items.forEach(function (fig) {
          var video = fig.querySelector('.momento__video');
          if (video) {
            video.remove();
            fig.style.setProperty('--momento-poster', 'url("' + fallbackPosterCss(fig) + '")');
          }
        });
        return;
      }

      var videoMap = {};
      items.forEach(function (fig) {
        var key = fig.dataset.momentoSrc;
        var src = MB.config.videos[key];
        if (!src) { return; }
        var video = fig.querySelector('.momento__video');
        if (video) {
          video.src = src;
          videoMap[fig] = video;
        }
        var posterCss = postersCss[key] || '../images/momento-1.jpg';
        var posterDoc = postersDoc[key] || 'assets/images/momento-1.jpg';
        fig.style.setProperty('--momento-poster', 'url("' + posterCss + '")');
        if (video && !video.getAttribute('poster')) { video.setAttribute('poster', posterDoc); }
      });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var fig = entry.target;
          var video = videoMap[fig];
          if (!video) { return; }

          if (entry.isIntersecting) {
            var playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(function () {
                video.muted = true;
                video.play().catch(function () {});
              });
            }
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.25
      });

      items.forEach(function (fig) {
        observer.observe(fig);
      });

      MB.util.on('mb:reveal', function (el) {
        if (el.matches('[data-momento]') || el.closest('[data-momento]')) {
          var fig = el.matches('[data-momento]') ? el : el.closest('[data-momento]');
          fig.classList.add('is-visible');
        }
      });
    }
  };
})(window.MB = window.MB || {});