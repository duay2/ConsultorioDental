/**
 * inventory-view
 * Vista principal de gestión de inventario
 * Contenedor que orquesta la tabla, filtros y acciones
 */
class InventoryView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.inventoryData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentCategory = 'all';
    }

    static get observedAttributes() {
        return ['data-inventory'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // Esperar a que el DOM esté listo antes de cargar datos
        setTimeout(() => {
            this.loadInventoryData();
        }, 100);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-inventory' && newValue) {
            try {
                this.inventoryData = JSON.parse(newValue);
                this.applyFilters();
            } catch (e) {
                console.error('Error parsing inventory data:', e);
            }
        }
    }

    async loadInventoryData() {
        try {
            console.log('Cargando datos de inventario...');
            const dashboardService = (await import('../services/dashboard-service.js')).default;
            const headers = await dashboardService.getAuthHeader();
            console.log('Headers:', headers);
            
            const response = await fetch('http://localhost:3000/api/inventory?page=1&limit=100', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error al obtener inventario: ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);
            console.log('Items:', data.data);
            
            this.inventoryData = data.data || [];
            console.log('Inventory data asignado:', this.inventoryData.length, 'items');
            
            // Llenar categorías después de obtener datos
            const categories = this.getCategories();
            const select = this.shadowRoot.querySelector('#category-filter');
            if (select) {
                // Limpiar opciones existentes (excepto "Todas")
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    select.appendChild(option);
                });
            }
            
            this.applyFilters();
        } catch (error) {
            console.error('Error cargando datos de inventario:', error);
            this.inventoryData = [];
            this.applyFilters();
        }
    }

    applyFilters() {
        this.filteredData = this.currentCategory === 'all' 
            ? [...this.inventoryData]
            : this.inventoryData.filter(item => item.category === this.currentCategory);
        
        console.log('Filtros aplicados. Datos filtrados:', this.filteredData.length);
        
        // Esperar un momento para asegurar que los componentes hijos estén listos
        setTimeout(() => {
            this.updateTable();
        }, 50);
    }

    setupEventListeners() {
        // Botón nuevo producto
        const newProductBtn = this.shadowRoot.querySelector('#new-product-btn');
        if (newProductBtn) {
            newProductBtn.addEventListener('click', () => {
                const modal = this.shadowRoot.querySelector('inventory-modal');
                if (modal) {
                    modal.open();
                }
            });
        }

        // Filtro de categoría
        const categoryFilter = this.shadowRoot.querySelector('#category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Eventos de la tabla - editar producto
        this.shadowRoot.addEventListener('edit-product-requested', (e) => {
            this.handleEditProduct(e.detail);
        });

        // Evento de producto guardado
        this.shadowRoot.addEventListener('product-saved', () => {
            this.loadInventoryData();
        });
    }

    handleEditProduct(detail) {
        const modal = this.shadowRoot.querySelector('inventory-modal');
        if (modal && detail.product) {
            modal.open(detail.product);
        }
    }

    updateTable() {
        console.log('updateTable llamado');
        console.log('Filtered data:', this.filteredData.length, 'items');
        
        // Intentar encontrar la tabla, si no existe, esperar un poco más
        let table = this.shadowRoot.querySelector('inventory-table');
        if (!table) {
            console.warn('Tabla no encontrada, esperando...');
            setTimeout(() => {
                this.updateTable();
            }, 100);
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        console.log('Datos de página:', pageData.length, 'items');
        console.log('Datos a pasar a la tabla:', pageData);
        
        if (pageData.length > 0) {
            console.log('Primer item de ejemplo:', pageData[0]);
        }
        
        table.setAttribute('data-items', JSON.stringify(pageData));

        // Actualizar paginación
        const pagination = this.shadowRoot.querySelector('table-pagination');
        if (pagination) {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
            pagination.setAttribute('current-page', this.currentPage.toString());
            pagination.setAttribute('total-pages', totalPages.toString());
        } else {
            console.warn('Paginación no encontrada');
        }
    }

    handlePageChange(e) {
        this.currentPage = e.detail.page;
        this.updateTable();
    }

    getCategories() {
        const categories = new Set(this.inventoryData.map(item => item.category));
        return Array.from(categories).sort();
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

                .inventory-view {
                    min-height: 100vh;
                    background: #f5f5f5;
                    padding: 2rem;
                }

                .view-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .view-title {
                    font-size: 2rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .new-product-btn {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .new-product-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
                }

                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .filter-label {
                    font-size: 0.95rem;
                    color: #666;
                    font-weight: 500;
                }

                .filter-select {
                    padding: 0.5rem 1rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    background: white;
                    cursor: pointer;
                    transition: border-color 0.3s ease;
                }

                .filter-select:focus {
                    outline: none;
                    border-color: #4A90E2;
                }

                .table-container {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
            </style>
            <div class="inventory-view">
                <div class="view-header">
                    <h1 class="view-title">Gestión de Inventario</h1>
                    <div class="header-actions">
                        <button id="new-product-btn" class="new-product-btn">
                            <span>+</span>
                            <span>Nuevo Producto</span>
                        </button>
                        <div class="filter-group">
                            <label class="filter-label">Categoría:</label>
                            <select id="category-filter" class="filter-select">
                                <option value="all">Todas</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <inventory-table></inventory-table>
                    <table-pagination></table-pagination>
                </div>
                <inventory-modal></inventory-modal>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Event listener para paginación
        this.shadowRoot.addEventListener('page-change', (e) => {
            this.handlePageChange(e);
        });

        // Event listener para editar producto
        this.shadowRoot.addEventListener('edit-product-requested', (e) => {
            this.handleEditProduct(e.detail);
        });

        // Event listener para producto guardado
        this.shadowRoot.addEventListener('product-saved', (e) => {
            console.log('Producto guardado, recargando datos...', e.detail);
            // Esperar un poco para asegurar que el backend haya procesado la actualización
            setTimeout(() => {
                this.loadInventoryData();
            }, 300);
        });
    }

    handleEditProduct(detail) {
        const modal = this.shadowRoot.querySelector('inventory-modal');
        if (modal && detail.product) {
            modal.open(detail.product);
        }
    }
}

customElements.define('inventory-view', InventoryView);

