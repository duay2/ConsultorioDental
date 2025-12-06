/**
 * patient-row
 * Componente de fila individual de la tabla de pacientes
 * Renderiza datos dinámicos y emite eventos de acción
 */
class PatientRow extends HTMLElement {
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
                // Siempre esperar un poco para asegurar que el DOM esté listo
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

    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            // Si la fecha viene como string ISO (con T y Z), parsearla correctamente
            // Si viene solo como fecha YYYY-MM-DD, evitar problemas de zona horaria
            let date;
            if (dateString.includes('T') || dateString.includes('Z')) {
                // Fecha ISO con zona horaria
                date = new Date(dateString);
            } else {
                // Fecha local sin zona horaria (solo YYYY-MM-DD)
                // Crear la fecha sin conversión de zona horaria
                const [year, month, day] = dateString.split('-').map(Number);
                date = new Date(year, month - 1, day); // month - 1 porque Date usa 0-based
            }

            // Formatear como DD/MM/YYYY
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth() es 0-based
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateString;
        }
    }

    getPatientStatus() {
        if (!this.itemData) return { label: 'Activo', color: '#4caf50', bgColor: '#e8f5e9' };

        // Por ahora, todos los pacientes están activos
        // Aquí se podría agregar lógica para determinar el estado basado en citas, tratamientos, etc.
        return { label: 'Activo', color: '#4caf50', bgColor: '#e8f5e9' };
    }

    updateContent() {
        if (!this.itemData) {
            return;
        }

        if (!this.shadowRoot) {
            return;
        }

        const nameCell = this.shadowRoot.querySelector('.cell-name');
        const emailCell = this.shadowRoot.querySelector('.cell-email');
        const phoneCell = this.shadowRoot.querySelector('.cell-phone');
        const birthdateCell = this.shadowRoot.querySelector('.cell-birthdate');
        const statusCell = this.shadowRoot.querySelector('.cell-status');

        // Nombre
        if (nameCell) {
            const nameEl = nameCell.querySelector('.patient-name');
            if (nameEl) {
                nameEl.textContent = this.itemData.name || 'Sin nombre';
            } else {
                nameCell.innerHTML = `<span class="patient-name">${this.itemData.name || 'Sin nombre'}</span>`;
            }
        }

        // Email
        if (emailCell) {
            emailCell.textContent = this.itemData.email || '-';
        }

        // Teléfono
        if (phoneCell) {
            phoneCell.textContent = this.itemData.phone || '-';
        }

        // Fecha de nacimiento
        if (birthdateCell) {
            birthdateCell.textContent = this.formatDate(this.itemData.birth_date);
        }

        // Estado
        if (statusCell) {
            const status = this.getPatientStatus();

            statusCell.innerHTML = `
                <div class="status-badge" style="background: ${status.bgColor}; color: ${status.color};">
                    ${status.label}
                </div>
            `;
        }

        // Configurar event listeners después de actualizar contenido
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }

    setupEventListeners() {
        // Botón editar
        const editBtn = this.shadowRoot.querySelector('.action-edit');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('edit-patient-requested', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.itemData.id || this.itemData._id,
                        patient: this.itemData
                    }
                }));
            });
        }

        // Botón ver citas
        const appointmentsBtn = this.shadowRoot.querySelector('.action-appointments');
        if (appointmentsBtn) {
            appointmentsBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('view-patient-appointments', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        patientId: this.itemData.id || this.itemData._id,
                        patient: this.itemData
                    }
                }));
            });
        }

        // Botón eliminar paciente
        const deleteBtn = this.shadowRoot.querySelector('.action-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('delete-patient-requested', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        patientId: this.itemData.id || this.itemData._id,
                        patientName: this.itemData.name
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
                    gap: 0.75rem;
                }

                .patient-name {
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

                .action-appointments {
                    color: #03a9f4; /* Un azul más apropiado para citas */
                }

                .action-appointments:hover {
                    background: #e1f5fe; /* Fondo azul claro */
                }

                .action-delete {
                    color: #f44336; /* Rojo para eliminar */
                }

                .action-delete:hover {
                    background: #ffebee; /* Fondo rojo claro */
                }

                .action-icon {
                    width: 18px;
                    height: 18px;
                }
            </style>
            <div class="table-row">
                <div class="cell cell-name">
                    <span class="patient-name">Cargando...</span>
                </div>
                <div class="cell cell-email">-</div>
                <div class="cell cell-phone">-</div>
                <div class="cell cell-birthdate">-</div>
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
                    <button class="action-btn action-appointments" title="Ver Citas">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                    <button class="action-btn action-delete" title="Eliminar Paciente">
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

        // Si ya hay datos, actualizar el contenido después de renderizar
        if (this.itemData) {
            setTimeout(() => {
                this.updateContent();
            }, 0);
        }
    }
}

customElements.define('patient-row', PatientRow);
