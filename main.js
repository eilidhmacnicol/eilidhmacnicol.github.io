// ── Nav: scroll opacity ──────────────────────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── Nav: active section highlight ────────────────────────
const sections    = document.querySelectorAll('main section[id]');
const navLinks    = document.querySelectorAll('#nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

// ── Nav: hamburger menu ──────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  navLinksEl.classList.toggle('open');
});

navLinksEl.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    navLinksEl.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});
