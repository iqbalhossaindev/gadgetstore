const internalLinks = document.querySelectorAll('a[href$=".html"], a[href^="models.html"]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');
const yearNode = document.querySelector('[data-year]');

if (yearNode) yearNode.textContent = new Date().getFullYear();

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

internalLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.target === '_blank') return;
    const current = window.location.pathname.split('/').pop() || 'index.html';
    if (href === current) return;
    event.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 230);
  });
});

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach((item) => revealObserver.observe(item));

const finder = document.querySelector('[data-finder]');
if (finder) {
  finder.addEventListener('submit', (event) => {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(finder));
    const search = params.toString();
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = `models.html${search ? `?${search}` : ''}`;
    }, 230);
  });
}

const headerSearchForms = document.querySelectorAll('[data-header-search]');
headerSearchForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = form.querySelector('input')?.value?.trim() || '';
    if (!value) return;
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = `models.html?q=${encodeURIComponent(value)}`;
    }, 230);
  });
});

const modelGrid = document.querySelector('[data-model-grid]');
if (modelGrid) {
  const cards = Array.from(modelGrid.querySelectorAll('[data-model-card]'));
  const searchInput = document.querySelector('[data-model-search]');
  const brandSelect = document.querySelector('[data-model-brand]');
  const categorySelect = document.querySelector('[data-model-category]');
  const budgetSelect = document.querySelector('[data-model-budget]');
  const noResults = document.querySelector('[data-no-results]');
  const params = new URLSearchParams(window.location.search);

  const applyIncomingParam = (node, keys) => {
    const value = keys.map((key) => params.get(key)).find(Boolean);
    if (!value || !node) return;
    if (node.tagName === 'SELECT') {
      const match = Array.from(node.options).find((option) => option.value.toLowerCase() === value.toLowerCase());
      if (match) node.value = match.value;
    } else {
      node.value = value;
    }
  };

  applyIncomingParam(searchInput, ['q', 'model']);
  applyIncomingParam(brandSelect, ['brand']);
  applyIncomingParam(categorySelect, ['type', 'category']);
  applyIncomingParam(budgetSelect, ['budget']);

  const fitsBudget = (price, budget) => {
    if (!budget || budget === 'all') return true;
    if (budget === 'under-2000') return price < 2000;
    if (budget === '2000-4000') return price >= 2000 && price <= 4000;
    if (budget === '4000-plus') return price > 4000;
    return true;
  };

  const filterModels = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const brand = brandSelect?.value || 'all';
    const category = categorySelect?.value || 'all';
    const budget = budgetSelect?.value || 'all';
    let visible = 0;

    cards.forEach((card) => {
      const text = card.dataset.search || card.textContent.toLowerCase();
      const cardBrand = card.dataset.brand;
      const cardCategory = card.dataset.category;
      const price = Number(card.dataset.price || 0);
      const shouldShow =
        (!query || text.includes(query)) &&
        (brand === 'all' || cardBrand === brand) &&
        (category === 'all' || cardCategory === category) &&
        fitsBudget(price, budget);

      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });

    if (noResults) noResults.classList.toggle('show', visible === 0);
  };

  [searchInput, brandSelect, categorySelect, budgetSelect].forEach((node) => {
    if (node) node.addEventListener('input', filterModels);
    if (node) node.addEventListener('change', filterModels);
  });
  filterModels();
}
