// script.js — Panel replaces grid (takes its place). Supports both experience and projects pages.

(() => {
  const gridSelectors = ".experience-grid, .projects-grid";
  const grids = document.querySelectorAll(gridSelectors);

  function getPrefix(grid) {
    return grid.classList.contains("experience-grid") ? "experience" : "projects";
  }

  function ensurePanel(grid) {
    const prefix = getPrefix(grid);
    const panelClass = `${prefix}-panel`;
    let panel = grid.parentElement.querySelector(`.${panelClass}`);
    if (panel) return panel;

    const isProjects = prefix === "projects";
    const metaExtra = isProjects
      ? `<a href="#" class="projects-panel-open-link" target="_blank" rel="noopener" aria-label="Open project"><img src="img/icons/openLink.svg" alt="" /></a>`
      : `<span class="${prefix}-panel-dates"></span>`;

    panel = document.createElement("section");
    panel.className = panelClass;
    panel.innerHTML = `
      <button type="button" class="${prefix}-panel-back">←</button>
      <div class="${prefix}-panel-inner">
        <div class="${prefix}-panel-left">
          <img alt="" />
          <h2 class="${prefix}-company"></h2>
        </div>
        <div class="${prefix}-panel-right">
          <div class="${prefix}-panel-meta">
            <span class="${prefix}-panel-role"></span>
            ${metaExtra}
          </div>
          <ul></ul>
        </div>
      </div>
    `;

    grid.insertAdjacentElement("beforebegin", panel);
    panel.addEventListener("click", (e) => e.stopPropagation());

    return panel;
  }

  function setActiveCard(grid, activeCard, prefix) {
    const cardClass = `.${prefix}-card`;
    grid.querySelectorAll(cardClass).forEach((c) => {
      c.classList.toggle("is-active", c === activeCard);
    });
  }

  function clearActiveCards(grid, prefix) {
    const cardClass = `.${prefix}-card`;
    grid.querySelectorAll(cardClass).forEach((c) => c.classList.remove("is-active"));
  }

  function fillPanelFromCard(panel, card, prefix) {
    const logo = card.querySelector(`.${prefix}-logo`);
    const company = card.querySelector(`.${prefix}-company`);
    const dates = card.querySelector(`.${prefix}-dates`);
    const bullets = card.querySelectorAll(`.${prefix}-description li`);

    const panelImg = panel.querySelector(`.${prefix}-panel-left img`);
    const panelH2 = panel.querySelector(`.${prefix}-panel-left h2`);
    const panelRole = panel.querySelector(`.${prefix}-panel-role`);
    const panelDates = panel.querySelector(`.${prefix}-panel-dates`);
    const panelUl = panel.querySelector(`.${prefix}-panel-right ul`);

    panelImg.src = logo?.getAttribute("src") || "";
    panelImg.alt = logo?.getAttribute("alt") || "";

    panelH2.textContent = company?.textContent?.trim() || "";
    panelRole.textContent = card.dataset.role || "";
    if (panelDates) panelDates.textContent = dates?.textContent?.trim() || "";

    if (prefix === "projects") {
      const openLink = panel.querySelector(".projects-panel-open-link");
      if (openLink) {
        const url = card.dataset.projectUrl || "#";
        if (url === "#" || url === "") {
          openLink.style.display = "none";
        } else {
          openLink.href = url;
          openLink.style.display = "";
        }
      }
    }

    panelUl.innerHTML = "";
    bullets.forEach((li) => {
      const item = document.createElement("li");
      item.textContent = li.textContent.trim();
      panelUl.appendChild(item);
    });
  }

  function openPanel(panel, grid) {
    grid.classList.add("is-hidden");
    panel.classList.add("is-open");
  }

  function closePanel(panel, grid) {
    panel.classList.remove("is-open");
    grid.classList.remove("is-hidden");
  }

  grids.forEach((grid) => {
    const prefix = getPrefix(grid);
    const panel = ensurePanel(grid);
    const backBtn = panel.querySelector(`.${prefix}-panel-back`);
    const cardClass = `.${prefix}-card`;

    grid.querySelectorAll(cardClass).forEach((card) => {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        setActiveCard(grid, card, prefix);
        fillPanelFromCard(panel, card, prefix);
        openPanel(panel, grid);
      });
    });

    backBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearActiveCards(grid, prefix);
      closePanel(panel, grid);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!panel.classList.contains("is-open")) return;
      clearActiveCards(grid, prefix);
      closePanel(panel, grid);
    });
  });
})();
