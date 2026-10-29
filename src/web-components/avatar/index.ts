import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('pui-avatar')
export class Avatar extends LitElement {
  @property({ type: String })
  text: string = '';

  @property({ type: String })
  src: string = '';

  @property({ type: String })
  color: string = 'secondary';

  @property({ type: String })
  size: string = '1';

  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <div class="avatar avatar-${this.color} avatar-${this.size}">
        ${this.src ? html`<img src="${this.src}" @error="${() => this.src = ''}">` : html`<span>${this.#getInitials(this.text)}</span>`}
      </div>
    `;
  }

  #getInitials(text: string) {
    return text
      .match(/\b\w/g) || []
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

}