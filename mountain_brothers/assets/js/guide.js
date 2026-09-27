/* ==========================================================================
   MOUNTAIN BROTHERS · guide.js
   MOUNTAIN AI GUIDE · demostración de producto.

   IMPORTANTE Y HONESTO: en esta versión no hay ningún modelo conectado.
   Existe un guion de escenarios con detección de intención por palabras
   clave, que hace visible cómo se comportará el guía real cuando se conecte
   a la Knowledge Base del proyecto. La interfaz lo declara explícitamente.
   ========================================================================== */

(function (MB) {
  'use strict';

  var util = MB.util;

  MB.guide = {
    root: null,
    busy: false,
    started: false,

    init: function () {
      var root = util.qs('[data-guide]');
      if (!root || !MB.data || !MB.data.guide) { return; }

      MB.guide.root = root;
      MB.guide.stream = util.qs('[data-guide-stream]', root);
      MB.guide.prompts = util.qs('[data-guide-prompts]', root);
      MB.guide.form = util.qs('[data-guide-form]', root);
      MB.guide.input = util.qs('[data-guide-input]', root);
      MB.guide.meters = util.qs('[data-guide-meters]', root);
      MB.guide.status = util.qs('[data-guide-status]', root);

      MB.guide.renderPrompts();

      /* Punto de partida visible: el panel nunca se muestra vacío */
      MB.meters.render(MB.guide.meters);
      MB.meters.update(MB.guide.meters, {
        conocimiento: 10, condicion: 12, equipo: 8, experiencia: 6, altitud: 3
      });

      /* El chat nunca arranca vacío: se muestra el saludo del guía */
      MB.guide.ensureGreeting();

      if (MB.guide.form) {
        MB.guide.form.addEventListener('submit', function (event) {
          event.preventDefault();
          var text = MB.guide.input ? MB.guide.input.value.trim() : '';
          if (!text) { return; }
          if (MB.guide.input) { MB.guide.input.value = ''; }
          MB.guide.ask(text);
        });
      }
    },

    renderPrompts: function () {
      if (!MB.guide.prompts) { return; }

      MB.guide.prompts.innerHTML = MB.data.guide.prompts.map(function (prompt) {
        return '<button type="button" class="chip" data-guide-prompt="' +
          util.escape(prompt.id) + '">' + util.escape(prompt.label) + '</button>';
      }).join('');

      MB.guide.prompts.addEventListener('click', function (event) {
        var button = event.target.closest('[data-guide-prompt]');
        if (!button) { return; }
        var id = button.getAttribute('data-guide-prompt');
        var thread = MB.data.guide.threads.filter(function (item) {
          return item.id === id;
        })[0];
        if (thread) { MB.guide.run(thread); }
      });
    },

    /** Respuesta a texto libre: intención por palabras clave. */
    ask: function (text) {
      MB.guide.run(MB.guide.resolve(text), text);
    },

    /** Devuelve el escenario con más coincidencias o null si no hay ninguno. */
    resolve: function (text) {
      var clean = util.normalize(text);
      var best = null;
      var bestHits = 0;

      MB.data.guide.threads.forEach(function (thread) {
        var hits = thread.keywords.filter(function (keyword) {
          return clean.indexOf(util.normalize(keyword)) !== -1;
        }).length;
        if (hits > bestHits) { bestHits = hits; best = thread; }
      });

      return best;
    },

    /**
     * Ejecuta un escenario: mensaje del usuario, indicador de escritura y
     * respuesta del guía con el desglose en cinco dimensiones.
     */
    run: function (thread, userText) {
      if (MB.guide.busy) { return; }
      MB.guide.busy = true;

      MB.guide.ensureGreeting();
      MB.guide.pushUser(userText || (thread ? thread.user : 'Cuéntame por dónde empiezo.'));
      MB.guide.setInputState(false);

      var typing = MB.guide.pushTyping();
      var delay = util.reducedMotion() ? 0 : 780;

      window.setTimeout(function () {
        typing.remove();
        MB.guide.pushAi(thread);
        MB.guide.busy = false;
        MB.guide.setInputState(true);
      }, delay);
    },

    ensureGreeting: function () {
      if (MB.guide.started) { return; }
      MB.guide.started = true;
      MB.guide.append(
        '<div class="chat__msg chat__msg--ai">' +
          '<span class="chat__author">Mountain AI Guide</span>' +
          '<div class="chat__bubble">' + util.escape(MB.data.guide.greeting) + '</div>' +
        '</div>'
      );
    },

    pushUser: function (text) {
      MB.guide.append(
        '<div class="chat__msg chat__msg--user">' +
          '<span class="chat__author">Tú</span>' +
          '<div class="chat__bubble">' + util.escape(text) + '</div>' +
        '</div>'
      );
      MB.guide.scroll();
    },

    pushTyping: function () {
      var node = MB.guide.append(
        '<div class="chat__msg chat__msg--ai" aria-hidden="true">' +
          '<span class="chat__typing"><span></span><span></span><span></span></span>' +
        '</div>'
      );
      MB.guide.scroll();
      return node;
    },

    pushAi: function (thread) {
      var guide = MB.data.guide;
      var isFallback = !thread;

      var findings = thread
        ? '<div class="chat__findings">' +
            thread.findings.map(function (finding) {
              return '<p class="chat__finding">' +
                '<svg aria-hidden="true"><use href="#i-check"></use></svg>' +
                '<span><b>' + util.escape(finding.label) + ':</b> ' +
                util.escape(finding.text) + '</span></p>';
            }).join('') +
          '</div>'
        : '';

      MB.guide.append(
        '<div class="chat__msg chat__msg--ai">' +
          '<span class="chat__author">Mountain AI Guide</span>' +
          '<div class="chat__bubble">' +
            util.escape(isFallback ? guide.fallback : thread.ai) +
            findings +
          '</div>' +
        '</div>'
      );

      if (thread) {
        MB.meters.render(MB.guide.meters);
        MB.meters.update(MB.guide.meters, thread.meters);
        util.announce(MB.guide.status, 'Respuesta del guía con cinco dimensiones actualizadas.');
      } else {
        util.announce(MB.guide.status, 'El guía informa que este tema no está cubierto en la demostración.');
      }

      MB.guide.scroll();
    },

    append: function (html) {
      if (!MB.guide.stream) { return null; }
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      var node = wrapper.firstElementChild;
      MB.guide.stream.appendChild(node);
      return node;
    },

    scroll: function () {
      var stream = MB.guide.stream;
      if (!stream) { return; }
      stream.scrollTop = stream.scrollHeight;
    },

    /** Bloquea el formulario mientras el guía "escribe". */
    setInputState: function (enabled) {
      if (MB.guide.input) { MB.guide.input.disabled = !enabled; }
      var submit = util.qs('[data-guide-submit]', MB.guide.root);
      if (submit) { submit.disabled = !enabled; }
    },
  };
})(window.MB = window.MB || {});
