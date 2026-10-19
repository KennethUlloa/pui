const supportsDetails = "open" in document.createElement("details");
let nextPanelId = 0;

class PuiSidebar extends HTMLElement {
  #listeners?: AbortController;

  connectedCallback() {
    this.#listeners?.abort();
    this.#listeners = new AbortController();

    const options = { signal: this.#listeners.signal };

    for (const disclosure of this.querySelectorAll<HTMLDetailsElement>("details[data-sidebar-disclosure]")) {
      const summary = disclosure.querySelector<HTMLElement>(":scope > summary");
      const content = disclosure.querySelector<HTMLElement>(":scope > .sidebar-content, :scope > .sidebar-group-content");
      if (!summary || !content) continue;

      if (!content.id) content.id = `pui-sidebar-content-${++nextPanelId}`;
      summary.setAttribute("aria-controls", content.id);

      const isSidebarDisclosure = disclosure.parentElement === this;
      const syncState = () => {
        const collapsed = !disclosure.hasAttribute("open");
        summary.setAttribute("aria-expanded", String(!collapsed));
        if (isSidebarDisclosure) this.dataset.collapsed = String(collapsed);
        content.setAttribute("aria-hidden", String(collapsed));
        content.toggleAttribute("inert", collapsed);
      };

      const toggleDisclosure = () => {
        if (disclosure.hasAttribute("open")) {
          disclosure.removeAttribute("open");
        } else {
          disclosure.setAttribute("open", "");
        }
        syncState();
      };

      if (!supportsDetails) {
        summary.setAttribute("role", "button");
        summary.tabIndex = 0;
        summary.addEventListener("click", (event) => {
          event.preventDefault();
          toggleDisclosure();
        }, options);

        summary.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleDisclosure();
          }
        }, options);
      } else {
        disclosure.addEventListener("toggle", syncState, options);
      }

      syncState();
    }
  }

  disconnectedCallback() {
    this.#listeners?.abort();
  }
}

if (!customElements.get("pui-sidebar")) {
  customElements.define("pui-sidebar", PuiSidebar);
}