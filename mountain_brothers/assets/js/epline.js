/* ==========================================================================
   MOUNTAIN BROTHERS · epline.js
   "Línea del Episodio" — player de audio automático, cero configuración.

   - Partes autogeneradas según la duración real (4–8, cadencia ~4 min)
   - Waveform en canvas: la onda se dibuja CONFORME SUENA (AnalyserNode en
     streaming, sin decodificar el archivo ni descargar datos extra)
   - Riel de partes con estado pasado / actual / futuro y seek por clic
   - Línea viva: parte actual, tiempo y cuenta atrás al siguiente hito
   - Scrub arrastrable con burbuja de preview + teclado (role=slider)
   - Velocidad y volumen recordados · retomar · repetir · mediaSession
   - Mini-player sticky cuando la tarjeta sale de pantalla
   - Respeta prefers-reduced-motion y connection.saveData
   ========================================================================== */

(function (MB) {
  'use strict';

  var util = MB.util;

  var SPEEDS = [1, 1.25, 1.5, 2];
  var BUCKETS = 160;
  var STORE_SPEED = 'mb-epline-speed';
  var STORE_VOL = 'mb-epline-vol';

  MB.epline = {
    init: function () {
      var root = util.qs('[data-epline]');
      if (!root) { return; }
      var audio = util.qs('[data-epline-audio]', root);
      if (!audio) { return; }

      var currentEp = root.getAttribute('data-epline') || 'relatos';
      var epsWrap = util.qs('[data-epline-eps]', root);
      var epButtons = epsWrap ? util.qsa('[data-epline-ep]', epsWrap) : [];
      var epNumEl = util.qs('[data-epline-epnum]');
      var epMinEl = util.qs('[data-epline-epmin]');
      var epTitleEl = util.qs('[data-epline-eptitle]');

      function progressKey() { return 'mb-epline-progress-' + currentEp; }

      var statusEl = util.qs('[data-epline-status]', root);
      var resumeBtn = util.qs('[data-epline-resume]', root);
      var playBtn = util.qs('[data-epline-play]', root);
      var scrub = util.qs('[data-epline-scrub]', root);
      var canvas = util.qs('[data-epline-canvas]', root);
      var bubble = util.qs('[data-epline-bubble]', root);
      var curEl = util.qs('[data-epline-cur]', root);
      var durEl = util.qs('[data-epline-dur]', root);
      var stopsEl = util.qs('[data-epline-stops]', root);
      var backBtn = util.qs('[data-epline-back]', root);
      var fwdBtn = util.qs('[data-epline-fwd]', root);
      var speedBtn = util.qs('[data-epline-speed]', root);
      var volEl = util.qs('[data-epline-vol]', root);
      var repeatBtn = util.qs('[data-epline-repeat]', root);
      var toast = util.qs('[data-epline-toast]', root);
      var cursor = util.qs('[data-epline-cursor]', root);
      var hint = util.qs('[data-epline-hint]', root);
      var sleepBtn = util.qs('[data-epline-sleep]', root);
      var sleepLabel = util.qs('[data-epline-sleep-label]', root);
      var dlEl = util.qs('[data-epline-dl]', root);

      if (!playBtn || !scrub || !stopsEl) { return; }

      var reduced = util.reducedMotion();
      var saveData = !!(navigator.connection && navigator.connection.saveData);
      var parts = [];
      var peaks = new Float32Array(BUCKETS);
      var dragging = false;
      var scrubOnScreen = true;
      var rafId = 0;
      var ctx = null;
      var analyser = null;
      var timeData = null;
      var lastSave = 0;
      var lastIdx = null;
      var toastTimer = 0;

      /* ------------------------------------------------------------ utils */
      function fmt(seconds) {
        seconds = Math.max(0, Math.floor(seconds || 0));
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
      }

      function dur() {
        return (audio.duration && isFinite(audio.duration)) ? audio.duration : 0;
      }

      function setStatus(msg) {
        if (statusEl && statusEl.textContent !== msg) { statusEl.textContent = msg; }
      }

      function showToast(msg) {
        if (!toast) { return; }
        toast.textContent = msg;
        toast.classList.add('is-on');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
          toast.classList.remove('is-on');
        }, 2200);
      }

      function scrollRailTo(idx) {
        if (!stopsEl || stopsEl.scrollWidth <= stopsEl.clientWidth + 4) { return; }
        var btn = stopsEl.querySelectorAll('.epline__stop')[idx];
        if (!btn) { return; }
        var target = btn.offsetLeft - stopsEl.clientWidth / 2 + btn.offsetWidth / 2;
        if (stopsEl.scrollTo) {
          stopsEl.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
        } else {
          stopsEl.scrollLeft = target;
        }
      }

      function partIndex(t) {
        var idx = 0;
        for (var i = 0; i < parts.length; i++) {
          if (t >= parts[i].t - 0.05) { idx = i; }
        }
        return idx;
      }

      /* --------------------------------------------------- partes (auto) */
      function buildParts() {
        var d = dur();
        if (!d) { return; }
        var n = Math.min(8, Math.max(4, Math.round(d / 240)));
        parts = [];
        for (var i = 0; i < n; i++) {
          parts.push({ t: (d * i) / n });
        }
        var html = '';
        parts.forEach(function (p, i) {
          html += '<li><button type="button" class="epline__stop" data-t="' + p.t +
            '" aria-label="Saltar a Parte ' + (i + 1) + ', ' + fmt(p.t) + '">' +
            '<b>Parte ' + (i + 1) + '</b><i>' + fmt(p.t) + '</i></button></li>';
        });
        stopsEl.innerHTML = html;
        if (durEl) { durEl.textContent = fmt(d); }
        if (epMinEl) { epMinEl.textContent = '· ' + Math.round(d / 60) + ' min'; }
        setEpDur(currentEp, fmt(d));
        updateResumeChip();
        updateAll();
        draw();
      }

        var btn = e.target.closest(".epline__stop");
      stopsEl.addEventListener('click', function (e) {
        var btn = e.target.closest(".epline__stop");
        if (!btn) { return; }
        var d = dur();
        if (!d) {
          showToast('Audio cargando… espera un momento');
          return;
        }
        var t = parseFloat(btn.getAttribute('data-t'));
        if (isFinite(t)) { seek(t); }
      });

      /* ------------------------------------------------------- estado UI */
      function updateStops() {
        var idx = partIndex(audio.currentTime || 0);
        var buttons = stopsEl.querySelectorAll('.epline__stop');
        Array.prototype.forEach.call(buttons, function (btn, i) {
          btn.classList.toggle('is-past', i < idx);
          btn.classList.toggle('is-current', i === idx);
          if (i === idx) { btn.setAttribute('aria-current', 'true'); }
          else { btn.removeAttribute('aria-current'); }
        });
        stopsEl.style.setProperty('--rail', (dur() ? (audio.currentTime / dur()) * 100 : 0) + '%');
        if (parts.length && lastIdx !== null && idx !== lastIdx) {
          showToast('→ Parte ' + (idx + 1));
          scrollRailTo(idx);
        }
        lastIdx = idx;
      }

      function updateStatus() {
        var d = dur();
        if (!parts.length || !d) {
          setStatus('Cargando audio…');
          return;
        }
        if (audio.ended) {
          setStatus('Episodio terminado · ' + fmt(d));
          return;
        }
        var i = partIndex(audio.currentTime);
        var next = (i + 1 < parts.length) ? parts[i + 1].t : d;
        var left = Math.max(0, next - audio.currentTime);
        setStatus('Parte ' + (i + 1) + ' de ' + parts.length + ' · ' +
          fmt(audio.currentTime) + ' · ' +
          (i + 1 < parts.length ? 'siguiente en ' : 'final en ') + fmt(left));
      }

      function updateClock() {
        var d = dur();
        var t = audio.currentTime || 0;
        if (curEl) { curEl.textContent = fmt(t); }
        var pct = d ? Math.round((t / d) * 100) : 0;
        scrub.setAttribute('aria-valuenow', String(pct));
        scrub.setAttribute('aria-valuetext', fmt(t) + ' de ' + (d ? fmt(d) : '—:—'));
        updateMini(t, d);
      }

      function updateAll() {
        updateStatus();
        updateStops();
        updateClock();
      }

      /* ---------------------------------------------------------- retomar */
      function savedProgress() {
        try {
          var v = parseFloat(window.localStorage.getItem(progressKey()));
          return isFinite(v) ? v : 0;
        } catch (e) { return 0; }
      }

      function saveProgress() {
        var d = dur();
        if (!d) { return; }
        try {
          if (audio.ended || audio.currentTime >= d - 5) {
            window.localStorage.removeItem(progressKey());
          } else {
            window.localStorage.setItem(progressKey(), String(audio.currentTime));
          }
        } catch (e) {}
      }

      function updateResumeChip() {
        var d = dur();
        var saved = savedProgress();
        if (!resumeBtn) { return; }
        if (d && saved > 15 && saved < d - 30) {
          resumeBtn.textContent = '▶ Retomar desde ' + fmt(saved);
          resumeBtn.hidden = false;
        } else {
          resumeBtn.hidden = true;
        }
      }

      if (resumeBtn) {
        resumeBtn.addEventListener('click', function () {
          var saved = savedProgress();
          if (saved > 0) { seek(saved); }
          resumeBtn.hidden = true;
          togglePlay();
        });
      }

      /* ------------------------------------------------------ reproducir */
      function ensureGraph() {
        if (ctx || saveData) { return; }
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { return; }
        try {
          ctx = new AC();
          analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          timeData = new Uint8Array(analyser.fftSize);
          ctx.createMediaElementSource(audio).connect(analyser);
          analyser.connect(ctx.destination);
        } catch (e) {
          ctx = null;
          analyser = null;
        }
      }

      function togglePlay() {
        if (audio.error) {
          root.classList.remove('is-error');
          try { audio.load(); } catch (e) {}
        }
        if (audio.paused) {
          ensureGraph();
          if (ctx && ctx.state === 'suspended') { ctx.resume(); }
          var p = audio.play();
          if (p && typeof p.catch === 'function') {
            p.catch(function () {
              setStatus('Pulsa reproducir para escuchar');
            });
          }
        } else {
          audio.pause();
        }
      }

      function setPlayIcon(playing) {
        var use = playBtn.querySelector('use');
        if (use) { use.setAttribute('href', playing ? '#i-pause' : '#i-play'); }
        playBtn.setAttribute('aria-label', playing ? 'Pausar episodio' : 'Reproducir episodio');
      }

      function seek(t) {
        var d = dur();
        if (!d) { return; }
        var target = Math.min(d - 0.25, Math.max(0, t));
        try {
          audio.currentTime = target;
        } catch (e) {
          showToast('No se puede saltar aún (buffering)');
          return;
        }
        draw();
        updateAll();
      }

      playBtn.addEventListener('click', togglePlay);
      if (backBtn) { backBtn.addEventListener('click', function () { seek((audio.currentTime || 0) - 15); }); }
      if (fwdBtn) { fwdBtn.addEventListener('click', function () { seek((audio.currentTime || 0) + 15); }); }

      if (repeatBtn) {
        repeatBtn.addEventListener('click', function () {
          root.classList.remove('is-ended');
          repeatBtn.hidden = true;
          seek(0);
          togglePlay();
        });
      }

      /* -------------------------------------------------------- velocidad */
      var speedIdx = 0;
      var speedWrap = util.qs('[data-epline-speedwrap]', root);
      var speedMenu = util.qs('[data-epline-speedmenu]', root);
      var speedOpts = speedMenu ? util.qsa('[data-epline-opt]', speedMenu) : [];
      try {
        var storedSpeed = parseFloat(window.localStorage.getItem(STORE_SPEED));
        var found = SPEEDS.indexOf(storedSpeed);
        if (found > 0) { speedIdx = found; }
      } catch (e) {}

      function setSpeedMenu(open) {
        if (!speedBtn || !speedMenu) { return; }
        if (open) {
          speedMenu.classList.add('is-open');
          speedBtn.setAttribute('aria-expanded', 'true');
        } else {
          speedMenu.classList.remove('is-open');
          speedBtn.setAttribute('aria-expanded', 'false');
        }
      }

      function applySpeed() {
        var rate = SPEEDS[speedIdx];
        audio.playbackRate = rate;
        if (speedBtn) {
          speedBtn.textContent = rate + '×';
          speedBtn.setAttribute('aria-label', 'Velocidad de reproducción: ' + rate + '×');
        }
        if (speedOpts.length) {
          for (var i = 0; i < speedOpts.length; i++) {
            var on = parseFloat(speedOpts[i].getAttribute('data-epline-opt')) === rate;
            speedOpts[i].setAttribute('aria-checked', on ? 'true' : 'false');
            speedOpts[i].classList.toggle('is-active', on);
          }
        }
        try { window.localStorage.setItem(STORE_SPEED, String(rate)); } catch (e) {}
      }

      if (speedBtn) {
        speedBtn.addEventListener('click', function (e) {
          if (!speedMenu) {
            /* Sin menú (HTML mínimo): ciclar velocidades hacia delante. */
            speedIdx = (speedIdx + 1) % SPEEDS.length;
            applySpeed();
            return;
          }
          e.stopPropagation();
          setSpeedMenu(!speedMenu.classList.contains('is-open'));
        });
      }

      if (speedOpts.length) {
        for (var s = 0; s < speedOpts.length; s++) {
          speedOpts[s].addEventListener('click', function () {
            speedIdx = SPEEDS.indexOf(parseFloat(this.getAttribute('data-epline-opt')));
            if (speedIdx < 0) { speedIdx = 0; }
            applySpeed();
            setSpeedMenu(false);
          });
        }
      }

      /* Cerrar el menú al hacer clic fuera o pulsar Escape. */
      if (speedMenu) {
        document.addEventListener('click', function (e) {
          if (speedWrap && !speedWrap.contains(e.target)) { setSpeedMenu(false); }
        });
        document.addEventListener('keydown', function (e) {
          if ((e.key === 'Escape' || e.key === 'Esc') && speedMenu.classList.contains('is-open')) {
            setSpeedMenu(false);
          }
        });

        /* Navegación por teclado dentro del menú (patrón menú de radio):
           flechas ↑/↓ (y ←/→) recorren las opciones en bucle; Home/End
           saltan al principio o al final. Enter activa la opción enfocada. */
        function focusSpeedOpt(index) {
          if (!speedOpts.length) { return; }
          var n = (index + speedOpts.length) % speedOpts.length;
          speedOpts[n].focus();
        }

        speedMenu.addEventListener('keydown', function (e) {
          if (!speedMenu.classList.contains('is-open') || !speedOpts.length) { return; }
          switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
              e.preventDefault();
              focusSpeedOpt(speedOpts.indexOf(document.activeElement) + 1);
              break;
            case 'ArrowUp':
            case 'ArrowLeft':
              e.preventDefault();
              focusSpeedOpt(speedOpts.indexOf(document.activeElement) - 1);
              break;
            case 'Home':
              e.preventDefault();
              focusSpeedOpt(0);
              break;
            case 'End':
              e.preventDefault();
              focusSpeedOpt(speedOpts.length - 1);
              break;
          }
        });
      }

      applySpeed();

      /* ---------------------------------------------------------- volumen */
      if (volEl) {
        try {
          var storedVol = parseFloat(window.localStorage.getItem(STORE_VOL));
          if (isFinite(storedVol)) {
            audio.volume = Math.min(1, Math.max(0, storedVol));
            volEl.value = String(audio.volume);
          }
        } catch (e) {}
        volEl.addEventListener('input', function () {
          audio.volume = parseFloat(volEl.value);
          try { window.localStorage.setItem(STORE_VOL, String(audio.volume)); } catch (e) {}
        });
      }

      /* -------------------------------------------------- temporizador⏻ */
      var SLEEP_LABELS = ['Apagar', 'Fin de parte', '15 min', '30 min'];
      var SLEEP_ARIA = ['desactivado', 'pausar al final de la parte', '15 minutos', '30 minutos'];
      var sleepMode = 0;
      var sleepDeadline = 0;

      function setSleepLabel() {
        if (sleepLabel) { sleepLabel.textContent = SLEEP_LABELS[sleepMode]; }
        if (sleepBtn) {
          sleepBtn.setAttribute('aria-label', 'Temporizador de apagado: ' + SLEEP_ARIA[sleepMode]);
        }
      }

      function setSleepMode(mode, announce) {
        sleepMode = mode % SLEEP_LABELS.length;
        sleepDeadline = (sleepMode === 2 || sleepMode === 3)
          ? Date.now() + (sleepMode === 2 ? 15 : 30) * 60000
          : 0;
        setSleepLabel();
        if (announce) {
          showToast(sleepMode
            ? '⏻ Apagar: ' + SLEEP_LABELS[sleepMode]
            : '⏻ Temporizador desactivado');
        }
      }

      function sleepTrigger() {
        audio.pause();
        setSleepMode(0, false);
        showToast('⏸ Temporizador · audio en pausa');
      }

      function checkSleep() {
        if (!sleepMode || audio.paused) { return; }
        if (sleepMode === 2 || sleepMode === 3) {
          if (Date.now() >= sleepDeadline) { sleepTrigger(); }
        } else if (sleepMode === 1 && parts.length) {
          var idx = partIndex(audio.currentTime);
          var boundary = (idx + 1 < parts.length) ? parts[idx + 1].t : dur();
          if (audio.currentTime >= boundary - 0.3) { sleepTrigger(); }
        }
      }

      if (sleepBtn) {
        setSleepLabel();
        sleepBtn.addEventListener('click', function () {
          setSleepMode(sleepMode + 1, true);
        });
      }

      /* ------------------------------------------- chip de atajos (8 s) */
      var hintGone = false;
      function dismissHint() {
        if (hintGone || !hint) { return; }
        hintGone = true;
        hint.classList.add('is-off');
        window.setTimeout(function () { hint.hidden = true; }, 400);
        try { window.localStorage.setItem('mb-epline-hint', '1'); } catch (e) {}
      }

      try {
        if (window.localStorage.getItem('mb-epline-hint') === '1') {
          hintGone = true;
          if (hint) { hint.hidden = true; }
        } else {
          window.setTimeout(dismissHint, 8000);
          root.addEventListener('click', dismissHint, { once: true });
          root.addEventListener('keydown', dismissHint, { once: true });
        }
      } catch (e) {}

      /* -------------------------------------------- selector de episodios */
      function setEpDur(epKey, text) {
        epButtons.forEach(function (btn) {
          if (btn.getAttribute('data-epline-ep') === epKey) {
            var dEl = util.qs('[data-epline-epdur]', btn);
            if (dEl) { dEl.textContent = text; }
          }
        });
      }

      /* Duraciones reales de cada episodio (solo metadata, streaming) */
      epButtons.forEach(function (btn) {
        var epKey = btn.getAttribute('data-epline-ep');
        var src = (MB.config.audios || {})[epKey];
        if (!src) { return; }
        var probe = new Audio();
        probe.preload = 'metadata';
        probe.addEventListener('loadedmetadata', function () {
          if (isFinite(probe.duration)) { setEpDur(epKey, fmt(probe.duration)); }
        });
        probe.src = src;
      });

      function refreshEpisodeUI(btn) {
        epButtons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          if (active) { b.setAttribute('aria-current', 'true'); }
          else { b.removeAttribute('aria-current'); }
        });
        var titleNode = util.qs('.epline__ep-title', btn);
        var title = titleNode ? titleNode.textContent.trim() : 'Relatos de la Montaña';
        var num = btn.getAttribute('data-ep-num') || '';
        miniTitle = title;
        if (epTitleEl) { epTitleEl.textContent = title + '.'; }
        if (epNumEl) { epNumEl.textContent = 'Episodio ' + num; }
        if (epMinEl) { epMinEl.textContent = ''; }
        var mt = util.qs('.epline-mini__title', mini);
        if (mt) { mt.textContent = title; }
        updateMediaSession(title);
      }

      function switchEpisode(btn) {
        var epKey = btn.getAttribute('data-epline-ep');
        var src = (MB.config.audios || {})[epKey];
        if (!src) { return; }
        if (epKey === currentEp) {
          if (audio.paused) { togglePlay(); }
          return;
        }

        saveProgress();
        audio.pause();
        currentEp = epKey;
        root.setAttribute('data-epline', currentEp);

        /* Reset total: onda, partes y estados del episodio anterior */
        peaks = new Float32Array(BUCKETS);
        parts = [];
        lastIdx = null;
        stopsEl.innerHTML = '';
        root.classList.remove('is-ended', 'is-error');
        if (repeatBtn) { repeatBtn.hidden = true; }
        if (resumeBtn) { resumeBtn.hidden = true; }
        if (durEl) { durEl.textContent = '—:—'; }

        audio.src = src;
        audio.load();
        if (dlEl) { dlEl.setAttribute('href', src); }

        refreshEpisodeUI(btn);
        updateAll();
        draw();
        showToast('▶ Ep. ' + (btn.getAttribute('data-ep-num') || '') + ' · ' +
          (util.qs('.epline__ep-title', btn) || {}).textContent);

        ensureGraph();
        if (ctx && ctx.state === 'suspended') { ctx.resume(); }
        var p = audio.play();
        if (p && typeof p.catch === 'function') { p.catch(function () {}); }
      }

      if (epsWrap) {
        epsWrap.addEventListener('click', function (e) {
          var btn = e.target.closest("[data-epline-ep]");
          if (!btn) { return; }
          var epKey = btn.getAttribute('data-epline-ep');
          var src = (MB.config.audios || {})[epKey];
          if (!src) {
            showToast('Episodio no disponible');
            return;
          }
          switchEpisode(btn);
        });
      }

      /* --------------------------------------------------- scrub (canvas) */
      function resizeCanvas() {
        if (!canvas) { return; }
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var r = scrub.getBoundingClientRect();
        var w = Math.max(1, Math.round(r.width * dpr));
        var h = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        draw();
      }

      function draw() {
        if (!canvas || !canvas.getContext) { return; }
        var c = canvas.getContext('2d');
        if (!c) { return; }
        var w = canvas.width;
        var h = canvas.height;
        if (!w || !h) { return; }
        var dpr = w / (scrub.getBoundingClientRect().width || w);
        var d = dur();
        var t = audio.currentTime || 0;
        var pct = d ? t / d : 0;

        c.clearRect(0, 0, w, h);

        /* zona de búfer: tramos ya descargados (se puede saltar sin esperar) */
        if (d) {
          try {
            for (var bi = 0; bi < audio.buffered.length; bi++) {
              c.fillStyle = 'rgba(182, 165, 139, 0.14)';
              c.fillRect((audio.buffered.start(bi) / d) * w, 0,
                ((audio.buffered.end(bi) - audio.buffered.start(bi)) / d) * w, h);
            }
          } catch (e) {}
        }

        /* línea base del tiempo */
        c.fillStyle = 'rgba(243, 240, 232, 0.16)';
        c.fillRect(0, h / 2 - dpr / 2, w, dpr);

        /* marcas verticales en los límites de cada parte */
        c.fillStyle = 'rgba(243, 240, 232, 0.22)';
        parts.forEach(function (p, i) {
          if (i === 0 || !d) { return; }
          c.fillRect((p.t / d) * w, h * 0.18, dpr, h * 0.64);
        });

        /* onda descubierta: solo lo que ya sonó tiene barras */
        var bw = w / BUCKETS;
        for (var i = 0; i < BUCKETS; i++) {
          var v = peaks[i];
          if (v <= 0) { continue; }
          var bh = Math.max(2 * dpr, Math.min(1, v * 2.4) * (h * 0.8));
          var played = (i + 1) / BUCKETS <= pct;
          c.fillStyle = played ? '#b6a58b' : 'rgba(243, 240, 232, 0.55)';
          c.fillRect(i * bw + bw * 0.18, (h - bh) / 2, Math.max(dpr, bw * 0.64), bh);
        }

        /* playhead + punto "sol" */
        var px = pct * w;
        c.fillStyle = '#f3f0e8';
        c.fillRect(px - dpr * 0.75, 0, dpr * 1.5, h);
        c.beginPath();
        c.arc(px, 6 * dpr, 3 * dpr, 0, Math.PI * 2);
        c.fill();
      }

      function recordPeak() {
        if (!analyser || audio.paused || !dur()) { return; }
        analyser.getByteTimeDomainData(timeData);
        var sum = 0;
        for (var i = 0; i < timeData.length; i++) {
          var v = (timeData[i] - 128) / 128;
          sum += v * v;
        }
        var rms = Math.sqrt(sum / timeData.length);
        var b = Math.floor((audio.currentTime / dur()) * BUCKETS);
        if (b >= 0 && b < BUCKETS && rms > peaks[b]) { peaks[b] = rms; }
      }

      function loop() {
        rafId = 0;
        recordPeak();
        draw();
        if (!audio.paused && scrubOnScreen) { rafId = window.requestAnimationFrame(loop); }
      }

      function startLoop() {
        if (!rafId && scrubOnScreen) { rafId = window.requestAnimationFrame(loop); }
      }

      function stopLoop() {
        if (rafId) { window.cancelAnimationFrame(rafId); rafId = 0; }
      }

      function ratioFromEvent(e) {
        var r = scrub.getBoundingClientRect();
        return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      }

      function showBubble(ratio) {
        if (!bubble) { return; }
        var d = dur();
        var t = ratio * (d || 0);
        var label = parts.length ? ' · Parte ' + (partIndex(t) + 1) : '';
        bubble.hidden = false;
        bubble.textContent = fmt(t) + label;
        bubble.style.left = (ratio * 100) + '%';
      }

      function hideBubble() {
        if (bubble) { bubble.hidden = true; }
        if (cursor) { cursor.hidden = true; }
      }

      function showCursor(ratio) {
        if (!cursor) { return; }
        cursor.hidden = false;
        cursor.style.left = (ratio * 100) + '%';
      }

      scrub.addEventListener('pointerdown', function (e) {
        if (!dur()) { return; }
        dragging = true;
        if (scrub.setPointerCapture) { scrub.setPointerCapture(e.pointerId); }
        var r = ratioFromEvent(e);
        showBubble(r);
        showCursor(r);
        seek(r * dur());
      });
      scrub.addEventListener('pointermove', function (e) {
        if (!dur()) { return; }
        var r = ratioFromEvent(e);
        showBubble(r);
        showCursor(r);
        if (dragging) { seek(r * dur()); }
      });
      scrub.addEventListener('pointerup', function () {
        dragging = false;
        hideBubble();
      });
      scrub.addEventListener('pointercancel', function () {
        dragging = false;
        hideBubble();
      });
      scrub.addEventListener('pointerleave', function () {
        if (!dragging) { hideBubble(); }
      });

      scrub.addEventListener('keydown', function (e) {
        var d = dur();
        if (!d) { return; }
        var t = audio.currentTime || 0;
        switch (e.key) {
          case 'ArrowLeft': seek(t - 15); break;
          case 'ArrowRight': seek(t + 15); break;
          case 'ArrowUp':
            audio.volume = Math.min(1, audio.volume + 0.05);
            if (volEl) { volEl.value = String(audio.volume); }
            break;
          case 'ArrowDown':
            audio.volume = Math.max(0, audio.volume - 0.05);
            if (volEl) { volEl.value = String(audio.volume); }
            break;
          case 'Home': seek(0); break;
          case 'End': seek(d - 1); break;
          case ' ':
          case 'Spacebar': togglePlay(); break;
          default: return;
        }
        e.preventDefault();
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          scrubOnScreen = entries[0].isIntersecting;
          if (scrubOnScreen) { startLoop(); } else { stopLoop(); }
        }, { threshold: 0 }).observe(scrub);
      }

      /* ------------------------------------------------- eventos de audio */
      audio.addEventListener('loadedmetadata', buildParts);
      audio.addEventListener('durationchange', function () {
        if (parts.length) { buildParts(); }
      });

      audio.addEventListener('timeupdate', function () {
        updateAll();
        recordPeak();
        checkSleep();
        if (reduced && scrubOnScreen) { draw(); }
        var now = Date.now();
        if (now - lastSave > 5000) {
          lastSave = now;
          saveProgress();
        }
      });

      audio.addEventListener('play', function () {
        setPlayIcon(true);
        root.classList.add('is-playing');
        root.classList.remove('is-ended');
        if (repeatBtn) { repeatBtn.hidden = true; }
        root.classList.remove('is-error');
        updateStatus();
        if (!reduced) { startLoop(); }
        /* A partir de aquí el flotante tiene permiso para existir, y una
           reproducción nueva revoca cualquier cierre previo del usuario. */
        miniStarted = true;
        miniDismissed = false;
        updateMiniVisibility();
      });

      audio.addEventListener('pause', function () {
        setPlayIcon(false);
        root.classList.remove('is-playing');
        saveProgress();
        updateResumeChip();
        updateStatus();
        updateMiniVisibility();
      });

      audio.addEventListener('ended', function () {
        setPlayIcon(false);
        root.classList.remove('is-playing');
        root.classList.add('is-ended');
        if (repeatBtn) { repeatBtn.hidden = false; }
        saveProgress();
        updateStatus();
        updateMiniVisibility();
        stopLoop();
        draw();
      });

      /* La descarga del búfer cambia con el tiempo: repintar la banda */
      audio.addEventListener('progress', function () {
        if (!rafId) { draw(); }
      });

      audio.addEventListener('error', function () {
        root.classList.add('is-error');
        setStatus('No se pudo cargar el audio · pulsa reproducir para reintentar');
      });

      /* ------------------------------------------------- mini sticky bar
         Flotante con controles REALES, no un indicador decorativo:
         play/pausa, ±15 s, título (vuelve al player), riel de posición
         accionable (clic + arrastre + teclado) y cierre.
         Visibilidad: aparece solo después de la primera reproducción y
         mientras el player principal esté fuera de pantalla. A diferencia
         de la v1, se queda visible en PAUSA —retomar sin volver a #relatos
         es justo su razón de ser— y solo se retira si el usuario lo cierra
         o vuelve a la sección del player. */
      var miniTitle = epTitleEl ? epTitleEl.textContent.trim() : 'Relatos de la Montaña';
      var miniStarted = false;
      var miniDismissed = false;
      var miniDragging = false;

      var mini = document.createElement('div');
      mini.className = 'epline-mini';
      mini.setAttribute('role', 'group');
      mini.setAttribute('aria-label', 'Reproductor flotante de Relatos de la Montaña');
      mini.setAttribute('aria-hidden', 'true');
      mini.innerHTML =
        '<button type="button" class="epline-mini__play" aria-label="Reproducir episodio">' +
        '<svg aria-hidden="true"><use href="#i-play"></use></svg></button>' +
        '<button type="button" class="epline-mini__skip" data-mini-seek="-15" aria-label="Retroceder 15 segundos">' +
        '<span aria-hidden="true">&minus;15</span></button>' +
        '<button type="button" class="epline-mini__skip" data-mini-seek="15" aria-label="Adelantar 15 segundos">' +
        '<span aria-hidden="true">+15</span></button>' +
        '<button type="button" class="epline-mini__title"></button>' +
        '<span class="epline-mini__track" role="slider" tabindex="0" aria-label="Posición del episodio"' +
        ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0:00">' +
        '<span class="epline-mini__fill"></span></span>' +
        '<span class="epline-mini__time">0:00</span>' +
        '<button type="button" class="epline-mini__close" aria-label="Ocultar el reproductor flotante">' +
        '<svg aria-hidden="true"><use href="#i-close"></use></svg></button>';
      util.qs('.epline-mini__title', mini).textContent = miniTitle;
      document.body.appendChild(mini);

      var miniPlay = util.qs('.epline-mini__play', mini);
      var miniFill = util.qs('.epline-mini__fill', mini);
      var miniTime = util.qs('.epline-mini__time', mini);
      var miniTrack = util.qs('.epline-mini__track', mini);

      function miniToggle() {
        /* Tras el final, play() reinicia solo; seek(0) lo deja explícito */
        if (audio.ended) { seek(0); }
        togglePlay();
      }

      miniPlay.addEventListener('click', miniToggle);

      util.qsa('[data-mini-seek]', mini).forEach(function (btn) {
        var delta = parseFloat(btn.getAttribute('data-mini-seek')) || 0;
        btn.addEventListener('click', function () {
          seek((audio.currentTime || 0) + delta);
        });
      });

      util.qs('.epline-mini__title', mini).addEventListener('click', function () {
        root.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      });

      util.qs('.epline-mini__close', mini).addEventListener('click', function () {
        miniDismissed = true;
        updateMiniVisibility();
      });

      function miniRatio(e) {
        var r = miniTrack.getBoundingClientRect();
        if (!r.width) { return 0; }
        return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      }

      miniTrack.addEventListener('pointerdown', function (e) {
        if (!dur()) { return; }
        miniDragging = true;
        if (miniTrack.setPointerCapture) { miniTrack.setPointerCapture(e.pointerId); }
        seek(miniRatio(e) * dur());
      });

      miniTrack.addEventListener('pointermove', function (e) {
        if (!miniDragging || !dur()) { return; }
        seek(miniRatio(e) * dur());
      });

      function endMiniDrag() { miniDragging = false; }
      miniTrack.addEventListener('pointerup', endMiniDrag);
      miniTrack.addEventListener('pointercancel', endMiniDrag);

      miniTrack.addEventListener('keydown', function (e) {
        var d = dur();
        var t = audio.currentTime || 0;
        switch (e.key) {
          case 'ArrowLeft': seek(t - 15); break;
          case 'ArrowRight': seek(t + 15); break;
          case 'Home': seek(0); break;
          case 'End': if (d) { seek(d - 1); } break;
          case ' ':
          case 'Spacebar': miniToggle(); break;
          default: return;
        }
        e.preventDefault();
      });

      var rootInScreen = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          rootInScreen = entries[0].isIntersecting;
          updateMiniVisibility();
        }, { threshold: 0.1 }).observe(root);
      }

      function updateMiniVisibility() {
        var show = miniStarted && !rootInScreen && !miniDismissed;
        var playing = !audio.paused && !audio.ended;
        mini.classList.toggle('is-on', show);
        mini.classList.toggle('is-paused', !playing);
        mini.setAttribute('aria-hidden', show ? 'false' : 'true');
        var use = miniPlay.querySelector('use');
        if (use) { use.setAttribute('href', playing ? '#i-pause' : '#i-play'); }
        miniPlay.setAttribute('aria-label', playing ? 'Pausar episodio' : 'Reproducir episodio');
      }

      function updateMini(t, d) {
        if (miniFill) { miniFill.style.width = (d ? (t / d) * 100 : 0) + '%'; }
        if (miniTime) { miniTime.textContent = fmt(t); }
        if (miniTrack) {
          var pct = d ? Math.round((t / d) * 100) : 0;
          miniTrack.setAttribute('aria-valuenow', String(pct));
          miniTrack.setAttribute('aria-valuetext', fmt(t) + ' de ' + (d ? fmt(d) : '—:—'));
        }
      }

      /* ------------------------------------------------------- mediaSession */
      function updateMediaSession(title) {
        if (!('mediaSession' in navigator) || !window.MediaMetadata) { return; }
        try {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: title,
            artist: 'Mountain Brothers',
            album: 'Relatos de la Montaña'
          });
        } catch (e) {}
      }

      if ('mediaSession' in navigator && window.MediaMetadata) {
        updateMediaSession(miniTitle);
        try {
          navigator.mediaSession.setActionHandler('play', function () { if (audio.paused) { togglePlay(); } });
          navigator.mediaSession.setActionHandler('pause', function () { if (!audio.paused) { audio.pause(); } });
          navigator.mediaSession.setActionHandler('seekbackward', function () { seek((audio.currentTime || 0) - 15); });
          navigator.mediaSession.setActionHandler('seekforward', function () { seek((audio.currentTime || 0) + 15); });
        } catch (e) {}
      }

      /* ----------------------------------------------------------- arranque */
      if (dlEl && MB.config.audios && MB.config.audios[currentEp]) {
        dlEl.setAttribute('href', MB.config.audios[currentEp]);
      }
      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('beforeunload', saveProgress);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { saveProgress(); }
      });

      if (audio.readyState >= 1) { buildParts(); }
      resizeCanvas();
      updateAll();
      setPlayIcon(false);
    }
  };
})(window.MB = window.MB || {});
