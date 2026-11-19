/* Guia de Interfaces Financeiras — interações progressivas (o conteúdo funciona sem JavaScript). */
(function () {
  'use strict';

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} }
  };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = $('.top'), topbar = $('.topbar'), nav = $('#menu'), menuBtn = $('.menu-btn');

  /* ---------- Menu: compacto quando não cabe (inclusive com texto ampliado) ---------- */
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    $('use', menuBtn).setAttribute('href', open ? '#i-close' : '#i-menu');
    $('.lbl', menuBtn).textContent = open ? 'Fechar' : 'Menu';
  }
  function overflowing() {
    var ul = $('ul', nav), first = $('li', ul);
    var wrapped = first && ul.offsetHeight > first.offsetHeight * 1.5;
    return wrapped || topbar.scrollWidth > topbar.clientWidth + 1;
  }
  function fitNav() {
    if (nav.classList.contains('open')) setMenu(false);
    header.classList.remove('is-compact', 'is-tiny');
    if (overflowing()) header.classList.add('is-compact');
    var name = $('.brand-name b');
    if (header.classList.contains('is-compact') && (topbar.scrollWidth > topbar.clientWidth + 1 || name.scrollWidth > name.clientWidth + 1)) header.classList.add('is-tiny');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a') && header.classList.contains('is-compact')) setMenu(false); });

  /* ---------- Tamanho do texto ---------- */
  var tsBtn = $('#ts-btn'), tsPanel = $('#ts-panel'), sizeBtns = $$('[data-scale]');
  function setPanel(open) {
    tsPanel.hidden = !open;
    tsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function applyScale(s) {
    document.documentElement.style.setProperty('--scale', s);
    sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-scale') === String(s) ? 'true' : 'false'); });
    window.requestAnimationFrame(function () { fitNav(); fitChecklistBar(); });
  }
  var savedScale = store.get('dss-scale');
  if (savedScale === '1' || savedScale === '1.15' || savedScale === '1.3') applyScale(savedScale);
  tsBtn.addEventListener('click', function () { setPanel(tsPanel.hidden); if (!tsPanel.hidden) { var on = $('[aria-pressed="true"]', tsPanel); if (on) on.focus(); } });
  sizeBtns.forEach(function (b) {
    b.addEventListener('click', function () { var s = b.getAttribute('data-scale'); applyScale(s); store.set('dss-scale', s); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!tsPanel.hidden) { setPanel(false); tsBtn.focus(); }
    else if (nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (!tsPanel.hidden && !e.target.closest('.textsize')) setPanel(false);
    if (nav.classList.contains('open') && !e.target.closest('.top')) setMenu(false);
  });

  /* ---------- Progresso de leitura, voltar ao topo ---------- */
  var bar = $('.read-progress'), toTop = $('.to-top'), ticking = false;
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    toTop.classList.toggle('show', h.scrollTop > 900);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    $('#conteudo').focus({ preventScroll: true });
  });

  /* ---------- Seção atual no menu ---------- */
  var navLinks = $$('.primary a[href^="#"]');
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Filtro de diretrizes ---------- */
  var filterBtns = $$('[data-filter]'), groups = $$('.dgroup[data-group]'), status = $('#filter-status');
  var groupNames = { a: 'Percepção', b: 'Compreensão', c: 'Ação e controle', d: 'Proteção antifraude' };
  function setFilter(f) {
    var shown = 0;
    groups.forEach(function (g) {
      var on = f === 'all' || g.getAttribute('data-group') === f;
      g.hidden = !on;
      if (on) shown += $$('.dcard', g).length;
    });
    filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === f ? 'true' : 'false'); });
    status.textContent = f === 'all' ? 'Mostrando as 16 diretrizes.' : 'Mostrando ' + shown + ' diretrizes do grupo ' + groupNames[f] + '.';
  }
  filterBtns.forEach(function (b) { b.addEventListener('click', function () { setFilter(b.getAttribute('data-filter')); }); });

  /* ---------- Rastreabilidade inversa: diretriz → vetores ---------- */
  var mitigates = {};
  $$('.scam').forEach(function (card) {
    $$('.xref a[href^="#D"]', card).forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      (mitigates[id] = mitigates[id] || []).push({ name: card.getAttribute('data-golpe'), code: card.getAttribute('data-code'), id: card.id });
    });
  });
  Object.keys(mitigates).forEach(function (id) {
    var card = document.getElementById(id);
    if (!card) return;
    var box = document.createElement('div'); box.className = 'mitiga';
    var p = document.createElement('p'); p.className = 'xref-label'; p.textContent = 'Vetores de fraude que mitiga';
    var ul = document.createElement('ul'); ul.className = 'xref';
    mitigates[id].forEach(function (g) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + g.id;
      a.innerHTML = '<span class="xc"></span><span class="xn"></span><span class="xa" aria-hidden="true">→</span>';
      a.children[0].textContent = g.code; a.children[1].textContent = g.name;
      li.appendChild(a); ul.appendChild(li);
    });
    box.appendChild(p); box.appendChild(ul); card.appendChild(box);
  });

  /* ---------- Destaque ao navegar para uma diretriz ou vetor ---------- */
  function reveal(hash) {
    if (!hash || hash.length < 2) return;
    var el; try { el = document.querySelector(hash); } catch (e) { return; }
    if (!el) return;
    var grp = el.closest('.dgroup');
    if (grp && grp.hidden) setFilter('all');
    if (el.classList.contains('dcard') || el.classList.contains('scam')) {
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      window.setTimeout(function () { el.classList.remove('flash'); }, 2200);
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#D"], a[href^="#golpe-"]');
    if (a) reveal(a.getAttribute('href'));
  });
  window.addEventListener('hashchange', function () { reveal(location.hash); });
  if (location.hash) reveal(location.hash);

  /* ---------- Antes / depois quando não cabem lado a lado ---------- */
  $$('[data-compare]').forEach(function (block) {
    var btns = $$('[data-show]', block), panels = $$('[data-panel]', block);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var show = b.getAttribute('data-show');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === show); });
      });
    });
  });

  /* ---------- Demonstração: interrupção contextual (padrão 4) ---------- */
  $$('[data-demo="interrupt"]').forEach(function (demo) {
    var ask = $('[data-step="ask"]', demo), yes = $('[data-step="sim"]', demo), no = $('[data-step="nao"]', demo),
        reset = $('.demo-reset', demo), hint = $('.demo-hint', demo);
    $$('[data-answer]', demo).forEach(function (b) {
      b.addEventListener('click', function () {
        var ans = b.getAttribute('data-answer');
        ask.hidden = true; hint.hidden = true;
        yes.hidden = ans !== 'sim'; no.hidden = ans !== 'nao';
        reset.hidden = false; reset.focus();
      });
    });
    reset.addEventListener('click', function () {
      ask.hidden = false; hint.hidden = false; yes.hidden = true; no.hidden = true; reset.hidden = true;
      $('[data-answer]', demo).focus();
    });
  });

  /* ---------- Checklist: Sim / Não / N/A ---------- */
  var items = $$('.cl-item'), total = items.length, details = $$('.cl-group'), clBar = $('.cl-bar');
  function stateOf(item) { var c = $('input:checked', item); return c ? c.value : ''; }
  function updateChecklist() {
    var n = { sim: 0, nao: 0, na: 0 };
    items.forEach(function (it) { var s = stateOf(it); if (s) n[s]++; it.setAttribute('data-state', s); });
    var pend = total - n.sim - n.nao - n.na, applicable = total - n.na;
    var pct = applicable > 0 ? Math.round(100 * n.sim / applicable) : 0;
    $('#pct').textContent = pct + '%';
    $('#pcount').textContent = n.sim + ' de ' + applicable + ' itens aplicáveis atendidos';
    $('#c-sim').textContent = n.sim; $('#c-nao').textContent = n.nao; $('#c-na').textContent = n.na; $('#c-pend').textContent = pend;
    $('.p-sim').style.width = (100 * n.sim / total) + '%';
    $('.p-nao').style.width = (100 * n.nao / total) + '%';
    $('.p-na').style.width = (100 * n.na / total) + '%';
    details.forEach(function (d) {
      var its = $$('.cl-item', d), done = its.filter(function (i) { return stateOf(i); }).length;
      $('.count', d).textContent = done + '/' + its.length;
    });
  }
  items.forEach(function (it) {
    var key = it.getAttribute('data-key'), saved = store.get('dss-' + key);
    if (saved === '1') saved = 'sim';
    if (saved) { var r = $('input[value="' + saved + '"]', it); if (r) r.checked = true; }
    $$('input', it).forEach(function (r) {
      r.addEventListener('change', function () { store.set('dss-' + key, r.value); updateChecklist(); });
    });
  });
  var toggleBtn = $('#ck-toggle');
  function syncToggle() { toggleBtn.textContent = details.every(function (d) { return d.open; }) ? 'Recolher todos' : 'Expandir todos'; }
  toggleBtn.addEventListener('click', function () {
    var allOpen = details.every(function (d) { return d.open; });
    details.forEach(function (d) { d.open = !allOpen; });
    syncToggle();
  });
  details.forEach(function (d) { d.addEventListener('toggle', syncToggle); });
  syncToggle();
  $('#ck-reset').addEventListener('click', function () {
    if (items.some(function (i) { return stateOf(i); }) && !window.confirm('Limpar todas as respostas do checklist?')) return;
    items.forEach(function (it) { $$('input', it).forEach(function (r) { r.checked = false; }); store.del('dss-' + it.getAttribute('data-key')); });
    updateChecklist();
  });
  $('#ck-print').addEventListener('click', function () { details.forEach(function (d) { d.open = true; }); syncToggle(); window.print(); });
  updateChecklist();
  // a barra de progresso só fica fixa se ocupar pouco da tela
  function fitChecklistBar() {
    clBar.classList.remove('can-stick');
    if (clBar.offsetHeight < window.innerHeight * 0.28) clBar.classList.add('can-stick');
  }

  /* ---------- Busca nas referências ---------- */
  var refInput = $('#ref-search'), refs = $$('#refs li'), empty = $('#refs-empty');
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var refText = refs.map(function (li) { return norm(li.textContent); });
  refInput.addEventListener('input', function () {
    var q = norm(refInput.value.trim()), shown = 0;
    refs.forEach(function (li, i) { var on = !q || refText[i].indexOf(q) !== -1; li.hidden = !on; if (on) shown++; });
    empty.hidden = shown !== 0;
  });

  /* ---------- Reajustes de layout ---------- */
  var rt;
  function refit() { fitNav(); fitChecklistBar(); }
  window.addEventListener('resize', function () { window.clearTimeout(rt); rt = window.setTimeout(refit, 80); });
  refit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
})();
