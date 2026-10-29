export class PuiDialog extends HTMLElement {
  static observedAttributes = ["open"];

  #listeners?: AbortController;
  #syncing = false;

  get dialog(): HTMLDialogElement | null {
    return this.querySelector("dialog");
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    this.toggleAttribute("open", Boolean(value));
  }

  connectedCallback() {
    this.#listeners?.abort();
    this.#listeners = new AbortController();

    const options = { signal: this.#listeners.signal };
    const dialog = this.dialog;

    if (!dialog) {
      console.warn("pui-dialog: a nested <dialog> element is required.");
      return;
    }

    dialog.addEventListener("click", this.#handleClick, options);
    dialog.addEventListener("cancel", this.#handleCancel, options);
    dialog.addEventListener("close", this.#handleClose, options);

    if (this.open) this.showModal();
  }

  disconnectedCallback() {
    this.#listeners?.abort();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (name !== "open" || oldValue === newValue || this.#syncing) return;
    if (!this.isConnected) return;

    if (newValue !== null) {
      this.showModal();
    } else {
      this.dialog?.close();
    }
  }

  show() {
    const dialog = this.dialog;
    if (!dialog || dialog.open) return;
    dialog.show();
    this.#syncOpen(true);
  }

  showModal() {
    const dialog = this.dialog;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    this.#syncOpen(true);
  }

  close(returnValue?: string) {
    const dialog = this.dialog;
    if (!dialog || !dialog.open) return;
    dialog.close(returnValue);
  }

  #syncOpen(open: boolean) {
    this.#syncing = true;
    this.toggleAttribute("open", open);
    this.#syncing = false;

    this.dispatchEvent(
      new CustomEvent(open ? "dialog-open" : "dialog-close", {
        bubbles: true,
        detail: { dialog: this.dialog, returnValue: this.dialog?.returnValue },
      }),
    );
  }

  #handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const trigger = target.closest<HTMLElement>("[data-dialog-close]");
    if (trigger) {
      this.close(trigger.getAttribute("data-dialog-close") ?? undefined);
      return;
    }

    if (
      event.target === this.dialog &&
      this.getAttribute("backdrop-close") !== "false"
    ) {
      this.close();
    }
  };

  #handleCancel = (event: Event) => {
    if (this.getAttribute("escape-close") === "false") {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  #handleClose = () => {
    this.#syncOpen(false);
  };

  showAndReturn() {
    const dialog = this.dialog;

    if (!dialog) {
      console.warn("pui-dialog: a nested <dialog> element is required.");
      return Promise.resolve("");
    }

    this.showModal();
    return new Promise<string>((resolve) => {
      const listener = (event: Event) => {
        this.removeEventListener("dialog-close", listener);
        resolve((event as CustomEvent).detail.returnValue);
      }
      this.addEventListener("dialog-close", listener);
    })
  }
}

if (!customElements.get("pui-dialog")) {
  customElements.define("pui-dialog", PuiDialog);
}
