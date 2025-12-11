/**
 * user-table
 * Componente de tabla para mostrar usuarios
 */
class UserTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.items = [];
    }

    static get observedAttributes() {
        return ['data-items'];
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener('delete-user-requested', (e) => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('delete-user-requested', {
                bubbles: true,
                composed: true,
                detail: e.detail
            }));
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-items' && newValue) {
            try {
                this.items = JSON.parse(newValue);
                this.updateRows();
            } catch (e) {
                this.items = [];
                this.updateRows();
            }
        }
    }

    updateRows() {
        const tbody = this.shadowRoot.querySelector('#table-body');
        if (!tbody) {
            return;
        }

        tbody.innerHTML = '';

        this.items.forEach((item, index) => {
            const row = document.createElement('user-row');
            row.setAttribute('data-item', JSON.stringify(item));
            tbody.appendChild(row);
        });

        if (this.items.length === 0) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'empty-message';
            emptyRow.textContent = 'No hay usuarios registrados';
            tbody.appendChild(emptyRow);
        }
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .user-table {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr 1.5fr;
                    gap: 0;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    grid-auto-rows: auto;
                }

                .table-header {
                    display: contents;
                }

                .header-cell {
                    padding: 1rem;
                    background: #f8f9fa;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #333;
                    border-bottom: 2px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .header-cell:first-child {
                    border-top-left-radius: 8px;
                }

                .header-cell:last-child {
                    border-top-right-radius: 8px;
                }

                .table-body {
                    display: contents;
                }

                .empty-message {
                    grid-column: 1 / -1;
                    padding: 3rem;
                    text-align: center;
                    color: #999;
                    font-size: 1rem;
                }
            </style>
            <div class="user-table">
                <div class="table-header">
                    <div class="header-cell">Nombre</div>
                    <div class="header-cell">Email</div>
                    <div class="header-cell">Rol</div>
                    <div class="header-cell">Teléfono</div>
                    <div class="header-cell">Estado</div>
                    <div class="header-cell">Acciones</div>
                </div>
                <div class="table-body" id="table-body">
                    <!-- Las filas se insertan aquí dinámicamente -->
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('user-table', UserTable);

