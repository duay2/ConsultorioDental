/**
 * Diálogo de confirmación
 * open() recibe message y onConfirm()
 */
class ConfirmDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.onConfirm = () => {};
    }

    connectedCallback() {
        this.render();
    }

    open({ message, onConfirm }) {
        this.shadowRoot.querySelector("#message").textContent = message;
        this.onConfirm = onConfirm;
        this.shadowRoot.querySelector(".overlay").style.display = "flex";
    }

    close() {
        this.shadowRoot.querySelector(".overlay").style.display = "none";
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            .overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.4);
                display: none; justify-content: center; align-items: center;
            }
            .box {
                background: white; padding: 20px; border-radius: 10px;
                text-align: center; width: 300px;
            }
            button { padding: 10px 16px; border: none; border-radius: 8px; }
            .confirm { background: #2563eb; color: white; }
            .cancel { background: #e5e7eb; }
        </style>

        <div class="overlay">
            <div class="box">
                <p id="message"></p>
                <button class="confirm">Confirmar</button>
                <button class="cancel">Cancelar</button>
            </div>
        </div>
        `;

        this.shadowRoot.querySelector(".cancel").onclick = () => this.close();
        this.shadowRoot.querySelector(".confirm").onclick = () => {
            this.onConfirm();
            this.close();
        };
    }
}

customElements.define("confirm-dialog", ConfirmDialog);