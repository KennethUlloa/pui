const supportsDetails = "open" in document.createElement("details");
let nextPanelId = 0;

class PuiSidebar extends HTMLElement {
  #listeners?: AbortController;

  connectedCallback() {
    this.#listeners?.abort();
    this.#listeners = new AbortController();

    const options = { signal: this.#listeners.signal };

    const content = this.querySelector<HTMLElement>(":scope > .sidebar-content");
    const toggle = this.querySelector<HTMLButtonElement>(":scope > [data-sidebar-toggle]");

    if (content && toggle) {
      if (!content.id) content.id = `pui-sidebar-content-${++nextPanelId}`;
      toggle.setAttribute("aria-controls", content.id);

      const syncPanel = () => {
        const collapsed = this.dataset.collapsed === "true";
        toggle.setAttribute("aria-expanded", String(!collapsed));
        content.setAttribute("aria-hidden", String(collapsed));
        content.toggleAttribute("inert", collapsed);
      };

      toggle.addEventListener("click", () => {
        this.dataset.collapsed = String(this.dataset.collapsed !== "true");
        syncPanel();
      }, options);

      syncPanel();
    }

    for (const disclosure of this.querySelectorAll<HTMLDetailsElement>("details[data-sidebar-disclosure]")) {
      const summary = disclosure.querySelector<HTMLElement>(":scope > summary");
      const groupContent = disclosure.querySelector<HTMLElement>(":scope > .sidebar-group-content");
      if (!summary || !groupContent) continue;

      if (!groupContent.id) groupContent.id = `pui-sidebar-content-${++nextPanelId}`;
      summary.setAttribute("aria-controls", groupContent.id);

      const syncGroup = () => {
        const collapsed = !disclosure.hasAttribute("open");
        summary.setAttribute("aria-expanded", String(!collapsed));
        groupContent.setAttribute("aria-hidden", String(collapsed));
        groupContent.toggleAttribute("inert", collapsed);
      };

      const toggleGroup = () => {
        disclosure.toggleAttribute("open");
        syncGroup();
      };

      if (!supportsDetails) {
        summary.setAttribute("role", "button");
        summary.tabIndex = 0;
        summary.addEventListener("click", (event) => {
          event.preventDefault();
          toggleGroup();
        }, options);

        summary.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleGroup();
          }
        }, options);
      } else {
        disclosure.addEventListener("toggle", syncGroup, options);
      }

      syncGroup();
    }
  }

  disconnectedCallback() {
    this.#listeners?.abort();
  }
}

if (!customElements.get("pui-sidebar")) {
  customElements.define("pui-sidebar", PuiSidebar);
}
