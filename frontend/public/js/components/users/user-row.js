/**
 * user-row
 * Componente de fila individual de la tabla de usuarios
 */
class UserRow extends HTMLElement {
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
                setTimeout(() => {
                    if (this.shadowRoot) {
                        this.updateContent();
                    }
                }, 50);
            } catch (e) {
                // Error parsing row data
            }
        }
    }

    getUserStatus() {
        if (!this.itemData) return { label: 'Activo', color: '#4caf50', bgColor: '#e8f5e9' };
        
        if (this.itemData.is_active === false) {
            return { label: 'Inactivo', color: '#f44336', bgColor: '#ffebee' };
        }
        
        return { label: 'Activo', color: '#4caf50', bgColor: '#e8f5e9' };
    }

    getRoleLabel(role) {
        const roleMap = {
            'admin': 'Administrador',
            'doctor': 'Doctor',
            'dentista': 'Dentista',
            'assistant': 'Asistente',
            'receptionist': 'Secretaria'
        };
        return roleMap[role?.toLowerCase()] || role || 'Usuario';
    }

    updateContent() {
        if (!this.itemData || !this.shadowRoot) {
            return;
        }

        const nameCell = this.shadowRoot.querySelector('.cell-name');
        const emailCell = this.shadowRoot.querySelector('.cell-email');
        const roleCell = this.shadowRoot.querySelector('.cell-role');
        const phoneCell = this.shadowRoot.querySelector('.cell-phone');
        const statusCell = this.shadowRoot.querySelector('.cell-status');

        // Nombre
        if (nameCell) {
            const name = `${this.itemData.name || ''} ${this.itemData.last_name || ''}`.trim() || 'Sin nombre';
            nameCell.textContent = name;
        }

        // Email
        if (emailCell) {
            emailCell.textContent = this.itemData.email || '-';
        }

        // Rol
        if (roleCell) {
            roleCell.textContent = this.getRoleLabel(this.itemData.role);
        }

        // Teléfono
        if (phoneCell) {
            phoneCell.textContent = this.itemData.phone || '-';
        }

        // Estado
        if (statusCell) {
            const status = this.getUserStatus();
            statusCell.innerHTML = `
                <div class="status-badge" style="background: ${status.bgColor}; color: ${status.color};">
                    ${status.label}
                </div>
            `;
        }

        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }

    setupEventListeners() {
        // Botón editar
        const editBtn = this.shadowRoot.querySelector('.action-edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('edit-user-requested', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.itemData.id || this.itemData._id,
                        user: this.itemData
                    }
                }));
            });
        }

        // Botón eliminar
        const deleteBtn = this.shadowRoot.querySelector('.action-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('delete-user-requested', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        userId: this.itemData.id || this.itemData._id,
                        userName: `${this.itemData.name || ''} ${this.itemData.last_name || ''}`.trim() || 'Usuario'
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

                .cell-name {
                    font-weight: 500;
                }

                .cell-status {
                    justify-content: center;
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

                .action-delete {
                    color: #f44336;
                }

                .action-delete:hover {
                    background: #ffebee;
                }

                .action-icon {
                    width: 18px;
                    height: 18px;
                }
            </style>
            <div class="table-row">
                <div class="cell cell-name">Cargando...</div>
                <div class="cell cell-email">-</div>
                <div class="cell cell-role">-</div>
                <div class="cell cell-phone">-</div>
                <div class="cell cell-status">
                    <div class="status-badge">-</div>
                </div>
                <div class="cell cell-actions">
                    <button class="action-btn action-edit" title="Editar">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn action-delete" title="Eliminar">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        if (this.itemData) {
            setTimeout(() => {
                this.updateContent();
            }, 0);
        }
    }
}

customElements.define('user-row', UserRow);

