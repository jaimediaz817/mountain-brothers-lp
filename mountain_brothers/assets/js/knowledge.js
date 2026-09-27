/* ==========================================================================
   MOUNTAIN BROTHERS · knowledge.js
   MOUNTAIN KNOWLEDGE · buscador demostrativo.
   Filtra por categoría y por texto libre sobre un conjunto local de temas.
   Los temas se despliegan con <details> nativo: funcionalidad real,
   accesible por teclado y sin JavaScript adicional.
   En la versión final esta capa consultará la Knowledge Base del proyecto.
   ========================================================================== */

(function (MB) {
  'use strict';

  var util = MB.util;

  MB.knowledge = {
    root: null,
    state: { query: '', cat: 'all' },

    init: function () {
      var root = util.qs('[data-knowledge]');
      if (!root || !MB.data || !MB.data.knowledge) { return; }

      MB.knowledge.root = root;
      MB.knowledge.input = util.qs('[data-knowledge-input]', root);
      MB.knowledge.cats = util.qs('[data-knowledge-cats]', root);
      MB.knowledge.results = util.qs('[data-knowledge-results]', root);
      MB.knowledge.count = util.qs('[data-knowledge-count]', root);
      MB.knowledge.status = util.qs('[data-knowledge-status]', root);

      MB.knowledge.renderCats();
      MB.knowledge.render();

      if (MB.knowledge.input) {
        MB.knowledge.input.addEventListener('input', function (event) {
          MB.knowledge.state.query = event.target.value;
          MB.knowledge.render();
        });
      }
    },

    renderCats: function () {
      var data = MB.data.knowledge;
      var items = [{ id: 'all', label: 'Todas' }].concat(
        data.categories.map(function (category) {
          return { id: category, label: category };
        })
      );

      MB.knowledge.cats.innerHTML = items.map(function (item) {
        return '<button type="button" class="chip" data-knowledge-cat="' +
          util.escape(item.id) + '" aria-pressed="' +
          (item.id === MB.knowledge.state.cat ? 'true' : 'false') + '">' +
          util.escape(item.label) + '</button>';
      }).join('');

      MB.knowledge.cats.addEventListener('click', function (event) {
        var button = event.target.closest('[data-knowledge-cat]');
        if (!button) { return; }

        MB.knowledge.state.cat = button.getAttribute('data-knowledge-cat');

        util.qsa('[data-knowledge-cat]', MB.knowledge.cats).forEach(function (chip) {
          chip.setAttribute('aria-pressed', chip === button ? 'true' : 'false');
        });

        MB.knowledge.render();
      });
    },

    filter: function () {
      var query = util.normalize(MB.knowledge.state.query.trim());
      var cat = MB.knowledge.state.cat;

      return MB.data.knowledge.topics.filter(function (topic) {
        var matchesCat = cat === 'all' || topic.cat === cat;
        if (!matchesCat) { return false; }
        if (!query) { return true; }

        var haystack = util.normalize(
          topic.title + ' ' + topic.cat + ' ' + topic.keywords + ' ' + topic.summary
        );
        return haystack.indexOf(query) !== -1;
      });
    },

    render: function () {
      var topics = MB.knowledge.filter();

      if (MB.knowledge.count) {
        MB.knowledge.count.textContent = topics.length + ' de ' +
          MB.data.knowledge.topics.length + ' temas';
      }

      if (!topics.length) {
        MB.knowledge.results.innerHTML =
          '<p class="knowledge-empty">No hay temas para esta búsqueda todavía. ' +
          'En la versión final, el buscador consultará MOUNTAIN KNOWLEDGE y ' +
          'responderá con contenido real.</p>';
        util.announce(MB.knowledge.status, 'Sin resultados para la búsqueda.');
        return;
      }

      MB.knowledge.results.innerHTML = topics.map(function (topic) {
        return '' +
          '<details class="knowledge-item">' +
            '<summary>' +
              '<span class="knowledge-item__cat">' + util.escape(topic.cat) + '</span>' +
              '<span class="knowledge-item__topic">' +
                util.escape(topic.title) +
                '<svg aria-hidden="true"><use href="#i-chevron-down"></use></svg>' +
              '</span>' +
            '</summary>' +
            '<p class="knowledge-item__body">' + util.escape(topic.summary) + '</p>' +
          '</details>';
      }).join('');

      util.announce(MB.knowledge.status, topics.length + ' temas encontrados.');
    }
  };
})(window.MB = window.MB || {});
