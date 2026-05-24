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
