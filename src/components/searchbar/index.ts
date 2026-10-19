import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import Search from "@/assets/search.svg?raw";
import ArrowDown from "@/assets/arrow-down.svg?raw";
import { repeat } from "lit/directives/repeat.js";

type SearchbarLabels = {
  showMore: string;
  noResults: (search: string) => string;
};

const defaultLabels: SearchbarLabels = {
  showMore: "Show more",
  noResults: (search: string) =>
    !search ? "No data" : `No results for "${search}"`,
};

@customElement("pui-searchbar")
export class Searchbar<T extends object> extends LitElement {
  @property({ type: String })
  placeholder: string = "Search...";

  @property({ type: Boolean })
  loading: boolean = false;

  @property({ type: Array })
  options: T[] = [];

  #labels: SearchbarLabels = defaultLabels;

  @property({ type: Boolean })
  hasMore: boolean = false;

  @state()
  get labels() {
    return this.#labels as SearchbarLabels;
  }

  set labels(labels: Partial<SearchbarLabels>) {
    this.#labels = {
      ...defaultLabels,
      ...labels,
    };
    this.requestUpdate();
  }

  createRenderRoot() {
    return this;
  }

  renderOption: (option: T) => string = (option) => String(option);

  optionId: (option: T) => string = (option) => String(option);

  get input() {
    return this.querySelector(".search-input") as HTMLInputElement;
  }

  private positionOptions = () => {
    const input = this.querySelector(".searchbar-input");
    const options = this.querySelector<HTMLElement>(".searchbar-options");

    if (!input || !options || !options.matches(":popover-open")) return;

    const bounds = input.getBoundingClientRect();
    const viewportPadding = 8;
    const width = Math.min(
      bounds.width,
      window.innerWidth - viewportPadding * 2,
    );
    const maxHeight = Math.min(
      options.scrollHeight,
      window.innerHeight - viewportPadding * 2,
    );
    const spaceBelow = window.innerHeight - bounds.bottom - viewportPadding;
    const spaceAbove = bounds.top - viewportPadding;
    const openAbove = spaceBelow < maxHeight + 8 && spaceAbove > spaceBelow;
    const top = openAbove
      ? Math.max(viewportPadding, bounds.top - maxHeight - 4)
      : Math.min(
          window.innerHeight - maxHeight - viewportPadding,
          bounds.bottom + 4,
        );
    const left = Math.min(
      Math.max(bounds.left, viewportPadding),
      window.innerWidth - width - viewportPadding,
    );

    options.style.left = `${left}px`;
    options.style.top = `${top}px`;
    options.style.width = `${width}px`;
    options.style.maxHeight = `${maxHeight}px`;
  };

  private stopTrackingOptions = () => {
    window.removeEventListener("resize", this.positionOptions);
    document.removeEventListener("scroll", this.positionOptions, true);
  };

  private supportsAnchorPositioning = () =>
    CSS.supports("anchor-scope", "--searchbar-control") &&
    CSS.supports("position-anchor", "--searchbar-control") &&
    CSS.supports("position-area", "block-end span-inline") &&
    CSS.supports("position-try-fallbacks", "flip-block") &&
    CSS.supports("position-try-order", "most-height");

  private handleOptionsToggle = (event: ToggleEvent) => {
    if (event.newState === "open" && !this.supportsAnchorPositioning()) {
      this.positionOptions();
      window.addEventListener("resize", this.positionOptions);
      document.addEventListener("scroll", this.positionOptions, true);
    } else {
      this.stopTrackingOptions();
    }
  };

  private handleSearchInput = (event: InputEvent) => {
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: (event.currentTarget as HTMLInputElement).value.trim(),
      }),
    );
    const input = event.currentTarget as HTMLInputElement;
    const options = this.querySelector<HTMLElement>(".searchbar-options");

    if (!options) return;

    if (input.value.trim()) {
      if (!options.matches(":popover-open")) options.showPopover();
    } else if (options.matches(":popover-open")) {
      options.hidePopover();
    }
  };

  render() {
    const id = `searchbar-options-${this.id}`;
    return html`
      <div class="input-container searchbar-input">
        ${this.loading
          ? html`<span class="flex items-center loading"
              ><span class="spinner spinner-0"></span
            ></span>`
          : html`<span class="text-muted flex items-center"
              >${unsafeHTML(Search)}</span
            >`}
        <input
          type="search"
          placeholder="${this.placeholder}"
          @input=${this.handleSearchInput}
          class="searchbar-input"
        />
        <button class="btn btn-ghost" popovertarget="${id}">
          ${unsafeHTML(ArrowDown)}
        </button>
      </div>
      <div
        class="popover searchbar-options"
        popover
        id="${id}"
        @toggle=${this.handleOptionsToggle}
      >
        ${!this.options.length
          ? html`<p class="text-muted p-1">
              ${this.labels.noResults?.(this.input?.value)}
            </p>`
          : html`<ul class="option-list">
              ${repeat(
                this.options,
                this.optionId,
                (option) =>
                  html`<li
                    @click=${() => this.#selectOption(option, id)}
                    popovertarget="${id}"
                    tabindex="0"
                    role="button"
                    class="option"
                  >
                    ${unsafeHTML(this.renderOption(option))}
                  </li>`,
              )}
              ${this.hasMore
                ? html`<li class="show-more">
                    <button
                      @click=${() => this.#showMore()}
                      class="btn btn-ghost-primary btn-0"
                    >
                      ${this.loading
                        ? html`<span
                            class="spinner spinner-inline spinner-w-xxs"
                          ></span>`
                        : ""}${this.labels.showMore}
                    </button>
                  </li>`
                : ""}
            </ul>`}
      </div>
    `;
  }

  #selectOption(option: T, id: string) {
    this.dispatchEvent(
      new CustomEvent("option-select", {
        detail: {
          option,
        },
      }),
    );

    const popoverElement = this.querySelector<HTMLElement>(`#${id}`);
    if (popoverElement) popoverElement.hidePopover();
  }

  #showMore() {
    this.dispatchEvent(
      new CustomEvent("show-more", {
        detail: {},
      }),
    );
  }
}
