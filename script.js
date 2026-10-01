(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 900px)');
  const header = document.querySelector('.topbar');
  const menu = document.getElementById('primary-menu');
  const toggle = document.querySelector('.menu-toggle');

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menu && toggle) {
    const setMenu = (open, restoreFocus = false) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
      toggle.textContent = open ? '×' : '☰';
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
      if (restoreFocus) toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
    document.addEventListener('focusin', event => {
      if (!header.contains(event.target)) setMenu(false);
    });
    mobile.addEventListener('change', () => setMenu(false));
  }

  if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.section-head, .course-card, .about-card, .physics-feature, .policy, .contact-panel').forEach(item => {
      item.classList.add('reveal');
      observer.observe(item);
    });
    motion.addEventListener('change', () => {
      if (motion.matches) {
        document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
        observer.disconnect();
      }
    });
  }

  const cards = [...document.querySelectorAll('.course-card')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let count = 0;
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) { count++; card.classList.add('is-visible'); }
    });
    const status = document.querySelector('.course-count');
    if (status) status.textContent = `${count} chương trình học`;
  }));

  const courses = {
    'vat-li-10': ['Vật Lí 10', '400.000đ / tháng'],
    'vat-li-11': ['Vật Lí 11', '400.000đ / tháng'],
    'vat-li-12': ['Vật Lí 12', '400.000đ / tháng'],
    'hsg-8-9': ['HSG Vật Lí 8–9', '600.000đ / tháng'],
    'hsg-10': ['HSG Vật Lí 10 cấp tỉnh', '600.000đ / tháng'],
    'doi-tuyen': ['Định hướng đội tuyển', '600.000đ / tháng']
  };
  const courseHeading = document.getElementById('selected-course');
  if (courseHeading) {
    const key = new URLSearchParams(location.search).get('khoa');
    const selection = Object.prototype.hasOwnProperty.call(courses, key) ? courses[key] : null;
    if (selection) {
      courseHeading.textContent = selection[0];
      document.title = `${selection[0]} Course Roadmap | Physics with Thay Co`;
      const price = document.getElementById('selected-course-price');
      price.hidden = false;
      price.textContent = `Học phí: ${selection[1]} · Học thử 2 buổi đầu`;
    }
  }

  const amplitude = document.getElementById('amplitude');
  const frequency = document.getElementById('frequency');
  const wave = document.querySelector('.wave-trace');
  const point = document.querySelector('.wave-point');
  if (amplitude && frequency && wave && point) {
    const yAt = x => 68 - 36 * Number(amplitude.value) * Math.sin((x - 32) / 268 * Math.PI * 4 * Number(frequency.value));
    const draw = () => {
      const points = [];
      for (let x = 32; x <= 300; x += 2) points.push(`${x === 32 ? 'M' : 'L'}${x},${yAt(x).toFixed(2)}`);
      wave.setAttribute('d', points.join(' '));
      document.getElementById('amplitude-value').textContent = `${amplitude.value}×`;
      document.getElementById('frequency-value').textContent = `${frequency.value}×`;
    };
    amplitude.addEventListener('input', draw);
    frequency.addEventListener('input', draw);
    draw();
    let frame = 0;
    let inView = false;
    const animate = time => {
      const x = 32 + ((time % 5000) / 5000) * 268;
      point.setAttribute('cx', x.toFixed(2));
      point.setAttribute('cy', yAt(x).toFixed(2));
      frame = requestAnimationFrame(animate);
    };
    const syncAnimation = () => {
      cancelAnimationFrame(frame);
      if (inView && !document.hidden && !motion.matches) frame = requestAnimationFrame(animate);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        syncAnimation();
      }).observe(wave.closest('.physics-feature'));
    }
    motion.addEventListener('change', syncAnimation);
    document.addEventListener('visibilitychange', syncAnimation);
  }
})();
