#!/usr/bin/env node
/**
 * Build script: assembles full HTML pages from components and page content.
 * Run: node utils/build.js
 * Output:
 *   - index.html at repo root (home)
 *   - about/index.html, experience/index.html, projects/index.html (clean URLs)
 * All links use clean URLs (./, about/, experience/, projects/) and work under a subpath.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const PAGES = path.join(ROOT, 'pages');
const hasPagesDir = fs.existsSync(PAGES);

// Clean-URL paths for root (index.html at /)
const ROOT_LINKS = {
  home: './',
  about: 'about/',
  experience: 'experience/',
  projects: 'projects/',
};

// Clean-URL paths for pages in subfolders (e.g. /about/index.html)
const FOLDER_LINKS = {
  home: '../',
  about: '../about/',
  experience: '../experience/',
  projects: '../projects/',
};

const PAGE_CONFIG = [
  { id: 'home', title: 'Home', bodyClass: '', outputPath: 'index.html', isRoot: true },
  { id: 'about', title: 'About Me', bodyClass: '', outputPath: 'about/index.html', isRoot: false },
  { id: 'experience', title: 'Experience', bodyClass: 'experience-page', outputPath: 'experience/index.html', isRoot: false },
  { id: 'projects', title: 'Projects', bodyClass: 'projects-page', outputPath: 'projects/index.html', isRoot: false },
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace nav/sidebar links with clean-URL hrefs and set aria-current for current page.
 */
function setNavLinks(html, currentPageId, linkMap) {
  let out = html.replace(/\s*data-page="[^"]*"/g, '');
  out = out
    .replace(/<a href="[^"]*"[^>]*>Home<\/a>/g, '<a href="' + linkMap.home + '">Home</a>')
    .replace(/<a href="[^"]*"[^>]*>About Me<\/a>/g, '<a href="' + linkMap.about + '">About Me</a>')
    .replace(/<a href="[^"]*"[^>]*>Experience<\/a>/g, '<a href="' + linkMap.experience + '">Experience</a>')
    .replace(/<a href="[^"]*"[^>]*>Projects<\/a>/g, '<a href="' + linkMap.projects + '">Projects</a>');
  const currentHref = linkMap[currentPageId];
  if (currentHref) {
    const re = new RegExp('<a href="' + escapeRegExp(currentHref) + '">', 'g');
    out = out.replace(re, '<a href="' + currentHref + '" aria-current="page">');
  }
  return out;
}

/**
 * Prefix asset paths (img/, files/) in HTML with a string (e.g. '../' for subfolders).
 */
function prefixAssets(html, prefix) {
  if (!prefix) return html;
  return html
    .replace(/\bsrc="img\//g, 'src="' + prefix + 'img/')
    .replace(/\bhref="files\//g, 'href="' + prefix + 'files/');
}

function build() {
  const navbarRaw = fs.readFileSync(path.join(COMPONENTS, 'navbar.html'), 'utf8');
  const sidebarRaw = fs.readFileSync(path.join(COMPONENTS, 'sidebar.html'), 'utf8');
  const waveRaw = fs.readFileSync(path.join(COMPONENTS, 'wave.html'), 'utf8');

  const skipLink = '<a href="#main-content" class="skip-link">Skip to main content</a>\n    ';

  for (const config of PAGE_CONFIG) {
    const { id: pageId, title, bodyClass, outputPath, isRoot } = config;
    const mainPath = hasPagesDir
      ? path.join(PAGES, pageId + '.html')
      : (pageId === 'home' ? path.join(ROOT, 'index.html') : path.join(ROOT, pageId, 'index.html'));
    const pageRaw = fs.readFileSync(mainPath, 'utf8');
    const mainMatch = pageRaw.match(/<main\s+id="main-content"[^>]*>[\s\S]*?<\/main>/);
    let mainContent = mainMatch ? mainMatch[0] : pageRaw;
    mainContent = mainContent.replace(/\.\.\/(img|styles|js|files)\//g, '$1/');

    const linkMap = isRoot ? ROOT_LINKS : FOLDER_LINKS;
    const assetPrefix = isRoot ? '' : '../';
    const stylePath = isRoot ? 'styles/main.css' : '../styles/main.css';
    const scriptPath = isRoot ? 'js/app.js' : '../js/app.js';

    const navbar = setNavLinks(navbarRaw, pageId, linkMap);
    const sidebar = setNavLinks(sidebarRaw, pageId, linkMap);

    if (!isRoot) {
      mainContent = mainContent.replace(/\b(img|styles|js|files)\//g, assetPrefix + '$1/');
    }
    const navbarHtml = prefixAssets(navbar, assetPrefix);
    const sidebarHtml = prefixAssets(sidebar, assetPrefix);
    const waveHtml = prefixAssets(waveRaw, assetPrefix);

    const bodyClassAttr = bodyClass ? ` class="${bodyClass}"` : '';
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${stylePath}">
</head>
<body${bodyClassAttr}>
    ${skipLink}
    ${navbarHtml}
    ${sidebarHtml}
    ${mainContent}
    ${waveHtml}
    <script src="${scriptPath}" defer></script>
</body>
</html>
`;

    const outPath = path.join(ROOT, outputPath);
    const outDir = path.dirname(outPath);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, fullHtml);
    console.log('Wrote', outputPath);
  }

  // Keep pages/*.html for local dev when pages/ exists (with ../ paths and home.html)
  if (!hasPagesDir) return;
  const pagesDir = path.join(ROOT, 'pages');
  for (const config of PAGE_CONFIG) {
    const { id: pageId, title, bodyClass: pageBodyClass } = config;
    const mainPath = path.join(PAGES, pageId + '.html');
    const pageRaw = fs.readFileSync(mainPath, 'utf8');
    const mainMatch = pageRaw.match(/<main\s+id="main-content"[^>]*>[\s\S]*?<\/main>/);
    let mainContent = mainMatch ? mainMatch[0] : pageRaw;
    mainContent = mainContent.replace(/\.\.\/(img|styles|js|files)\//g, '$1/').replace(/\b(img|styles|js|files)\//g, '../$1/');

    const linkMapForPages = { home: 'home.html', about: 'about.html', experience: 'experience.html', projects: 'projects.html' };
    const navbarForPages = setNavLinks(navbarRaw, pageId, linkMapForPages)
      .replace(/\bhref="home\.html"/g, 'href="home.html"')
      .replace(/\bsrc="img\//g, 'src="../img/')
      .replace(/\bhref="files\//g, 'href="../files/');
    const sidebarForPages = setNavLinks(sidebarRaw, pageId, linkMapForPages)
      .replace(/\bhref="home\.html"/g, 'href="home.html"')
      .replace(/\bsrc="img\//g, 'src="../img/')
      .replace(/\bhref="files\//g, 'href="../files/');
    const waveForPages = waveRaw.replace(/src="img\//, 'src="../img/');

    const bodyClassAttr = pageBodyClass ? ` class="${pageBodyClass}"` : '';
    const fullHtmlForPages = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../styles/main.css">
</head>
<body${bodyClassAttr}>
    ${skipLink}
    ${navbarForPages}
    ${sidebarForPages}
    ${mainContent}
    ${waveForPages}
    <script src="../js/app.js" defer></script>
</body>
</html>
`;
    const pageOutPath = path.join(pagesDir, pageId + '.html');
    fs.writeFileSync(pageOutPath, fullHtmlForPages);
    console.log('Wrote pages/' + pageId + '.html');
  }
}

build();
