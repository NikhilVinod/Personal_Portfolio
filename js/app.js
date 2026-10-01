/**
 * Portfolio app — projects expansion panel, experience timeline, and mobile nav.
 * @file js/app.js
 */

(function () {
  'use strict';

  const grids = document.querySelectorAll('.projects-grid');

  /**
   * @param {Element} grid
   * @returns {HTMLElement}
   */
  function ensurePanel(grid) {
    let panel = /** @type {HTMLElement | null} */ (grid.parentElement.querySelector('.projects-panel'));
    if (panel) return panel;

    const pathname = window.location.pathname;
    // Detect asset root: pages/ dev files and clean-URL subfolders both sit one level below root.
    const imgBase = (/\/pages\//.test(pathname) || /\/(about|experience|projects)\//.test(pathname)) ? '../' : '';

    panel = document.createElement('section');
    panel.className = 'projects-panel';
    panel.setAttribute('aria-label', 'Detail view');
    panel.innerHTML =
      '<button type="button" class="projects-panel-back" aria-label="Back to list">←</button>' +
      '<div class="projects-panel-inner">' +
      '<div class="projects-panel-left">' +
      '<img alt="" />' +
      '<h2 class="projects-company"></h2>' +
      '</div>' +
      '<div class="projects-panel-right">' +
      '<div class="projects-panel-meta">' +
      '<span class="projects-panel-role"></span>' +
      '<a href="#" class="projects-panel-open-link" target="_blank" rel="noopener" aria-label="Open project">' +
      '<img src="' + imgBase + 'img/icons/openLink.svg" alt="" /></a>' +
      '</div>' +
      '<ul></ul>' +
      '</div>' +
      '</div>';

    grid.insertAdjacentElement('beforebegin', panel);
    panel.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    return panel;
  }

  /**
   * @param {Element} grid
   * @param {Element} activeCard
   */
  function setActiveCard(grid, activeCard) {
    grid.querySelectorAll('.projects-card').forEach(function (c) {
      c.classList.toggle('is-active', c === activeCard);
    });
  }

  /**
   * @param {Element} grid
   */
  function clearActiveCards(grid) {
    grid.querySelectorAll('.projects-card').forEach(function (c) {
      c.classList.remove('is-active');
    });
  }

  /**
   * @param {HTMLElement} panel
   * @param {Element} card
   */
  function fillPanelFromCard(panel, card) {
    const logo = card.querySelector('.projects-logo');
    const company = card.querySelector('.projects-company');
    const bullets = card.querySelectorAll('.projects-description li');

    const panelImg = panel.querySelector('.projects-panel-left img');
    const panelH2 = panel.querySelector('.projects-panel-left h2');
    const panelRole = panel.querySelector('.projects-panel-role');
    const panelUl = panel.querySelector('.projects-panel-right ul');

    if (panelImg) {
      panelImg.src = logo ? (logo.getAttribute('src') || '') : '';
      panelImg.alt = logo ? (logo.getAttribute('alt') || '') : '';
    }
    if (panelH2) panelH2.textContent = company ? (company.textContent || '').trim() : '';
    if (panelRole) panelRole.textContent = card.getAttribute('data-role') || '';

    const openLink = panel.querySelector('.projects-panel-open-link');
    if (openLink && openLink instanceof HTMLAnchorElement) {
      const url = card.getAttribute('data-project-url') || '#';
      if (url === '#' || url === '') {
        openLink.style.display = 'none';
      } else {
        openLink.href = url;
        openLink.style.display = '';
      }
    }

    if (panelUl) {
      panelUl.innerHTML = '';
      bullets.forEach(function (li) {
        const item = document.createElement('li');
        item.textContent = (li.textContent || '').trim();
        panelUl.appendChild(item);
      });
    }
  }

  /**
   * @param {HTMLElement} panel
   * @param {Element} grid
   */
  function openPanel(panel, grid) {
    grid.classList.add('is-hidden');
    panel.classList.add('is-open');
  }

  /**
   * @param {HTMLElement} panel
   * @param {Element} grid
   */
  function closePanel(panel, grid) {
    panel.classList.remove('is-open');
    grid.classList.remove('is-hidden');
  }

  grids.forEach(function (grid) {
    const panel = ensurePanel(grid);
    const backBtn = panel.querySelector('.projects-panel-back');

    grid.querySelectorAll('.projects-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.stopPropagation();
        setActiveCard(grid, card);
        fillPanelFromCard(panel, card);
        openPanel(panel, grid);
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        clearActiveCards(grid);
        closePanel(panel, grid);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!panel.classList.contains('is-open')) return;
      clearActiveCards(grid);
      closePanel(panel, grid);
    });
  });
})();

(function () {
  'use strict';

  document.querySelectorAll('.timeline-card').forEach(function (card) {
    const entry = card.closest('.timeline-entry');
    const dot = entry ? entry.querySelector('.timeline-dot') : null;

    function toggle() {
      const isOpen = card.classList.toggle('is-open');
      card.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (dot) dot.classList.toggle('timeline-dot--filled', isOpen);
    }

    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
})();

(function () {
  'use strict';

  const hamburger = document.querySelector('.nav-hamburger');
  const sidebar = document.querySelector('.nav-sidebar');
  const backdrop = document.querySelector('.nav-sidebar-backdrop');
  const closeBtn = document.querySelector('.nav-sidebar-close');
  const sidebarLinks = document.querySelectorAll('.nav-sidebar-nav a');
  const sidebarResume = document.querySelector('.nav-sidebar-resume');

  function openSidebar() {
    if (!sidebar || !backdrop) return;
    sidebar.classList.add('is-open');
    backdrop.classList.add('is-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar || !backdrop) return;
    sidebar.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);
  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', closeSidebar);
  });
  if (sidebarResume) sidebarResume.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sidebar || !sidebar.classList.contains('is-open')) return;
    closeSidebar();
  });

  window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width: 768px)').matches && sidebar && sidebar.classList.contains('is-open')) {
      closeSidebar();
    }
  });
})();
