/**
 * inventory-modal
 * Modal para crear o editar un producto de inventario
 */
class InventoryModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._editingProduct = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    open(product = null) {
        this._editingProduct = product;
        this.updateForm();
        this.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.style.display = 'none';
        document.body.style.overflow = '';
        
        // Limpiar formulario
        const form = this.shadowRoot.querySelector('.product-form');
        if (form) form.reset();
        
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }
        
        this._editingProduct = null;
    }

    updateForm() {
        const form = this.shadowRoot.querySelector('.product-form');
        if (!form) return;

        if (this._editingProduct) {
            // Modo edición
            form.querySelector('#name-input').value = this._editingProduct.name || '';
            form.querySelector('#category-select').value = this._editingProduct.category || '';
            form.querySelector('#description-textarea').value = this._editingProduct.description || '';
            form.querySelector('#current-stock-input').value = this._editingProduct.current_stock || 0;
            form.querySelector('#min-stock-input').value = this._editingProduct.min_stock || 0;
            form.querySelector('#cost-input').value = this._editingProduct.cost_per_unit || 0;
            form.querySelector('#supplier-input').value = this._editingProduct.supplier || '';
            
            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Editar Producto';
            
            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Actualizar Producto';
        } else {
            // Modo creación
            form.reset();
            
            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Nuevo Producto';
            
            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Crear Producto';
        }
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');
        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const form = this.shadowRoot.querySelector('.product-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Cerrar al hacer clic fuera del modal
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
    }

    async handleSubmit() {
        const form = this.shadowRoot.querySelector('.product-form');
        if (!form) return;

        const formData = new FormData(form);
        const productData = {
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description') || '',
            current_stock: parseInt(formData.get('current_stock')) || 0,
            min_stock: parseInt(formData.get('min_stock')) || 0,
            cost_per_unit: parseFloat(formData.get('cost_per_unit')) || 0,
            supplier: formData.get('supplier') || ''
        };

        // Validación
        if (!productData.name || !productData.category) {
            this.showError('Por favor, complete todos los campos requeridos (Nombre y Categoría).');
            return;
        }

        if (productData.current_stock < 0 || productData.min_stock < 0) {
            this.showError('El stock no puede ser negativo.');
            return;
        }

        if (productData.cost_per_unit < 0) {
            this.showError('El costo no puede ser negativo.');
            return;
        }

        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this._editingProduct ? 'Actualizando...' : 'Creando...';
            if (errorMsg) errorMsg.textContent = '';

            const inventoryService = await import('../../services/inventory-service.js');
            
            let result;
            if (this._editingProduct) {
                // Asegurar que el ID sea un número
                const productId = parseInt(this._editingProduct.id || this._editingProduct._id);
                result = await inventoryService.default.updateInventoryItem(productId, productData);
            } else {
                result = await inventoryService.default.createInventoryItem(productData);
            }

            // Despachar evento de éxito
            this.dispatchEvent(new CustomEvent('product-saved', {
                bubbles: true,
                composed: true,
                detail: { product: result, isEdit: !!this._editingProduct }
            }));

            this.close();
        } catch (error) {
            const errorMessage = error.message || 'Error al guardar el producto. Por favor, intente nuevamente.';
            this.showError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this._editingProduct ? 'Actualizar Producto' : 'Crear Producto';
        }
    }

    showError(message) {
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
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
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }

                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1001;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .modal-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 28px;
                    color: #666;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .close-btn:hover {
                    background: #f0f0f0;
                }

                .modal-body {
                    padding: 24px;
                }

                .product-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-label {
                    font-weight: 500;
                    color: #333;
                    font-size: 14px;
                }

                .form-label .required {
                    color: #e53935;
                }

                .form-input,
                .form-select,
                .form-textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }

                .form-input:focus,
                .form-select:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: #2196F3;
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .error-message {
                    display: none;
                    padding: 12px;
                    background: #ffebee;
                    color: #c62828;
                    border-radius: 6px;
                    font-size: 14px;
                    margin-top: 8px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 24px;
                    border-top: 1px solid #e0e0e0;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn {
                    background: #f5f5f5;
                    color: #333;
                }

                .cancel-btn:hover {
                    background: #e0e0e0;
                }

                .submit-btn {
                    background: #2196F3;
                    color: white;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #1976D2;
                }

                .submit-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
            </style>

            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Nuevo Producto</h2>
                    <button class="close-btn" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="product-form">
                        <div class="form-group">
                            <label class="form-label" for="name-input">
                                Nombre del Producto <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                class="form-input" 
                                id="name-input" 
                                name="name" 
                                required
                                placeholder="Ej: Brackets Metálicos"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="category-select">
                                Categoría <span class="required">*</span>
                            </label>
                            <select class="form-select" id="category-select" name="category" required>
                                <option value="">Seleccione una categoría</option>
                                <option value="Brackets">Brackets</option>
                                <option value="Materiales">Materiales</option>
                                <option value="Desechables">Desechables</option>
                                <option value="Equipos">Equipos</option>
                                <option value="Instrumentos">Instrumentos</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="description-textarea">
                                Descripción
                            </label>
                            <textarea 
                                class="form-textarea" 
                                id="description-textarea" 
                                name="description" 
                                placeholder="Descripción del producto..."
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="current-stock-input">
                                Stock Actual
                            </label>
                            <input 
                                type="number" 
                                class="form-input" 
                                id="current-stock-input" 
                                name="current_stock" 
                                min="0"
                                value="0"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="min-stock-input">
                                Stock Mínimo
                            </label>
                            <input 
                                type="number" 
                                class="form-input" 
                                id="min-stock-input" 
                                name="min_stock" 
                                min="0"
                                value="0"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="cost-input">
                                Costo por Unidad
                            </label>
                            <input 
                                type="number" 
                                class="form-input" 
                                id="cost-input" 
                                name="cost_per_unit" 
                                min="0"
                                step="0.01"
                                value="0"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="supplier-input">
                                Proveedor
                            </label>
                            <input 
                                type="text" 
                                class="form-input" 
                                id="supplier-input" 
                                name="supplier" 
                                placeholder="Nombre del proveedor"
                            />
                        </div>

                        <div class="error-message"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn cancel-btn">Cancelar</button>
                    <button type="button" class="btn submit-btn">Crear Producto</button>
                </div>
            </div>
        `;
    }
}

customElements.define('inventory-modal', InventoryModal);

