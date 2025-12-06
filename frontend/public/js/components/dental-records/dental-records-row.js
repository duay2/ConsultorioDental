/**
 * dental-records-row
 * Componente de fila individual de la tabla de registros dentales
 * Renderiza datos dinámicos y emite eventos de acción
 */
class DentalRecordsRow extends HTMLElement {
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

    updateContent() {
        if (!this.itemData) {
            return;
        }

        if (!this.shadowRoot) {
            return;
        }

        const patientCell = this.shadowRoot.querySelector('.cell-patient');
        const treatmentCell = this.shadowRoot.querySelector('.cell-treatment');
        const descriptionCell = this.shadowRoot.querySelector('.cell-description');
        const dateCell = this.shadowRoot.querySelector('.cell-date');
        const doctorCell = this.shadowRoot.querySelector('.cell-doctor');

        // Paciente
        if (patientCell) {
            const patientName = this.itemData.patient_info?.name || 'Paciente desconocido';
            patientCell.textContent = patientName;
        }

        // Tipo de tratamiento
        if (treatmentCell) {
            const typeMap = {
                'general': 'General',
                'emergency': 'Emergencia',
                'orthodontics': 'Ortodoncia',
                'surgery': 'Cirugía',
                'cleaning': 'Limpieza'
            };
            treatmentCell.textContent = typeMap[this.itemData.record_type || this.itemData.treatment_type] ||
                                      (this.itemData.record_type || this.itemData.treatment_type || '-');
        }

        // Descripción
        if (descriptionCell) {
            const description = this.itemData.description || '';
            descriptionCell.textContent = description.length > 40 ?
                description.substring(0, 40) + '...' : description;
            descriptionCell.title = description; // Mostrar descripción completa en tooltip
        }

        // Diagnóstico
        const diagnosisCell = this.shadowRoot.querySelector('.cell-diagnosis');
        if (diagnosisCell) {
            const diagnosis = this.itemData.diagnosis || '';
            diagnosisCell.textContent = diagnosis.length > 40 ?
                diagnosis.substring(0, 40) + '...' : diagnosis;
            diagnosisCell.title = diagnosis; // Mostrar diagnóstico completo en tooltip
        }

        // Fecha
        if (dateCell) {
            dateCell.textContent = this.formatDate(this.itemData.created_at || this.itemData.date);
        }

        // Costo
        const costCell = this.shadowRoot.querySelector('.cell-cost');
        if (costCell) {
            const cost = this.itemData.treatment_cost || this.itemData.cost || 0;
            costCell.textContent = cost > 0 ? `$${cost.toLocaleString()}` : '-';
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
                this.dispatchEvent(new CustomEvent('edit-record-requested', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.itemData.id || this.itemData._id,
                        record: this.itemData
                    }
                }));
            });
        }

        // Botón eliminar
        const deleteBtn = this.shadowRoot.querySelector('.action-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('delete-record-requested', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        recordId: this.itemData.id || this.itemData._id,
                        patientName: this.itemData.patient_info?.name || 'Paciente desconocido',
                        description: this.itemData.description || 'Registro dental'
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

                .cell-patient {
                    font-weight: 500;
                }

                .cell-description,
                .cell-diagnosis {
                    max-width: 200px;
                }

                .cell-date {
                    font-size: 0.85rem;
                    color: #666;
                }

                .cell-cost {
                    font-weight: 600;
                    color: #2e7d32;
                    text-align: right;
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
                    color: #e53935;
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
                <div class="cell cell-patient">
                    <span>Cargando...</span>
                </div>
                <div class="cell cell-treatment">-</div>
                <div class="cell cell-description">-</div>
                <div class="cell cell-diagnosis">-</div>
                <div class="cell cell-date">-</div>
                <div class="cell cell-cost">-</div>
                <div class="cell cell-actions">
                    <button class="action-btn action-edit" title="Editar">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn action-delete" title="Eliminar">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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

customElements.define('dental-records-row', DentalRecordsRow);
