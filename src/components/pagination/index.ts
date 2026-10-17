import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";


type PaginationLabels = {
    indicator: (start: number, end: number, total: number) => string,
    pageSize: (size: number) => string
    next: string,
    previous: string
}

const defaultLabels: PaginationLabels = {
    indicator: (start, end, total) => `${start} - ${end} / ${total}`,
    pageSize: (size) => `${size} / page`,
    next: "Next",
    previous: "Previous"
}


@customElement("pui-pagination")
export class Pagination extends LitElement {
    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    @state()
    pageSizes: number[] = [10, 20, 50, 100];

    #labels: PaginationLabels = defaultLabels

    @state()
    get labels() {
        return this.#labels
    }

    set labels(labels: Partial<PaginationLabels>) {
        this.#labels = {
            ...defaultLabels,
            ...labels
        }
        this.requestUpdate()
    }

    @property({ type: Number })
    pageSize = 10;

    @property({ type: Number })
    currentPage = 1;

    @property({ type: Number })
    totalItems = 0;

    get totalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    render() {
        return html`<div class="flex p-sm justify-center items-center">
            <button class="btn btn-ghost-primary" @click=${() => this.previousPage()}>${this.#renderPrevious()}</button>
            <span class="mx-sm">${this.#renderIndicator()}</span>
            <button class="btn btn-ghost-primary" @click=${() => this.nextPage()}>${this.#renderNext()}</button>
            <select class="ml-sm select w-fit" @change=${(e: Event) => this.setPageSize(parseInt((e.target as HTMLSelectElement).value))}>
                ${this.pageSizes.map((size) => html`<option ?selected=${size === this.pageSize}>${this.#renderPageSize(size)}</option>`)}
            </select>
        <div>`;
    }

    #renderIndicator() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.totalItems, this.currentPage * this.pageSize);
        return this.labels.indicator ? this.labels.indicator(start, end, this.totalItems) : defaultLabels.indicator(start, end, this.totalItems);
    }

    #renderPageSize(size: number) {
        return this.labels.pageSize ? this.labels.pageSize(size) : defaultLabels.pageSize(size);
    }

    #renderNext() {
        return this.labels.next ? this.labels.next : defaultLabels.next;
    }

    #renderPrevious() {
        return this.labels.previous ? this.labels.previous : defaultLabels.previous;
    }

    nextPage() {
        this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
    }

    previousPage() {
        this.currentPage = Math.max(1, this.currentPage - 1);
    }

    setPageSize(size: number) {
        this.pageSize = size;
        this.currentPage = 1;
    }
}