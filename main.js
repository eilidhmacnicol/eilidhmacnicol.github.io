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

// ── Publications: fetch and render ───────────────────────
async function loadPublications() {
  const list = document.getElementById('publications-list');
  if (!list) return;

  let bibtex;
  try {
    const res = await fetch('publications.bib');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    bibtex = await res.text();
  } catch (err) {
    list.innerHTML = '<li class="pub-loading">Could not load publications.</li>';
    console.error('Failed to fetch publications.bib:', err);
    return;
  }

  // citation.js CDN build exposes Cite as a global
  let entries;
  try {
    entries = new Cite(bibtex).data;
  } catch (err) {
    list.innerHTML = '<li class="pub-loading">Could not parse publications.bib.</li>';
    console.error('Failed to parse BibTeX:', err);
    return;
  }

  entries.sort((a, b) => {
    const yearA = a.issued?.['date-parts']?.[0]?.[0] ?? 0;
    const yearB = b.issued?.['date-parts']?.[0]?.[0] ?? 0;
    return yearB - yearA;
  });

  list.innerHTML = entries.map(entry => {
    const authors = (entry.author ?? [])
      .map(a => `${a.family}${a.given ? ', ' + a.given.charAt(0) + '.' : ''}`)
      .join('; ');
    const year    = entry.issued?.['date-parts']?.[0]?.[0] ?? '';
    const journal = entry['container-title'] ?? entry.publisher ?? '';
    const doi     = entry.DOI;
    const title   = entry.title ?? 'Untitled';

    const titleEl = doi
      ? `<a class="pub-title" href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">${title}</a>`
      : `<span class="pub-title">${title}</span>`;

    const meta = [authors, journal, year ? `(${year})` : ''].filter(Boolean).join(' — ');

    return `<li><div class="pub-entry">${titleEl}<div class="pub-meta">${meta}</div></div></li>`;
  }).join('');
}

loadPublications();
