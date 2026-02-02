// script.js — Panel replaces grid (takes its place)

(() => {
  const grids = document.querySelectorAll(".experience-grid");

  function ensurePanel(grid) {
    // Find an existing panel in the same section
    let panel = grid.parentElement.querySelector(".experience-panel");
    if (panel) return panel;

    panel = document.createElement("section");
    panel.className = "experience-panel";
    panel.innerHTML = `
      <div class="experience-panel-bar">
        <button type="button" class="experience-panel-back">←</button>
      </div>
      <div class="experience-panel-inner">
        <div class="experience-panel-left">
          <img alt="" />
          <h2></h2>
          <p></p>
        </div>
        <div class="experience-panel-right">
          <ul></ul>
        </div>
      </div>
    `;

    // Insert panel BEFORE the grid so it can take the grid's place
    grid.insertAdjacentElement("beforebegin", panel);

    // prevent clicks inside panel from bubbling
    panel.addEventListener("click", (e) => e.stopPropagation());

    return panel;
  }

  function setActiveCard(grid, activeCard) {
    grid.querySelectorAll(".experience-card").forEach((c) => {
      c.classList.toggle("is-active", c === activeCard);
    });
  }

  function clearActiveCards(grid) {
    grid.querySelectorAll(".experience-card").forEach((c) => c.classList.remove("is-active"));
  }

  function fillPanelFromCard(panel, card) {
    const logo = card.querySelector(".experience-logo");
    const company = card.querySelector(".experience-company");
    const role = card.querySelector(".experience-role");
    const bullets = card.querySelectorAll(".experience-description li");

    const panelImg = panel.querySelector(".experience-panel-left img");
    const panelH2 = panel.querySelector(".experience-panel-left h2");
    const panelP = panel.querySelector(".experience-panel-left p");
    const panelUl = panel.querySelector(".experience-panel-right ul");

    panelImg.src = logo?.getAttribute("src") || "";
    panelImg.alt = logo?.getAttribute("alt") || "";

    panelH2.textContent = company?.textContent?.trim() || "";
    panelP.textContent = role?.textContent?.trim() || "";

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
    const panel = ensurePanel(grid);
    const backBtn = panel.querySelector(".experience-panel-back");

    // Clicking a card opens panel and hides grid
    grid.querySelectorAll(".experience-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        setActiveCard(grid, card);
        fillPanelFromCard(panel, card);
        openPanel(panel, grid);
      });
    });

    // Back button closes panel and shows grid
    backBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearActiveCards(grid);
      closePanel(panel, grid);
    });

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!panel.classList.contains("is-open")) return;
      clearActiveCards(grid);
      closePanel(panel, grid);
    });
  });
})();
