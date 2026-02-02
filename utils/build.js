#!/usr/bin/env node
/**
 * Build script: assembles full HTML pages from components and page content.
 * Run: node utils/build.js
 * Output: index.html, about.html, experience.html, projects.html at repo root.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const PAGES = path.join(ROOT, 'pages');

const PAGE_CONFIG = {
  home: { title: 'Home', bodyClass: '', output: 'index.html' },
  about: { title: 'About Me', bodyClass: '', output: 'about.html' },
  experience: { title: 'Experience', bodyClass: 'experience-page', output: 'experience.html' },
  projects: { title: 'Projects', bodyClass: 'projects-page', output: 'projects.html' },
};

const PAGE_HREFS = {
  home: 'index.html',
  about: 'about.html',
  experience: 'experience.html',
  projects: 'projects.html',
};

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setCurrentPage(html, currentPage) {
  const pageHref = PAGE_HREFS[currentPage];
  if (!pageHref) return html;
  let out = html.replace(/\s*data-page="[^"]*"/g, '');
  const linkPattern = new RegExp('<a href="' + escapeRegExp(pageHref) + '">', 'g');
  out = out.replace(linkPattern, '<a href="' + pageHref + '" aria-current="page">');
  return out;
}

function build() {
  const navbarRaw = fs.readFileSync(path.join(COMPONENTS, 'navbar.html'), 'utf8');
  const sidebarRaw = fs.readFileSync(path.join(COMPONENTS, 'sidebar.html'), 'utf8');
  const waveRaw = fs.readFileSync(path.join(COMPONENTS, 'wave.html'), 'utf8');

  const skipLink = '<a href="#main-content" class="skip-link">Skip to main content</a>\n    ';
  const stylePath = 'styles/main.css';
  const scriptPath = 'js/app.js';

  for (const [pageId, config] of Object.entries(PAGE_CONFIG)) {
    const mainPath = path.join(PAGES, pageId + '.html');
    const pageRaw = fs.readFileSync(mainPath, 'utf8');
    const mainMatch = pageRaw.match(/<main\s+id="main-content"[^>]*>[\s\S]*?<\/main>/);
    let mainContent = mainMatch ? mainMatch[0] : pageRaw;
    mainContent = mainContent.replace(/\.\.\/(img|styles|js)\//g, '$1/');

    const navbar = setCurrentPage(navbarRaw, pageId);
    const sidebar = setCurrentPage(sidebarRaw, pageId);

    const bodyClass = config.bodyClass ? ` class="${config.bodyClass}"` : '';
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <link rel="stylesheet" href="${stylePath}">
</head>
<body${bodyClass}>
    ${skipLink}
    ${navbar}
    ${sidebar}
    ${mainContent}
    ${waveRaw}
    <script src="${scriptPath}" defer></script>
</body>
</html>
`;

    const outPath = path.join(ROOT, config.output);
    fs.writeFileSync(outPath, fullHtml);
    console.log('Wrote', config.output);

    const navbarForPages = pathRewriteForPages(navbar, pageId);
    const sidebarForPages = pathRewriteForPages(sidebar, pageId);
    const mainContentForPages = mainContent.replace(/\b(img|styles|js|files)\//g, '../$1/');
    const waveForPages = waveRaw.replace(/src="img\//, 'src="../img/');
    const fullHtmlForPages = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <link rel="stylesheet" href="../styles/main.css">
</head>
<body${bodyClass}>
    ${skipLink}
    ${navbarForPages}
    ${sidebarForPages}
    ${mainContentForPages}
    ${waveForPages}
    <script src="../js/app.js" defer></script>
</body>
</html>
`;

    const pageOutPath = path.join(PAGES, pageId + '.html');
    fs.writeFileSync(pageOutPath, fullHtmlForPages);
    console.log('Wrote pages/' + pageId + '.html');
  }
}

function pathRewriteForPages(html) {
  return html
    .replace(/\bsrc="img\//g, 'src="../img/')
    .replace(/\bhref="files\//g, 'href="../files/')
    .replace(/\bhref="index\.html"/g, 'href="home.html"');
}

build();
