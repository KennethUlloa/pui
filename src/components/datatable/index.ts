import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

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

  #rows: Row<T>[] = [];

  @state()
  get rows(): Row<T>[] {
    return this.#rows;
  }
  set rows(rows: T[]) {
    this.#rows = rows.map((row) => ({ ...row, _rowid: this.rowId(row) }));
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
    return html`
      <table
        class="table ${this.hoverable ? "table-hoverable" : ""} ${this.striped
          ? "table-striped"
          : ""}"
      >
        <thead>
          <tr>
            ${this.checkable
              ? html`<th scope="col"><input type="checkbox" class="checkbox" @change="${this.#selectAll}"></th></th>`
              : ""}
            ${this.columns.map(
              (column) => html` <th scope="col">${column.title}</th> `,
            )}
            ${this.rowActions &&
            html`<th scope="col" style="width: 4em; text-align: center">
              ...
            </th>`}
          </tr>
        </thead>
        <tbody>
          ${repeat(this.rows, this.rowId, (row) => {
            const actions = this.rowActions?.(row);

            return html`
              <tr
                data-rowid="${row._rowid}"
                class="${this.isSelected(row) ? "selected" : ""}"
              >
                ${this.checkable
                  ? html`<td>
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
          })}
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
        class="btn btn-ghost-primary btn-sm"
        popovertarget="dropdown-end-row-${row._rowid}"
      >
        <svg
          width="1.5em"
          height="1.5em"
          stroke="currentColor"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
              fill="currentColor"
            ></path>
          </g>
        </svg>
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
}

// TODO: column actions