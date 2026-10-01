/**
 * Portfolio app — experience timeline and mobile nav.
 * @file js/app.js
 */

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
