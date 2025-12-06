class ToastNotification extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    show(message, type = "info") {
        const toast = this.shadowRoot.querySelector(".toast");

        toast.textContent = message;

        toast.className = "toast " + type + " show";

        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #333;
                    color: white;
                    padding: 14px 20px;
                    border-radius: 8px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    font-family: 'Inter', sans-serif;
                }

                .toast.show {
                    opacity: 1;
                }

                .success {
                    background: #16a34a;
                }

                .error {
                    background: #dc2626;
                }

                .info {
                    background: #2563eb;
                }
            </style>

            <div class="toast"></div>
        `;
    }
}

customElements.define("toast-notification", ToastNotification);
