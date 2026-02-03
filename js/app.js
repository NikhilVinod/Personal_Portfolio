/**
 * Portfolio app — expansion panels (experience/projects) and mobile nav.
 * @file js/app.js
 */

(function () {
  'use strict';

  const gridSelectors = '.experience-grid, .projects-grid';
  const grids = document.querySelectorAll(gridSelectors);

  /**
   * @param {Element} grid
   * @returns {'experience' | 'projects'}
   */
  function getPrefix(grid) {
    return grid.classList.contains('experience-grid') ? 'experience' : 'projects';
  }

  /**
   * @param {Element} grid
   * @returns {HTMLElement}
   */
  function ensurePanel(grid) {
    const prefix = getPrefix(grid);
    const panelClass = prefix + '-panel';
    let panel = /** @type {HTMLElement | null} */ (grid.parentElement.querySelector('.' + panelClass));
    if (panel) return panel;

    const isProjects = prefix === 'projects';
    const pathname = window.location.pathname;
    const imgBase = (/\/pages\//.test(pathname) || /\/(about|experience|projects)\//.test(pathname)) ? '../' : '';
    const metaExtra = isProjects
      ? '<a href="#" class="projects-panel-open-link" target="_blank" rel="noopener" aria-label="Open project"><img src="' + imgBase + 'img/icons/openLink.svg" alt="" /></a>'
      : '<span class="' + prefix + '-panel-dates"></span>';

    panel = document.createElement('section');
    panel.className = panelClass;
    panel.setAttribute('aria-label', 'Detail view');
    panel.innerHTML =
      '<button type="button" class="' +
      prefix +
      '-panel-back" aria-label="Back to list">←</button>' +
      '<div class="' +
      prefix +
      '-panel-inner">' +
      '<div class="' +
      prefix +
      '-panel-left">' +
      '<img alt="" />' +
      '<h2 class="' +
      prefix +
      '-company"></h2>' +
      '</div>' +
      '<div class="' +
      prefix +
      '-panel-right">' +
      '<div class="' +
      prefix +
      '-panel-meta">' +
      '<span class="' +
      prefix +
      '-panel-role"></span>' +
      metaExtra +
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
   * @param {'experience' | 'projects'} prefix
   */
  function setActiveCard(grid, activeCard, prefix) {
    const cardClass = '.' + prefix + '-card';
    grid.querySelectorAll(cardClass).forEach(function (c) {
      c.classList.toggle('is-active', c === activeCard);
    });
  }

  /**
   * @param {Element} grid
   * @param {'experience' | 'projects'} prefix
   */
  function clearActiveCards(grid, prefix) {
    const cardClass = '.' + prefix + '-card';
    grid.querySelectorAll(cardClass).forEach(function (c) {
      c.classList.remove('is-active');
    });
  }

  /**
   * @param {HTMLElement} panel
   * @param {Element} card
   * @param {'experience' | 'projects'} prefix
   */
  function fillPanelFromCard(panel, card, prefix) {
    const logo = card.querySelector('.' + prefix + '-logo');
    const company = card.querySelector('.' + prefix + '-company');
    const dates = card.querySelector('.' + prefix + '-dates');
    const bullets = card.querySelectorAll('.' + prefix + '-description li');

    const panelImg = panel.querySelector('.' + prefix + '-panel-left img');
    const panelH2 = panel.querySelector('.' + prefix + '-panel-left h2');
    const panelRole = panel.querySelector('.' + prefix + '-panel-role');
    const panelDates = panel.querySelector('.' + prefix + '-panel-dates');
    const panelUl = panel.querySelector('.' + prefix + '-panel-right ul');

    if (panelImg) {
      panelImg.src = logo ? (logo.getAttribute('src') || '') : '';
      panelImg.alt = logo ? (logo.getAttribute('alt') || '') : '';
    }
    if (panelH2) panelH2.textContent = company ? (company.textContent || '').trim() : '';
    if (panelRole) panelRole.textContent = card.getAttribute('data-role') || '';
    if (panelDates && dates) panelDates.textContent = (dates.textContent || '').trim();

    if (prefix === 'projects') {
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
    const prefix = getPrefix(grid);
    const panel = ensurePanel(grid);
    const backBtn = panel.querySelector('.' + prefix + '-panel-back');
    const cardClass = '.' + prefix + '-card';

    grid.querySelectorAll(cardClass).forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.stopPropagation();
        setActiveCard(grid, card, prefix);
        fillPanelFromCard(panel, card, prefix);
        openPanel(panel, grid);
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        clearActiveCards(grid, prefix);
        closePanel(panel, grid);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!panel.classList.contains('is-open')) return;
      clearActiveCards(grid, prefix);
      closePanel(panel, grid);
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
