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

// ── Publications: BibTeX parser ──────────────────────────
function unescapeLatex(str) {
  return str
    .replace(/\{\\'\{?([aeiouAEIOUyY])\}?\}/g, (_, c) => (c + '\u0301').normalize('NFC'))
    .replace(/\{\\`\{?([aeiouAEIOU])\}?\}/g,   (_, c) => (c + '\u0300').normalize('NFC'))
    .replace(/\{\\"\{?([aeiouAEIOU])\}?\}/g,   (_, c) => (c + '\u0308').normalize('NFC'))
    .replace(/\{\\~\{?([nNaAoO])\}?\}/g,       (_, c) => (c + '\u0303').normalize('NFC'))
    .replace(/\{\\c\{?([cC])\}?\}/g,            (_, c) => (c + '\u0327').normalize('NFC'))
    .replace(/\{\\u\{([gGaA])\}\}/g,            (_, c) => (c + '\u0306').normalize('NFC'))
    .replace(/\{\\i\}/g, 'i')
    .replace(/\\&/g, '&')
    .replace(/\{([^{}]*)\}/g, '$1')
    .normalize('NFC');
}

// Extract the value inside the outermost braces, counting depth.
function extractBraceValue(src, start) {
  let depth = 0;
  let i = start;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
    i++;
  }
  return src.slice(start + 1, i);
}

function parseBibtex(src) {
  const entries = [];
  let i = 0;
  while (i < src.length) {
    const at = src.indexOf('@', i);
    if (at === -1) break;
    // Read entry type
    let j = at + 1;
    while (j < src.length && /\w/.test(src[j])) j++;
    const type = src.slice(at + 1, j).toLowerCase();
    // Skip to opening brace
    while (j < src.length && src[j] !== '{') j++;
    if (j >= src.length) break;
    j++; // skip {
    // Skip key
    while (j < src.length && src[j] !== ',') j++;
    j++; // skip ,
    // Parse fields
    const fields = {};
    while (j < src.length) {
      // Skip whitespace and commas
      while (j < src.length && /[\s,]/.test(src[j])) j++;
      if (j >= src.length || src[j] === '}') { j++; break; }
      // Read field name
      const nameStart = j;
      while (j < src.length && /\w/.test(src[j])) j++;
      const name = src.slice(nameStart, j).toLowerCase();
      if (!name) { j++; continue; }
      // Skip to =
      while (j < src.length && src[j] !== '=' && src[j] !== '}') j++;
      if (src[j] === '}') break;
      j++; // skip =
      // Skip whitespace
      while (j < src.length && /\s/.test(src[j])) j++;
      // Read value: must start with {
      if (src[j] !== '{') {
        while (j < src.length && src[j] !== ',' && src[j] !== '}') j++;
        continue;
      }
      const value = extractBraceValue(src, j);
      // Advance j past the closing brace
      let depth = 0, k = j;
      while (k < src.length) {
        if (src[k] === '{') depth++;
        else if (src[k] === '}') { depth--; if (depth === 0) { j = k + 1; break; } }
        k++;
      }
      fields[name] = value.replace(/\s+/g, ' ').trim();
    }
    entries.push({ type, fields });
    i = j;
  }
  return entries;
}

function parseAuthors(authorStr) {
  const parts = authorStr.split(/\s+and\s+/i);
  const hasOthers = parts[parts.length - 1].trim().toLowerCase() === 'others';
  const names = (hasOthers ? parts.slice(0, -1) : parts).map(raw => {
    raw = unescapeLatex(raw.trim());
    if (raw.includes(',')) {
      const [family, given = ''] = raw.split(',').map(s => s.trim());
      return `${family}${given ? ', ' + given.charAt(0) + '.' : ''}`;
    }
    const tokens = raw.split(/\s+/);
    const family = tokens.pop() ?? '';
    const given  = tokens[0] ?? '';
    return `${family}${given ? ', ' + given.charAt(0) + '.' : ''}`;
  });
  if (hasOthers) names.push('et al.');
  return names;
}

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

  const entries = parseBibtex(bibtex);

  entries.sort((a, b) => {
    const yearA = parseInt(a.fields.year ?? '0', 10);
    const yearB = parseInt(b.fields.year ?? '0', 10);
    return yearB - yearA;
  });

  list.innerHTML = entries.map(({ fields }) => {
    const authors = parseAuthors(fields.author ?? '').join('; ');
    const year    = fields.year ?? '';
    const journal = unescapeLatex(fields.journal ?? fields.booktitle ?? fields.publisher ?? '');
    const doi     = fields.doi;
    const title   = unescapeLatex(fields.title ?? 'Untitled');

    const titleEl = doi
      ? `<a class="pub-title" href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">${title}</a>`
      : `<span class="pub-title">${title}</span>`;

    const meta = [authors, journal, year ? `(${year})` : ''].filter(Boolean).join(' — ');

    return `<li><div class="pub-entry">${titleEl}<div class="pub-meta">${meta}</div></div></li>`;
  }).join('');
}

loadPublications();
