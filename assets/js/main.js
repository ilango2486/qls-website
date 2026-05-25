(() => {
  // Footer year
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal-on-scroll via IntersectionObserver
  const targets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && targets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('is-visible'));
  }

  // Gallery — nudge button scrolls the strip; tiles open a lightbox.
  const strip = document.getElementById('gallery-strip');
  const nudge = document.getElementById('gallery-nudge');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCap = document.getElementById('lightbox-caption');
  const tiles = strip ? Array.from(strip.querySelectorAll('.gallery-tile')) : [];

  if (nudge && strip) {
    const updateNudge = () => {
      const atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8;
      nudge.hidden = atEnd;
    };
    nudge.addEventListener('click', () => {
      strip.scrollBy({ left: Math.round(strip.clientWidth * 0.85), behavior: 'smooth' });
    });
    strip.addEventListener('scroll', updateNudge, { passive: true });
    window.addEventListener('resize', updateNudge);
    updateNudge();
  }

  if (lightbox && lbImg && tiles.length) {
    let current = 0;
    let lastTrigger = null;
    const total = tiles.length;
    const sources = tiles.map(t => t.querySelector('img').src);
    const captions = tiles.map(t => t.querySelector('img').alt);

    const show = (i) => {
      current = ((i % total) + total) % total;
      lbImg.src = sources[current];
      lbImg.alt = captions[current] || '';
      lbCap.textContent = `${current + 1} / ${total}`;
    };
    const open = (i, trigger) => {
      lastTrigger = trigger || null;
      show(i);
      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
    };
    const close = () => {
      if (typeof lightbox.close === 'function') lightbox.close();
      else lightbox.removeAttribute('open');
      if (lastTrigger) lastTrigger.focus();
    };

    tiles.forEach((tile, i) => {
      tile.addEventListener('click', () => open(i, tile));
    });

    lightbox.querySelector('.lightbox-btn--close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-btn--prev').addEventListener('click', () => show(current - 1));
    lightbox.querySelector('.lightbox-btn--next').addEventListener('click', () => show(current + 1));

    // Backdrop click to close (clicks on the <img> or buttons don't bubble up to dialog)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.open) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    });
  }

  // Contact form — submit to Formspree if endpoint set, else fall back to mailto.
  const form = document.getElementById('enquiry-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const endpoint = form.dataset.endpoint;
    const endpointConfigured = endpoint && !endpoint.startsWith('__') && /^https?:\/\//i.test(endpoint);

    form.addEventListener('submit', async (e) => {
      if (!form.checkValidity()) {
        // Let browser show its native validation UI
        return;
      }

      if (!endpointConfigured) {
        // Fall back to mailto so messages still reach Mahalakshmi.
        // Don't preventDefault — the form action handles it.
        return;
      }

      e.preventDefault();
      const submitBtn = form.querySelector('button[type=submit]');
      submitBtn.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Sending…';

      try {
        const data = new FormData(form);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.reset();
          status.className = 'form-status ok';
          status.textContent = 'Thank you — your enquiry has been sent. Mahalakshmi will be in touch.';
        } else {
          const body = await res.json().catch(() => ({}));
          const msg = body?.errors?.map(x => x.message).join(', ') || 'Something went wrong. Please email maha.quantumleap@gmail.com directly.';
          status.className = 'form-status err';
          status.textContent = msg;
        }
      } catch (err) {
        status.className = 'form-status err';
        status.textContent = 'Network error. Please email maha.quantumleap@gmail.com directly.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
