/* АКБ ДОМ · DIAGNOSTIC TERMINAL JS */
(function () {
  'use strict';
  try{ if(sessionStorage.getItem('akb_booted')){ var _b=document.getElementById('boot'); if(_b){_b.classList.add('done'); _b.style.display='none';} } else { sessionStorage.setItem('akb_booted','1'); } }catch(e){}

  // ════════════════════════════════════════════
  // BOOT SCREEN
  // ════════════════════════════════════════════
  var boot = document.getElementById('boot');
  if (boot) {
    setTimeout(function () { boot.classList.add('hide'); }, 1600);
  }

  // ════════════════════════════════════════════
  // YEAR + DATE STAMP
  // ════════════════════════════════════════════
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var dateStamp = document.getElementById('datestamp');
  if (dateStamp) dateStamp.textContent = new Date().toISOString().slice(0,10).replace(/-/g,'');

  // ════════════════════════════════════════════
  // LIVE CLOCK (ALMATY)
  // ════════════════════════════════════════════
  var clockEl = document.getElementById('local-time');
  function updateClock() {
    if (!clockEl) return;
    var d = new Date();
    var utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
    var ala = new Date(utcMs + 5 * 3600 * 1000);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    clockEl.textContent = pad(ala.getHours()) + ':' + pad(ala.getMinutes()) + ':' + pad(ala.getSeconds()) + ' ALA';
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ════════════════════════════════════════════
  // SOUND ENGINE (Web Audio)
  // ════════════════════════════════════════════
  var audioCtx = null;
  var soundsEnabled = false;
  function getAudio() {
    if (!audioCtx && typeof AudioContext !== 'undefined') {
      try { audioCtx = new AudioContext(); soundsEnabled = true; } catch (e) {}
    }
    return audioCtx;
  }
  function playClick() {
    var ctx = getAudio();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.type = 'square';
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }
  function playSelect() {
    var ctx = getAudio();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.type = 'triangle';
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
  function playIgnite() {
    var ctx = getAudio();
    if (!ctx) return;
    // Rising synth + noise burst — engine start vibe
    var osc1 = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var gain = ctx.createGain();
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.4);
    osc2.frequency.setValueAtTime(120, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.45);
    osc2.stop(ctx.currentTime + 0.45);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-sound]');
    if (!el) return;
    var s = el.getAttribute('data-sound');
    if (s === 'click') playClick();
    else if (s === 'select') playSelect();
    else if (s === 'ignite') playIgnite();
  });

  // ════════════════════════════════════════════
  // CUSTOM CURSOR
  // ════════════════════════════════════════════
  var cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .diag-opt, .term-opt, .bbox, .shop-frame, .contact-card, summary, input[type="range"], .region-tags span').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('hover'); });
    });
  }

  // ════════════════════════════════════════════
  // SMOOTH SCROLL + IGNITE BUTTON
  // ════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  var igniteBtn = document.getElementById('ignite-btn');
  if (igniteBtn) {
    igniteBtn.addEventListener('click', function () {
      var t = document.querySelector('#diag');
      if (!t) return;
      var top = t.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  // ════════════════════════════════════════════
  // OSCILLOSCOPE — animated voltage wave
  // ════════════════════════════════════════════
  var oscPath = document.getElementById('osc-wave');
  var oscDot = document.getElementById('osc-dot');
  if (oscPath) {
    var phase = 0;
    function drawOsc() {
      var width = 400;
      var height = 160;
      var mid = height / 2;
      var pts = [];
      for (var x = 0; x <= width; x += 4) {
        var t = (x / width) * Math.PI * 4 + phase;
        var y = mid + Math.sin(t) * 30 + Math.sin(t * 2.3) * 8 + Math.sin(t * 4.7) * 4;
        pts.push((x === 0 ? 'M' : 'L') + x + ' ' + y.toFixed(1));
      }
      oscPath.setAttribute('d', pts.join(' '));
      if (oscDot) {
        var lastY = mid + Math.sin(phase + Math.PI * 4) * 30 + Math.sin((phase + Math.PI * 4) * 2.3) * 8;
        oscDot.setAttribute('cx', width);
        oscDot.setAttribute('cy', lastY.toFixed(1));
      }
      phase += 0.08;
      requestAnimationFrame(drawOsc);
    }
    drawOsc();
  }

  // Subtle metric fluctuation
  var mV = document.getElementById('m-voltage');
  var mC = document.getElementById('m-cca');
  setInterval(function () {
    if (mV) mV.textContent = (12.6 + Math.random() * 0.4).toFixed(1);
    if (mC) mC.textContent = Math.floor(530 + Math.random() * 20);
  }, 1500);

  // ════════════════════════════════════════════
  // COUNTERS — animated count up
  // ════════════════════════════════════════════
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.floor(target * eased);
      el.firstChild.nodeValue = String(v).padStart(String(target).length, '0') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  }

  // ════════════════════════════════════════════
  // DIAGNOSTIC WIZARD
  // ════════════════════════════════════════════
  var diagSteps = document.querySelectorAll('.diag-step');
  var diagScreens = document.querySelectorAll('.diag-screen');
  var diagBars = document.querySelectorAll('.diag-bar-fill');
  function showStep(n) {
    diagScreens.forEach(function (s) { s.classList.remove('active'); });
    diagSteps.forEach(function (s, i) {
      if (i < n) s.classList.add('active');
      else s.classList.remove('active');
    });
    diagBars.forEach(function (b, i) {
      if (i < n - 1) b.classList.add('fill');
      else b.classList.remove('fill');
    });
    var target = document.querySelector('.diag-screen[data-screen="' + n + '"]');
    if (target) target.classList.add('active');
  }

  document.querySelectorAll('.diag-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      var next = parseInt(opt.getAttribute('data-next'), 10);
      if (next) showStep(next);
    });
  });

  var restartBtn = document.getElementById('restart-diag');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      showStep(1);
    });
  }

  // ════════════════════════════════════════════
  // REVEAL ON SCROLL
  // ════════════════════════════════════════════
  var revealEls = document.querySelectorAll(
    '.sec-head, .dash, .hero-claim, .diag, .bstack-row, .cold-panel, .region-map, .region-list, .terminal, .shop-frame, .starter, .contact-card, .map-wrap'
  );
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  // also observe elements that already carry .reveal in the markup (e.g. .why-item)
  var allRevealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    allRevealEls.forEach(function (el) { revIo.observe(el); });
  } else {
    allRevealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // ════════════════════════════════════════════
  // LIGHTBOX
  // ════════════════════════════════════════════
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-caption');
  var btnClose = document.querySelector('.lb-close');
  var btnPrev = document.querySelector('.lb-prev');
  var btnNext = document.querySelector('.lb-next');
  var galLinks = Array.from(document.querySelectorAll('[data-lightbox]'));
  var lbIdx = 0;
  function openLb(i) {
    if (!lb || !galLinks.length) return;
    lbIdx = i;
    var a = galLinks[i];
    var img = a.querySelector('img');
    lbImg.src = a.getAttribute('href') || (img ? img.src : '');
    lbImg.alt = img ? (img.alt || '') : '';
    var tag = a.querySelector('.frame-name');
    if (lbCap) lbCap.textContent = tag ? tag.textContent : (img ? img.alt : '');
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  function nextLb(d) { openLb((lbIdx + d + galLinks.length) % galLinks.length); }
  galLinks.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); openLb(i); });
  });
  if (btnClose) btnClose.addEventListener('click', closeLb);
  if (btnPrev) btnPrev.addEventListener('click', function () { nextLb(-1); });
  if (btnNext) btnNext.addEventListener('click', function () { nextLb(1); });
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') nextLb(1);
    if (e.key === 'ArrowLeft') nextLb(-1);
  });

  // ════════════════════════════════════════════
  // CHAT DIALOG — выбор → ответ бота → WhatsApp
  // ════════════════════════════════════════════
  var chatBody = document.getElementById('terminal-body');
  if (chatBody) {
    var WA_BASE = 'https://wa.me/77002900503?text=';
    var SCN = {
      podbor: {
        user: 'Подобрать АКБ под мою машину',
        bot: 'Отлично! Подберу за пару минут — нужны марка, модель и год авто (или данные со старого аккумулятора). Учту ёмкость, пусковой ток и полярность.',
        wa: 'Здравствуйте! Хочу подобрать аккумулятор. Моя машина (марка, модель, год): '
      },
      nezavod: {
        user: 'Машина перестала заводиться',
        bot: 'Похоже на аккумулятор. Если стартер крутит вяло или щёлкает, а фары тускнеют — батарея села. Бесплатно проверим напряжение и пусковой ток и при необходимости подберём замену на месте.',
        wa: 'Здравствуйте! Машина перестала заводиться — нужна помощь по аккумулятору.'
      },
      zima: {
        user: 'Готовлюсь к зиме / морозам',
        bot: 'Правильно! В мороз двигателю нужно больше пускового тока (CCA). Подберу модель с запасом именно под вашу машину — заведётесь даже в −40.',
        wa: 'Здравствуйте! Готовлюсь к зиме, нужен надёжный аккумулятор. Моя машина: '
      },
      truck: {
        user: 'Нужен на грузовой / спецтехнику',
        bot: 'Есть грузовые и тяговые: ZION 190 А·ч, BARS Truck и другие. Напишите тип техники (КамАЗ, МТЗ, автобус…) — подберу по пусковому току и ёмкости.',
        wa: 'Здравствуйте! Нужен аккумулятор на грузовой/спецтехнику. Тип техники: '
      },
      other: {
        user: 'Другое — задать свой вопрос',
        bot: 'Конечно! Опишите вопрос — отвечу за пару минут и подскажу по наличию и цене.',
        wa: 'Здравствуйте! У меня вопрос по аккумуляторам: '
      }
    };
    var chatInitial = chatBody.innerHTML;
    function chatEsc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function chatMsg(role, text) {
      var d = document.createElement('div');
      d.className = 'term-msg ' + (role === 'user' ? 'term-user' : 'term-bot');
      var prompt = role === 'user' ? 'ВЫ&gt;' : 'АКБ&nbsp;ДОМ&gt;';
      d.innerHTML = '<span class="term-prompt mono">' + prompt + '</span><span class="term-text">' + chatEsc(text) + '</span>';
      chatBody.appendChild(d);
      return d;
    }
    function chatPick(key) {
      var sc = SCN[key];
      if (!sc) return;
      var opts = document.getElementById('term-options');
      if (opts) opts.remove();
      chatMsg('user', sc.user);
      var typing = document.createElement('div');
      typing.className = 'term-msg term-bot';
      typing.innerHTML = '<span class="term-prompt mono">АКБ&nbsp;ДОМ&gt;</span><span class="term-typing"><span></span><span></span><span></span></span>';
      chatBody.appendChild(typing);
      setTimeout(function () {
        typing.remove();
        chatMsg('bot', sc.bot);
        setTimeout(function () {
          var wrap = document.createElement('div');
          wrap.className = 'term-options';
          wrap.innerHTML =
            '<a class="term-opt term-opt-wa wa-pulse" href="' + WA_BASE + encodeURIComponent(sc.wa) + '" target="_blank" rel="noopener" data-sound="click">' +
              '<span class="opt-key mono">WA</span><span>Продолжить в WhatsApp</span><svg width="16" height="16"><use href="#wa"/></svg>' +
            '</a>' +
            '<button type="button" class="term-opt" data-restart data-sound="click">' +
              '<span class="opt-key mono">↺</span><span>Задать другой вопрос</span>' +
            '</button>';
          chatBody.appendChild(wrap);
        }, 520);
      }, 1050);
    }
    chatBody.addEventListener('click', function (e) {
      var o = e.target.closest('[data-scenario]');
      if (o) { chatPick(o.getAttribute('data-scenario')); return; }
      var r = e.target.closest('[data-restart]');
      if (r) { chatBody.innerHTML = chatInitial; }
    });
  }
})();
