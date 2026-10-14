/* Soldi — pointer parallax, Astana clock, visit builder with live total */
(() => {
  'use strict';
  const M = window.Motion || { $: (s, r = document) => r.querySelector(s), $$: (s, r = document) => Array.from(r.querySelectorAll(s)), motion: false, fine: false, reduce: true, ready: (f) => f(), toast() {} };
  const { $, $$ } = M;
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* Hero parallax */
  const hv = $('#hv');
  if (hv && M.fine && M.motion) {
    const layers = $$('.hv', hv);
    hv.closest('.hero').addEventListener('pointermove', (e) => {
      const b = hv.getBoundingClientRect();
      const x = (e.clientX - (b.left + b.width / 2)) / b.width, y = (e.clientY - (b.top + b.height / 2)) / b.height;
      layers.forEach((l) => { const d = +l.dataset.depth || 10; l.style.transform = 'translate(' + (x * d * -1.4).toFixed(1) + 'px,' + (y * d * -1.4).toFixed(1) + 'px)'; });
    });
  }

  /* Astana clock */
  const clk = $('#clock'), cs = $('#clock-s');
  if (clk) {
    const tick = () => {
      const d = new Date(Date.now() + 5 * 3600e3);
      clk.textContent = String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
      if (cs) cs.textContent = 'главный салон открыт';
    };
    tick(); setInterval(tick, 20000);
  }

  /* Tabs */
  const tabs = $$('.tab');
  const lists = $$('[data-p]').filter((el) => el.classList.contains('mlist'));
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
    lists.forEach((l) => { l.hidden = l.dataset.p !== t.dataset.t; });
    M.refresh && M.refresh();
  }));

  /* Visit builder */
  const cartL = $('#cart-l'), sumEl = $('#sum'), waBtn = $('#cart-wa'), what = $('#book-what'), bf = $('#book-form');
  if (cartL && sumEl) {
    const sel = new Map();
    let shown = 0, raf = 0;
    const anim = (to) => {
      cancelAnimationFrame(raf);
      if (!M.motion) { shown = to; sumEl.textContent = fmt(to); return; }
      const from = shown, t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 500), e = 1 - Math.pow(1 - k, 3);
        shown = from + (to - from) * e; sumEl.textContent = fmt(shown);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const render = () => {
      const total = [...sel.values()].reduce((s, v) => s + v, 0);
      cartL.innerHTML = '';
      if (!sel.size) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Пока пусто. Выберите услуги слева.'; cartL.appendChild(li); }
      sel.forEach((p, n) => {
        const li = document.createElement('li');
        const b = document.createElement('b'); b.textContent = n;
        const s = document.createElement('span'); s.textContent = fmt(p) + ' ₸';
        li.append(b, s); cartL.appendChild(li);
      });
      anim(total);
      const names = [...sel.keys()];
      const msg = 'Здравствуйте! Хочу записаться в Soldi.' + (names.length ? '\nУслуги:\n' + [...sel.entries()].map(([n, p]) => '– ' + n + ' (' + fmt(p) + ' ₸)').join('\n') + '\nПо прайсу на сайте: ' + fmt(total) + ' ₸.' : '');
      waBtn.href = 'https://wa.me/77754137232?text=' + encodeURIComponent(msg);
      if (what) what.value = names.join(', ');
      cartL.dataset.n = names.length;
    };
    $$('.mi-b').forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (on) sel.set(b.dataset.n, +b.dataset.p); else sel.delete(b.dataset.n);
      render();
    }));
    if (bf) bf.waExtra = () => (sel.size ? 'Сумма по прайсу на сайте: ' + fmt([...sel.values()].reduce((s, v) => s + v, 0)) + ' ₸' : '');
    render();
  }
})();
