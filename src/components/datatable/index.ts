import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import Asc from "@/assets/asc.svg?raw";
import Desc from "@/assets/desc.svg?raw";
import ArrowDown from "@/assets/arrow-down.svg?raw";

type Action<T extends object> = {
  label: string;
  class?: string;
} & (
  | {
      action: (row: T) => void | Promise<void>;
      href?: never;
    }
  | {
      href: string;
      action?: never;
    }
);

type Column<T extends object> = {
  key: string;
  title: string;
  sortable?: boolean;
  sortDirection?: () => "asc" | "desc";
} & (
  | {
      key: "actions";
      actions: (row: T) => Action<T>[];
      render?: never;
    }
  | {
      key: string;
      render?: (row: T) => string;
      actions?: never;
    }
);

type Row<T extends object> = T & {
  _rowid: string;
};

type DatatableLabels = {
  empty: string;
};

const defaultLabels: DatatableLabels = {
  empty: "No results found",
};

@customElement("pui-datatable")
export class DataTable<T extends object> extends LitElement {
  @property({ type: Array })
  columns: Column<T>[] = [];

  @property({ type: Boolean })
  hoverable = false;

  @property({ type: Boolean })
  striped = false;

  @property({ type: Boolean })
  checkable = false;

  @property({ type: Boolean })
  loading = false;

  @property({ type: Boolean })
  allCheckable = false;

  #rows: Row<T>[] = [];

  @state()
  get rows(): Row<T>[] {
    return this.#rows;
  }
  set rows(rows: T[]) {
    this.#rows = rows.map((row) => ({ ...row, _rowid: this.rowId(row) }));
    this.requestUpdate();
  }

  #labels: DatatableLabels = defaultLabels;

  @state()
  get labels() {
    return this.#labels;
  }

  set labels(labels: Partial<DatatableLabels>) {
    this.#labels = {
      ...defaultLabels,
      ...labels,
    };
    this.requestUpdate();
  }

  rowId: (row: T | Row<T>) => string = (row) =>
    (row as Row<T>)._rowid ||
    `row-${Date.now()}-${Math.ceil(Math.random() * 100000)}`;

  isSelected: (row: Row<T>) => boolean = (_) => false;

  rowActions?: (row: Row<T>) => Action<T>[];

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    const columnCount =
      this.columns.length +
      (this.rowActions ? 1 : 0) +
      (this.checkable ? 1 : 0);

    return html`
      <table
        class="table ${this.hoverable ? "table-hoverable" : ""} ${this.striped
          ? "table-striped"
          : ""}"
      >
        <thead>
          <tr>
            ${this.checkable
              ? this.allCheckable
                ? html`<th scope="col" class="select-control">
                    <input
                      type="checkbox"
                      class="checkbox"
                      @change="${this.#selectAll}"
                    />
                  </th>`
                : html`<th scope="col" class="select-control"></th>`
              : ""}
            ${this.columns.map((column) => this.#renderColumn(column))}
            ${this.rowActions &&
            html`<th scope="col" class="action-control">...</th>`}
          </tr>
        </thead>
        <tbody>
          ${!this.loading && !this.rows?.length
            ? html`<tr>
                <td
                  colspan="${columnCount}"
                  class="text-center px-2 py-1 text-3"
                >
                  ${this.labels.empty}
                </td>
              </tr>`
            : ""}
          ${!this.loading
            ? repeat(this.rows, this.rowId, (row) => {
                const actions = this.rowActions?.(row);

                return html`
                  <tr
                    data-rowid="${row._rowid}"
                    class="${this.isSelected(row) ? "selected" : ""}"
                  >
                    ${this.checkable
                      ? html`<td class="text-center">
                          <input
                            type="checkbox"
                            class="checkbox"
                            .checked=${this.isSelected(row)}
                            @change="${(event: InputEvent) =>
                              this.#selectRow(event, row)}"
                          />
                        </td>`
                      : ""}
                    ${this.columns.map((column) => {
                      return html`
                        <td>
                          ${column.render
                            ? unsafeHTML(column.render(row))
                            : row[column.key as keyof T]}
                        </td>
                      `;
                    })}
                    ${actions?.length && this.#renderActions(actions, row)}
                  </tr>
                `;
              })
            : Array.from({ length: 5 }).map(
                () =>
                  html`<tr>
                    ${Array.from({ length: columnCount }).map(
                      () => html`<td><span class="loading">&zwnj;</span></td>`,
                    )}
                  </tr>`,
              )}
        </tbody>
      </table>
    `;
  }

  #selectRow(event: InputEvent, row: Row<T>) {
    const checked = (event.target as HTMLInputElement).checked;
    this.dispatchEvent(
      new CustomEvent("row-select", {
        detail: {
          row,
          checked,
        },
      }),
    );
  }

  #selectAll(event: InputEvent) {
    const checked = (event.target as HTMLInputElement).checked;
    this.dispatchEvent(
      new CustomEvent("row-select-all", {
        detail: {
          checked,
        },
      }),
    );
  }

  #renderActions(actions: Action<T>[], row: Row<T>) {
    return html`<td>
      <button
        class="btn btn-ghost-primary btn-0"
        popovertarget="dropdown-end-row-${row._rowid}"
      >
        ${unsafeHTML(ArrowDown)}
      </button>
      <nav
        id="dropdown-end-row-${row._rowid}"
        popover
        class="dropdown dropdown-end"
      >
        <ul>
          ${actions.map((ac) => {
            if (ac.action) {
              return html`
                <li>
                  <button
                    popovertarget="dropdown-end-row-${row._rowid}"
                    class="dropdown-item  ${ac.class || ""}"
                    @click="${() => {
                      ac.action(row);
                    }}"
                  >
                    ${ac.label}
                  </button>
                </li>
              `;
            }
            return html`
              <li>
                <a class="dropdown-item ${ac.class || ""}" href="${ac.href}"
                  >${ac.label}</a
                >
              </li>
            `;
          })}
        </ul>
      </nav>
    </td>`;
  }

  #renderColumn(column: Column<T>) {
    const sortDirection = column.sortDirection?.();
    const icon =
      sortDirection === "asc"
        ? unsafeHTML(Asc)
        : sortDirection === "desc"
          ? unsafeHTML(Desc)
          : null;

    if (column.sortable) {
      return html`
        <th
          tabindex="0"
          role="button"
          scope="col"
          class="cursor-pointer focus-ring"
          @click="${() => this.#sendSortEvent(column)}"
        >
          <span class="flex items-center gap-1 w-fit"
            >${column.title}${icon}</span
          >
        </th>
      `;
    }
    return html` <th scope="col">${column.title}</th> `;
  }

  #sendSortEvent(column: Column<T>) {
    this.dispatchEvent(
      new CustomEvent("column-sort", {
        detail: {
          key: column.key,
          column,
        },
      }),
    );
  }
}

// TODO: column actions
