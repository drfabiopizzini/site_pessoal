(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Preloader ---------- */
  document.body.classList.add('is-loading');
  const finishLoad = () => {
    const l = $('#loader');
    if (!l || l.classList.contains('is-done')) return;
    l.classList.add('is-done');
    document.body.classList.remove('is-loading');
    $$('.hero .reveal, .hero .split').forEach(el => el.classList.add('is-in'));
  };
  window.addEventListener('load', () => setTimeout(finishLoad, reduce ? 0 : 1300));
  setTimeout(finishLoad, 3500); // segurança

  /* ---------- Ano ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Split de palavras no título ---------- */
  $$('[data-split]').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .step').forEach(el => { if (!el.closest('.hero')) io.observe(el); });

  /* ---------- Contadores ---------- */
  const fmt = n => n.toLocaleString('pt-BR');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, dur = reduce ? 0 : 1800, t0 = performance.now();
      const tick = t => {
        const p = dur ? Math.min(1, (t - t0) / dur) : 1;
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Rotator (texto digitado) ---------- */
  const rot = $('#rotator');
  if (rot) {
    const words = ['nexo causal', 'perícia médica trabalhista', 'ergonomia e biomecânica', 'redução de passivo trabalhista', 'gestão previdenciária e NTEP', 'contestação de laudos'];
    if (reduce) { rot.textContent = words[0]; }
    else {
      let wi = 0, ci = words[0].length, del = false;
      const step = () => {
        const w = words[wi];
        if (!del) {
          ci++; rot.textContent = w.slice(0, ci);
          if (ci >= w.length) { del = true; return setTimeout(step, 2200); }
          return setTimeout(step, 55);
        }
        ci--; rot.textContent = w.slice(0, ci);
        if (ci <= 0) { del = false; wi = (wi + 1) % words.length; return setTimeout(step, 260); }
        setTimeout(step, 28);
      };
      setTimeout(() => { del = true; step(); }, 3600);
    }
  }

  /* ---------- Navegação ---------- */
  const nav = $('#nav'), toggle = $('#navToggle');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));
  const sections = $$('main section[id]');
  const links = $$('#navLinks a');
  const secIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => secIO.observe(s));

  /* ---------- Scroll: progresso, nav, timeline, steps, parallax ---------- */
  const progress = $('#progress'), fill = $('#timelineFill'), timeline = $('#timeline'), steps = $('#steps'), mark = $('.hero__watermark');
  let ticking = false;
  const onScroll = () => {
    const sy = window.scrollY, vh = window.innerHeight, h = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${h > 0 ? sy / h : 0})`;
    nav.classList.toggle('is-scrolled', sy > 40);
    if (timeline && fill) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      fill.style.transform = `scaleY(${p})`;
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      steps.style.setProperty('--p', p.toFixed(3));
    }
    if (mark && !reduce && sy < vh * 1.2) mark.style.translate = `0 ${sy * 0.25}px`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Marquee: duplica trilhas ---------- */
  $$('.marquee').forEach(m => {
    const t = $('.marquee__track', m);
    const c = t.cloneNode(true); c.setAttribute('aria-hidden', 'true'); m.appendChild(c);
  });

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Cursor glow ---------- */
  const glow = $('#cursorGlow');
  if (fine && !reduce && glow) {
    let gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', () => glow.classList.remove('is-on'));
    const loop = () => { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = `translate(${gx - 210}px, ${gy - 210}px)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------- Botões magnéticos ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(b => {
      const strength = b.classList.contains('btn') ? 0.3 : 0.06;
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transition = 'transform .5s cubic-bezier(.22,.8,.24,1)'; b.style.transform = ''; setTimeout(() => b.style.transition = '', 500); });
    });

    /* ---------- Tilt 3D nos cards ---------- */
    $$('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
      });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; });
    });
  }

  /* ---------- Canvas: rede neural / constelação ---------- */
  const cv = $('#heroCanvas');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let W, H, pts = [], dpr = Math.min(window.devicePixelRatio || 1, 2), mouse = { x: -9999, y: -9999 }, raf, visible = true;
    const resize = () => {
      const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (W * H) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .32, vy: (Math.random() - .5) * .32, r: Math.random() * 1.6 + .6 }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const max = 140;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.hypot(dxm, dym);
        if (dm < 160) { p.x += dxm / dm * .8; p.y += dym / dm * .8; }
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < max) {
            ctx.strokeStyle = `rgba(113,174,175,${(1 - d / max) * .35})`;
            ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(196,229,232,.75)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = visible ? requestAnimationFrame(draw) : null;
    };
    resize(); draw();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    cv.parentElement.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) draw(); }).observe(cv);
  }
})();
