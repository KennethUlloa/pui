import Eye from "@/assets/eye.svg?raw";
import EyeClosed from "@/assets/eye-closed.svg?raw";
import { customElement } from "lit/decorators.js";


@customElement('pui-password-visibility')
export class TogglePasswordButton extends HTMLElement {
    #targetInput: HTMLInputElement | null = null
    #visible = false;

    static observedAttributes = ['visible'];

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        console.log(name, oldValue, newValue)
        if (name === "visible") {
            this.visible = newValue !== null;
        }
    }

    connectedCallback() {
        this.style.display = 'flex';
        this.style.justifyContent = 'center';
        this.style.alignItems = 'center';

        if (!this.hasAttribute('visible')) {    
            this.visible = false;
        }

        this.addEventListener('click', () => {
            this.visible = !this.visible;
        });
    }

    set visible(value: boolean) {
        this.#visible = !!value;
        this.innerHTML = '<button class="password-toggle ghost-hover">' + (value ? Eye : EyeClosed) + "</button>";
        if (this.target) {
            this.target.type = value ? "text" : "password";
        }
    }

    get visible() {
        return this.#visible;
    }

    get target() {
        if (!this.#targetInput) {
            this.#targetInput = document.getElementById(this.getAttribute("target") ?? "password") as HTMLInputElement;
        }
        return this.#targetInput;
    }
}

