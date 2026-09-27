/* ==========================================================================
   MOUNTAIN BROTHERS · quiz.js
   MiniApp "¿Qué tipo de aventurero eres?".
   Solo ordena un punto de partida: no evalúa capacidades, no diagnostica y
   no certifica aptitud física. En caso de empate se elige el perfil más
   conservador (menor nivel) de forma deliberada.
   ========================================================================== */

(function (MB) {
  'use strict';

  var util = MB.util;

  MB.quiz = {
    root: null,
    panels: {},
    state: null,

    init: function () {
      var root = util.qs('[data-quiz]');
      if (!root || !MB.data || !MB.data.quiz) { return; }

      MB.quiz.root = root;
      MB.quiz.status = util.qs('[data-quiz-status]', root);
      MB.quiz.stepLabel = util.qs('[data-quiz-step]', root);
      MB.quiz.bar = util.qs('[data-quiz-bar]', root);
      MB.quiz.state = { index: 0, answers: {} };

      MB.quiz.panels = {
        intro: util.qs('[data-quiz-panel="intro"]', root),
        questions: util.qs('[data-quiz-panel="questions"]', root),
        result: util.qs('[data-quiz-panel="result"]', root)
      };

      var start = util.qs('[data-quiz-start]', root);
      if (start) {
        start.addEventListener('click', function () { MB.quiz.start(); });
      }

      /* CTA "Descubrir mi perfil" puede estar fuera de la tarjeta */
      util.qsa('[data-quiz-launch]').forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          MB.quiz.launch();
        });
      });

      var questions = MB.quiz.panels.questions;
      questions.addEventListener('change', function (event) {
        var input = event.target;
        if (!input || input.type !== 'radio') { return; }
        MB.quiz.select(input);
      });

      questions.addEventListener('click', function (event) {
        var button = event.target.closest('[data-quiz-prev], [data-quiz-next]');
        if (!button) { return; }
        if (button.hasAttribute('data-quiz-prev')) { MB.quiz.previous(); }
        else { MB.quiz.next(); }
      });

      var restart = util.qs('[data-quiz-restart]', MB.quiz.panels.result);
      if (restart) {
        restart.addEventListener('click', function () { MB.quiz.start(); });
      }
    },

    /* ------------------------------------------------------------ acciones */

    start: function () {
      MB.quiz.state = { index: 0, answers: {} };
      util.qsa('.profile[data-match]', document).forEach(function (card) {
        card.removeAttribute('data-match');
      });
      MB.quiz.showPanel('questions');
      MB.quiz.renderStep(false);
      util.announce(MB.quiz.status, 'Test iniciado. Pregunta 1 de ' + MB.data.quiz.questions.length + '.');
    },

    launch: function () {
      var root = MB.quiz.root;
      root.scrollIntoView({ behavior: util.reducedMotion() ? 'auto' : 'smooth', block: 'center' });

      var start = util.qs('[data-quiz-start]', root);
      var next = util.qs('[data-quiz-next]', root);

      window.setTimeout(function () {
        if (start && !MB.quiz.panels.intro.hasAttribute('hidden')) { start.focus(); }
        else if (next) { next.focus(); }
        else { root.focus(); }
      }, util.reducedMotion() ? 0 : 420);
    },

    select: function (input) {
      var question = MB.data.quiz.questions[MB.quiz.state.index];
      MB.quiz.state.answers[question.id] = Number(input.value);

      var next = util.qs('[data-quiz-next]', MB.quiz.panels.questions);
      if (next) { next.removeAttribute('disabled'); }

      MB.quiz.updateProgress();
      util.announce(MB.quiz.status, 'Respuesta registrada: ' + input.parentNode.textContent.trim());
    },

    previous: function () {
      if (MB.quiz.state.index === 0) { return; }
      MB.quiz.state.index -= 1;
      MB.quiz.renderStep(true);
    },

    next: function () {
      var total = MB.data.quiz.questions.length;
      if (MB.quiz.state.index < total - 1) {
        MB.quiz.state.index += 1;
        MB.quiz.renderStep(true);
        return;
      }
      MB.quiz.finish();
    },

    /* -------------------------------------------------------------- render */

    showPanel: function (name) {
      Object.keys(MB.quiz.panels).forEach(function (key) {
        var panel = MB.quiz.panels[key];
        if (!panel) { return; }
        if (key === name) { panel.removeAttribute('hidden'); }
        else { panel.setAttribute('hidden', ''); }
      });

      /* La barra de progreso solo tiene sentido durante el test */
      var bar = util.qs('[data-quiz-progress]', MB.quiz.root);
      if (bar) {
        if (name === 'questions') { bar.removeAttribute('hidden'); }
        else { bar.setAttribute('hidden', ''); }
      }
    },

    updateProgress: function () {
      var total = MB.data.quiz.questions.length;
      var answered = Object.keys(MB.quiz.state.answers).length;
      var value = Math.round((answered / total) * 100);

      if (MB.quiz.bar) { MB.quiz.bar.style.setProperty('--value', String(value)); }
      if (MB.quiz.stepLabel) {
        MB.quiz.stepLabel.textContent = 'Paso ' + (MB.quiz.state.index + 1) + ' de ' + total;
      }
    },

    renderStep: function (focusSelection) {
      var quiz = MB.data.quiz;
      var question = quiz.questions[MB.quiz.state.index];
      var total = quiz.questions.length;
      var isLast = MB.quiz.state.index === total - 1;
      var selected = MB.quiz.state.answers[question.id];

      var options = question.options.map(function (option, optionIndex) {
        var id = 'quiz-' + question.id + '-' + optionIndex;
        return '' +
          '<label class="quiz-option">' +
            '<input class="quiz-option__input" type="radio" id="' + id + '" ' +
                   'name="quiz-' + question.id + '" value="' + optionIndex + '" ' +
                   (selected === optionIndex ? 'checked' : '') + '>' +
            '<span class="quiz-option__marker" aria-hidden="true"></span>' +
            '<span class="quiz-option__label">' + util.escape(option.label) + '</span>' +
            '<span class="quiz-option__hint">' + util.escape(option.hint) + '</span>' +
          '</label>';
      }).join('');

      MB.quiz.panels.questions.innerHTML = '' +
        '<fieldset class="quiz__question">' +
          '<legend class="quiz__question-title">' + util.escape(question.title) + '</legend>' +
          '<div class="quiz-options">' + options + '</div>' +
        '</fieldset>' +
        '<div class="quiz__actions">' +
          (MB.quiz.state.index > 0
            ? '<button type="button" class="btn btn--ghost btn--sm" data-quiz-prev>' +
              '<svg aria-hidden="true"><use href="#i-arrow-left"></use></svg>Anterior</button>'
            : '') +
          '<button type="button" class="btn btn--primary" data-quiz-next' +
                  (selected == null ? ' disabled' : '') + '>' +
            (isLast ? 'Ver mi perfil' : 'Siguiente') +
            '<svg aria-hidden="true"><use href="#i-arrow-right"></use></svg>' +
          '</button>' +
          '<p class="meta">Tus respuestas no se envían a ningún servidor.</p>' +
        '</div>';

      MB.quiz.updateProgress();

      if (focusSelection) {
        var current = util.qs('.quiz-option__input:checked', MB.quiz.panels.questions);
        var field = util.qs('input', MB.quiz.panels.questions);
        if (current) { current.focus(); } else if (field) { field.focus(); }
      }
    },

    computeProfile: function () {
      var scores = { explorador: 0, trekker: 0, montanista: 0, cumbre: 0 };

      MB.data.quiz.questions.forEach(function (question) {
        var index = MB.quiz.state.answers[question.id];
        if (index == null) { return; }
        var optionScores = question.options[index].scores || {};
        Object.keys(optionScores).forEach(function (key) {
          scores[key] = (scores[key] || 0) + optionScores[key];
        });
      });

      /* Empate → gana el perfil de menor nivel (el más conservador) */
      var bestId = MB.data.profileOrder[0];
      MB.data.profileOrder.forEach(function (id) {
        if (scores[id] > scores[bestId]) { bestId = id; }
      });

      return { id: bestId, scores: scores };
    },

    finish: function () {
      var outcome = MB.quiz.computeProfile();
      var profile = MB.data.profiles[outcome.id];

      /* Marca visualmente la tarjeta del perfil coincidente */
      util.qsa('.profile', document).forEach(function (card) {
        if (card.getAttribute('data-profile') === profile.id) {
          card.setAttribute('data-match', 'true');
        } else {
          card.removeAttribute('data-match');
        }
      });

      MB.quiz.panels.result.innerHTML = '' +
        '<div class="quiz-result" tabindex="-1" data-quiz-result>' +
          '<div class="stack">' +
            '<span class="tag tag--demo">Resultado orientativo · demostración</span>' +
            '<h3 class="quiz-result__name">' + util.escape(profile.name) + '</h3>' +
            '<p class="lede">' + util.escape(profile.summary) + '</p>' +
          '</div>' +

          '<div class="stack">' +
            '<p class="eyebrow eyebrow--bare">Próximo paso sugerido</p>' +
            '<p class="body-text">' + util.escape(profile.nextStep) + '</p>' +
          '</div>' +

          '<div class="stack">' +
            '<p class="eyebrow eyebrow--bare">Por dónde empezar</p>' +
            '<ul class="hairline-list">' +
              profile.focus.map(function (item, index) {
                return '<li class="community__item" style="border-top-width:' +
                  (index === 0 ? '0' : '1px') + '">' +
                  '<svg aria-hidden="true"><use href="#i-check"></use></svg>' +
                  '<span>' + util.escape(item) + '</span></li>';
              }).join('') +
            '</ul>' +
          '</div>' +

          '<div class="quiz-result__meters">' +
            '<p class="eyebrow eyebrow--bare">Punto de partida estimado</p>' +
            '<div class="ai__meters" data-quiz-meters></div>' +
            '<p class="ai__panel-note">Porcentajes ilustrativos del perfil, no una medición de tu condición.</p>' +
          '</div>' +

          '<div class="disclaimer">' +
            '<svg aria-hidden="true"><use href="#i-info"></use></svg>' +
            '<span>Este resultado ordena tu punto de partida y no es un diagnóstico médico ni una ' +
            'certificación de aptitud física. No reemplaza la valoración de un profesional ni la ' +
            'evaluación real de las condiciones de una montaña.</span>' +
          '</div>' +

          '<div class="quiz__actions">' +
            '<button type="button" class="btn btn--ghost" data-quiz-restart>' +
              '<svg aria-hidden="true"><use href="#i-refresh"></use></svg>Repetir el test</button>' +
            '<a class="link-arrow" href="#guia">Continuar con el guía' +
              '<svg aria-hidden="true"><use href="#i-arrow-right"></use></svg></a>' +
          '</div>' +
        '</div>';

      /* Re-engancha el botón de reinicio: el HTML se regeneró */
      var restart = util.qs('[data-quiz-restart]', MB.quiz.panels.result);
      if (restart) {
        restart.addEventListener('click', function () { MB.quiz.start(); });
      }

      var meters = util.qs('[data-quiz-meters]', MB.quiz.panels.result);
      MB.meters.render(meters);
      MB.meters.update(meters, profile.meters);

      MB.quiz.showPanel('result');
      util.announce(MB.quiz.status, 'Resultado: ' + profile.name + '. Perfil orientativo.');

      var result = util.qs('[data-quiz-result]', MB.quiz.panels.result);
      if (result) {
        result.focus();
        result.scrollIntoView({ behavior: util.reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      }
    }
  };
})(window.MB = window.MB || {});
