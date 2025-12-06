/**
 * inventory-table
 * Componente de tabla para mostrar items de inventario
 * Usa CSS Grid para el layout
 */
class InventoryTable extends HTMLElement {
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

        // Limpiar filas existentes
        tbody.innerHTML = '';

        // Crear filas para cada item
        this.items.forEach((item, index) => {
            const row = document.createElement('inventory-row');
            row.setAttribute('data-item', JSON.stringify(item));
            tbody.appendChild(row);
        });

        // Si no hay items, mostrar mensaje
        if (this.items.length === 0) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'empty-message';
            emptyRow.textContent = 'No hay productos en el inventario';
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

                .inventory-table {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1fr;
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

                .sort-icon {
                    width: 16px;
                    height: 16px;
                    opacity: 0.5;
                    cursor: pointer;
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
            <div class="inventory-table">
                <div class="table-header">
                    <div class="header-cell">
                        <span>Producto</span>
                        <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M7 12h10M11 18h2"></path>
                        </svg>
                    </div>
                    <div class="header-cell">Categoría</div>
                    <div class="header-cell">Proveedor</div>
                    <div class="header-cell">Stock Actual</div>
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

customElements.define('inventory-table', InventoryTable);

