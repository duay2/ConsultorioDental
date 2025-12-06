class ConfirmationModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.resolvePromise = null;
        this.rejectPromise = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                }
                .modal-content {
                    background: #ffffff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    width: 90%;
                    max-width: 450px;
                    text-align: center;
                    animation: fadeIn 0.3s ease-out;
                    color: #333;
                }
                .modal-icon {
                    color: #FFC107;
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                .modal-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                    color: #1a1a1a;
                }
                .modal-message {
                    font-size: 1rem;
                    line-height: 1.5;
                    margin-bottom: 30px;
                    color: #555;
                }
                .modal-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }
                .btn {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-cancel {
                    background: #e0e0e0;
                    color: #333;
                }
                .btn-cancel:hover {
                    background: #cccccc;
                }
                .btn-confirm {
                    background: #e53935;
                    color: white;
                }
                .btn-confirm:hover {
                    background: #c62828;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
            <div class="modal-content">
                <div class="modal-icon">&#9888;</div> <!-- Warning sign icon -->
                <h3 class="modal-title">Confirmar Acción</h3>
                <p class="modal-message">¿Estás seguro de que quieres realizar esta acción?</p>
                <div class="modal-actions">
                    <button class="btn btn-cancel">Cancelar</button>
                    <button class="btn btn-confirm">Confirmar</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.querySelector('.btn-cancel').addEventListener('click', () => this.cancel());
        this.shadowRoot.querySelector('.btn-confirm').addEventListener('click', () => this.confirm());
        this.addEventListener('click', (e) => {
            if (e.target === this) {
                this.cancel();
            }
        });
    }

    open(title = 'Confirmar Acción', message = '¿Estás seguro de que quieres realizar esta acción?') {
        this.shadowRoot.querySelector('.modal-title').textContent = title;
        this.shadowRoot.querySelector('.modal-message').textContent = message;
        this.style.display = 'flex';
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    close() {
        this.style.display = 'none';
    }

    confirm() {
        if (this.resolvePromise) {
            this.resolvePromise(true);
        }
        this.close();
    }

    cancel() {
        if (this.resolvePromise) {
            this.resolvePromise(false);
        }
        this.close();
    }
}

customElements.define('confirmation-modal', ConfirmationModal);
