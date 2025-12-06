/**
 * appointment-row
 * Componente de fila individual de la tabla de citas
 * Renderiza datos dinámicos y emite eventos de acción
 */
class AppointmentRow extends HTMLElement {
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
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateString;
        }
    }

    updateContent() {
        if (!this.itemData || !this.shadowRoot) {
            return;
        }

        const dateCell = this.shadowRoot.querySelector('.cell-date');
        const timeCell = this.shadowRoot.querySelector('.cell-time');
        const patientCell = this.shadowRoot.querySelector('.cell-patient');
        const doctorCell = this.shadowRoot.querySelector('.cell-doctor');
        const typeCell = this.shadowRoot.querySelector('.cell-type');
        const statusCell = this.shadowRoot.querySelector('.cell-status');
        const priceCell = this.shadowRoot.querySelector('.cell-price');

        if (dateCell) dateCell.textContent = this.formatDate(this.itemData.appointment_date);
        if (timeCell) timeCell.textContent = this.itemData.appointment_time || '-';
        if (patientCell) patientCell.textContent = this.itemData.patient_info?.name || '-';
        if (doctorCell) doctorCell.textContent = this.itemData.doctor_info?.name || '-';
        if (typeCell) typeCell.textContent = this.itemData.type || '-';
        if (priceCell) priceCell.textContent = `$${this.itemData.precio_cita || 0}`;

        if (statusCell) {
            const status = this.itemData.status || 'scheduled';
            const statusClass = `status-${status.toLowerCase().replace(/ /g, '-')}`;
            statusCell.innerHTML = `
                <div class="status-badge ${statusClass}">
                    ${status}
                </div>
            `;
        }

        // Configurar event listeners después de actualizar contenido
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }

    setupEventListeners() {
        const editBtn = this.shadowRoot.querySelector('.action-edit');
        const completeBtn = this.shadowRoot.querySelector('.action-complete');
        const deleteBtn = this.shadowRoot.querySelector('.action-delete');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('edit-appointment-requested', {
                    bubbles: true, composed: true, detail: { appointmentId: this.itemData.id || this.itemData._id }
                }));
            });
        }

        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('complete-appointment-requested', {
                    bubbles: true, composed: true, detail: { appointmentId: this.itemData.id || this.itemData._id }
                }));
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('delete-appointment-requested', {
                    bubbles: true, composed: true, detail: { appointmentId: this.itemData.id || this.itemData._id, patientName: this.itemData.patient_info?.name, appointmentTime: this.itemData.appointment_time }
                }));
            });
        }
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
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

                .action-complete {
                    color: #28a745;
                }

                .action-complete:hover {
                    background: #e6ffed;
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

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    width: fit-content;
                    display: inline-block;
                }
                .status-badge.status-programada {
                    background: #fff3e0;
                    color: #e65100;
                }
                .status-badge.status-confirmada {
                    background: #e8f5e9;
                    color: #388e3c;
                }
                .status-badge.status-completada {
                    background: #e0f2f7;
                    color: #0277bd;
                }
                .status-badge.status-cancelada {
                    background: #ffebee;
                    color: #d32f2f;
                }
                .status-badge.status-reprogramada {
                    background: #ede7f6;
                    color: #5e35b1;
                }
            </style>
            <div class="table-row">
                <div class="cell cell-date">-</div>
                <div class="cell cell-time">-</div>
                <div class="cell cell-patient">-</div>
                <div class="cell cell-doctor">-</div>
                <div class="cell cell-type">-</div>
                <div class="cell cell-status">
                    <div class="status-badge">-</div>
                </div>
                <div class="cell cell-price">-</div>
                <div class="cell cell-actions">
                    <button class="action-btn action-complete" title="Marcar como Completada">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-8.16"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </button>
                    <button class="action-btn action-edit" title="Editar Cita">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn action-delete" title="Eliminar Cita">
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

customElements.define('appointment-row', AppointmentRow);


