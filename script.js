(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* Revelação suave ao rolar */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* Contadores */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      if (reduce) return;
      const el = e.target, end = +el.dataset.count, dur = 1400, t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* Navegação */
  const nav = $('#nav'), toggle = $('#navToggle');
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });

  const links = $$('#navLinks a');
  const secIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => secIO.observe(s));

  /* Botão flutuante (celular): aparece após o topo e some na seção de contato */
  const fab = $('#fab'), hero = $('#inicio'), contact = $('#contato');
  let pastHero = false, atContact = false;
  const updFab = () => fab && fab.classList.toggle('is-visible', pastHero && !atContact);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; updFab(); }, { threshold: 0.15 }).observe(hero);
  new IntersectionObserver(([e]) => { atContact = e.isIntersecting; updFab(); }, { threshold: 0.1 }).observe(contact);

  /* Rolagem: barra de progresso, nav, linhas do método e da trajetória */
  const progress = $('#progress'), steps = $('#steps'), timeline = $('#timeline');
  const stepItems = steps ? $$('.step', steps) : [];
  const ratio = (el, startAt, span) => {
    const r = el.getBoundingClientRect(), vh = innerHeight;
    return Math.min(1, Math.max(0, (vh * startAt - r.top) / (r.height * span || 1)));
  };
  let ticking = false;
  const onScroll = () => {
    const sy = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? sy / h : 0})`;
    nav.classList.toggle('is-scrolled', sy > 12);
    if (steps) {
      const p = ratio(steps, 0.8, 1);
      steps.style.setProperty('--p', p.toFixed(3));
      stepItems.forEach((s, i) => s.classList.toggle('is-on', p >= i / stepItems.length + 0.02 || p === 1));
    }
    if (timeline) timeline.style.setProperty('--p', ratio(timeline, 0.7, 1).toFixed(3));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Citações: alternância automática com controle manual */
  const quotes = $$('#quotes .quote'), dots = $$('.quotes__nav button');
  let qi = 0, timer;
  const show = i => {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => { q.classList.toggle('is-active', k === qi); q.setAttribute('aria-hidden', k !== qi); });
    dots.forEach((d, k) => d.setAttribute('aria-selected', k === qi));
  };
  const play = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => show(qi + 1), 7000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { show(k); play(); }));
  const qWrap = $('#ideias');
  if (qWrap) { qWrap.addEventListener('mouseenter', () => clearInterval(timer)); qWrap.addEventListener('mouseleave', play); qWrap.addEventListener('focusin', () => clearInterval(timer)); }
  show(0); play();

  /* Copiar contato */
  const toast = $('#toast'); let tt;
  const say = msg => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 2000); };
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const v = b.dataset.copy;
    try { await navigator.clipboard.writeText(v); }
    catch { const t = document.createElement('textarea'); t.value = v; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    const old = b.textContent; b.textContent = 'Copiado'; setTimeout(() => b.textContent = old, 1600);
    say(`${v} copiado`);
  }));

  /* Retrato: leve profundidade ao mover o mouse */
  const portrait = $('#portrait');
  if (portrait && !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const frame = $('.portrait__frame', portrait);
    portrait.addEventListener('mousemove', e => {
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, yy = (e.clientY - r.top) / r.height - .5;
      frame.style.transform = `translate(${x * 14}px, ${yy * 14}px)`;
    });
    portrait.addEventListener('mouseleave', () => { frame.style.transform = ''; });
  }
})();
