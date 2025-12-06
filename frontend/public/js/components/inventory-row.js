/**
 * inventory-row
 * Componente de fila individual de la tabla de inventario
 * Renderiza datos dinámicos y emite eventos de acción
 */
class InventoryRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.itemData = null;
    }

    static get observedAttributes() {
        return ['data-item'];
    }

    connectedCallback() {
        this.render();
        // Si ya hay datos, actualizar el contenido después de renderizar
        if (this.itemData) {
            setTimeout(() => {
                this.updateContent();
            }, 0);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-item' && newValue) {
            try {
                this.itemData = JSON.parse(newValue);
                console.log('Inventory row recibió datos:', this.itemData);
                // Siempre esperar un poco para asegurar que el DOM esté listo
                setTimeout(() => {
                    if (this.shadowRoot) {
                        this.updateContent();
                    }
                }, 50);
            } catch (e) {
                console.error('Error parsing row data:', e);
                console.error('Raw data:', newValue);
            }
        }
    }

    calculateStockStatus() {
        if (!this.itemData) return { level: 'low', label: 'Bajo', color: '#f44336', maxStock: 100 };

        const { current_stock, min_stock } = this.itemData;
        // Si no hay max_stock, calcularlo basado en el stock actual y min_stock
        // O usar un valor por defecto razonable
        let maxStock = this.itemData.max_stock;
        if (!maxStock) {
            // Calcular max_stock como 2-3 veces el min_stock o usar el current_stock más alto
            maxStock = min_stock > 0 ? min_stock * 3 : Math.max(current_stock * 2, 100);
        }
        
        const percentage = maxStock > 0 ? (current_stock / maxStock) * 100 : 0;

        if (current_stock <= min_stock) {
            return { level: 'low', label: 'Bajo (Rojo)', color: '#f44336', bgColor: '#fee', maxStock };
        } else if (percentage < 50) {
            return { level: 'medium', label: 'Medio', color: '#ff9800', bgColor: '#fff3e0', maxStock };
        } else {
            return { level: 'high', label: 'Alto (Verde)', color: '#4caf50', bgColor: '#e8f5e9', maxStock };
        }
    }

    getProductIcon(category) {
        // Sin emojis, solo retornar string vacío o usar un icono SVG si es necesario
        return '';
    }

    updateContent() {
        if (!this.itemData) {
            console.warn('No hay itemData para actualizar');
            return;
        }

        if (!this.shadowRoot) {
            console.warn('ShadowRoot no está disponible');
            return;
        }

        console.log('Actualizando contenido de fila con:', this.itemData);

        const productCell = this.shadowRoot.querySelector('.cell-product');
        const categoryCell = this.shadowRoot.querySelector('.cell-category');
        const supplierCell = this.shadowRoot.querySelector('.cell-supplier');
        const stockCell = this.shadowRoot.querySelector('.cell-stock');
        const statusCell = this.shadowRoot.querySelector('.cell-status');
        const actionsCell = this.shadowRoot.querySelector('.cell-actions');

        console.log('Celdas encontradas:', {
            product: !!productCell,
            category: !!categoryCell,
            supplier: !!supplierCell,
            stock: !!stockCell,
            status: !!statusCell
        });

        // Producto
        if (productCell) {
            const nameEl = productCell.querySelector('.product-name');
            if (nameEl) {
                nameEl.textContent = this.itemData.name || 'Sin nombre';
            } else {
                productCell.innerHTML = `<span class="product-name">${this.itemData.name || 'Sin nombre'}</span>`;
            }
        } else {
            console.error('productCell no encontrado en updateContent');
        }

        // Categoría
        if (categoryCell) {
            categoryCell.textContent = this.itemData.category || '-';
        }

        // Proveedor
        if (supplierCell) {
            supplierCell.textContent = this.itemData.supplier || '-';
        }

        // Stock
        if (stockCell) {
            const status = this.calculateStockStatus();
            stockCell.textContent = `${this.itemData.current_stock || 0} / ${status.maxStock}`;
        }

        // Estado
        if (statusCell) {
            const status = this.calculateStockStatus();
            const percentage = status.maxStock > 0 
                ? ((this.itemData.current_stock || 0) / status.maxStock) * 100 
                : 0;
            
            statusCell.innerHTML = `
                <div class="status-content">
                    <div class="status-bar-container">
                        <div class="status-bar" style="width: ${percentage}%; background: ${status.color};"></div>
                    </div>
                    <div class="status-badge" style="background: ${status.bgColor}; color: ${status.color};">
                        ${status.label}
                    </div>
                </div>
            `;
        }

        // Acciones - los botones ya están en el template
    }

    setupEventListeners() {
        // Botón editar
        const editBtn = this.shadowRoot.querySelector('.action-edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('edit-product-requested', {
                    bubbles: true,
                    composed: true,
                    detail: { 
                        id: this.itemData.id || this.itemData._id,
                        product: this.itemData
                    }
                }));
            });
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

                :host {
                    display: contents;
                }

                .table-row {
                    display: contents;
                }

                .cell {
                    padding: 1rem;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    font-size: 0.9rem;
                    color: #333;
                }

                .cell-product {
                    gap: 0.75rem;
                }

                .product-name {
                    font-weight: 500;
                }

                .cell-status {
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                }

                .status-content {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .status-bar-container {
                    width: 100%;
                    height: 4px;
                    background: #e0e0e0;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .status-bar {
                    height: 100%;
                    transition: width 0.3s ease;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    width: fit-content;
                }

                .cell-actions {
                    gap: 0.5rem;
                    justify-content: center;
                }

                .action-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                    background: transparent;
                }

                .action-btn:hover {
                    transform: scale(1.1);
                    opacity: 0.8;
                }

                .action-edit {
                    color: #4A90E2;
                }

                .action-edit:hover {
                    background: #e3f2fd;
                }

                .action-increase {
                    color: #4caf50;
                }

                .action-increase:hover {
                    background: #e8f5e9;
                }

                .action-decrease {
                    color: #f44336;
                }

                .action-decrease:hover {
                    background: #fee;
                }

                .action-icon {
                    width: 18px;
                    height: 18px;
                }
            </style>
            <div class="table-row">
                <div class="cell cell-product">
                    <span class="product-name">Cargando...</span>
                </div>
                <div class="cell cell-category">-</div>
                <div class="cell cell-supplier">-</div>
                <div class="cell cell-stock">-</div>
                <div class="cell cell-status">
                    <div class="status-content">
                        <div class="status-bar-container">
                            <div class="status-bar" style="width: 0%;"></div>
                        </div>
                        <div class="status-badge">-</div>
                    </div>
                </div>
                <div class="cell cell-actions">
                    <button class="action-btn action-edit" title="Editar">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        // Si ya hay datos, actualizar el contenido después de renderizar
        if (this.itemData) {
            setTimeout(() => {
                this.updateContent();
            }, 0);
        }
        
        // Configurar event listeners después de renderizar
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }
}

customElements.define('inventory-row', InventoryRow);

