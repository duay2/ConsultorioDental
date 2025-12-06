/**
 * patient-view
 * Vista principal de gestión de pacientes
 * Contenedor que orquesta la tabla, filtros y acciones
 */
class PatientView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.patientData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSearch = '';
        this._patientModalInstance = null;
        this._confirmationModalInstance = null; // Declaración de la instancia del modal de confirmación
    }

    static get observedAttributes() {
        return ['data-patients'];
    }

    connectedCallback() {
        this.render();
        // Retrasar la configuración de event listeners y carga de datos
        // para asegurar que los custom elements hijos estén listos
        // Eliminamos el setTimeout y confiamos en customElements.whenDefined en los manejadores de eventos
        this._patientModalInstance = this.shadowRoot.querySelector('patient-modal');
        this._viewAppointmentsModalInstance = this.shadowRoot.querySelector('view-appointments-modal');
        this._confirmationModalInstance = this.shadowRoot.querySelector('confirmation-modal'); // Usar nuestro modal generico
        console.log('[PatientView] _confirmationModalInstance en connectedCallback:', this._confirmationModalInstance);
        this.setupEventListeners();
        this.loadPatientData();
    }

    getPatientModal() {
        return this._patientModalInstance;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-patients' && newValue) {
            try {
                this.patientData = JSON.parse(newValue);
                this.applyFilters();
            } catch (e) {
                // Error parsing patient data
            }
        }
    }

    async loadPatientData() {
        try {
            const patientService = (await import('../../services/patient-service.js')).default;
            this.patientData = await patientService.getAllPatients(1, 100);

            this.applyFilters();
        } catch (error) {
            this.patientData = [];
            this.applyFilters();
        }
    }

    applyFilters() {
        if (this.currentSearch.trim()) {
            this.filteredData = this.patientData.filter(patient =>
                patient.name.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                patient.email.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                patient.phone.includes(this.currentSearch)
            );
        } else {
            this.filteredData = [...this.patientData];
        }

        // Esperar un momento para asegurar que los componentes hijos estén listos
        setTimeout(() => {
            this.updateTable();
        }, 50);
    }

    setupEventListeners() {
        // Botón nuevo paciente
        const newPatientBtn = this.shadowRoot.querySelector('#new-patient-btn');
        if (newPatientBtn) {
            newPatientBtn.addEventListener('click', () => {
                const modal = this.getPatientModal();
                if (modal) {
                    modal.open();
                }
            });
        }

        // Evento de confirmación de eliminación
        // Nuevo event listener para eliminar paciente
        this.shadowRoot.addEventListener('delete-patient-requested', async (e) => {
            console.log('[PatientView] Evento delete-patient-requested recibido:', e.detail);
            await this.handleDeletePatient(e.detail);
        });

        // Buscador
        const searchInput = this.shadowRoot.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Eventos de la tabla - editar paciente
        this.shadowRoot.addEventListener('edit-patient-requested', (e) => {
            this.handleEditPatient(e.detail);
        });

        // Evento de paciente guardado
        this.shadowRoot.addEventListener('patient-saved', () => {
            this.loadPatientData();
        });

        // Event listener para ver citas del paciente
        this.shadowRoot.addEventListener('view-patient-appointments', (e) => {
            this.handleViewAppointments(e.detail);
        });
    }

    handleEditPatient(detail) {
        const modal = this.getPatientModal();
        if (modal && detail.patient) {
            modal.open(detail.patient);
        }
    }

    handleViewAppointments(detail) {
        const modal = this._viewAppointmentsModalInstance;
        if (modal && detail.patientId) {
            modal.open(detail.patientId, detail.patient.name || 'Paciente');
        }
    }

    async handleDeletePatient(detail) {
        const confirmModal = this._confirmationModalInstance; // Usar la instancia ya obtenida
        console.log('[PatientView] handleDeletePatient - confirmModal (instancia):', confirmModal);
        if (!confirmModal) {
            console.error('[PatientView] handleDeletePatient: No se encontró la instancia del modal de confirmación.');
            return;
        }

        const message = `¿Está seguro de que desea eliminar al paciente ${detail.patientName}? Esta acción no se puede deshacer.`;
        console.log('[PatientView] handleDeletePatient - Llamando a confirmModal.open con mensaje:', message);
        const confirmed = await confirmModal.open('Eliminar Paciente', message);

        console.log('[PatientView] handleDeletePatient - Confirmado:', confirmed);
        if (confirmed) {
            try {
                const patientService = (await import('../../services/patient-service.js')).default;
                await patientService.deletePatient(detail.patientId);

                // Recargar datos después de la eliminación
                await this.loadPatientData();

                // Opcional: mostrar un mensaje de éxito
                // alert('Paciente eliminado con éxito.'); // Considerar un toast o un modal más elegante

            } catch (error) {
                console.error('Error al eliminar paciente:', error);
                // alert('Error al eliminar paciente. Por favor, intente nuevamente.');
            }
        }
    }

    updateTable() {
        // Intentar encontrar la tabla, si no existe, esperar un poco más
        let table = this.shadowRoot.querySelector('patient-table');
        if (!table) {
            setTimeout(() => {
                this.updateTable();
            }, 100);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        table.setAttribute('data-items', JSON.stringify(pageData));

        // Actualizar paginación
        const pagination = this.shadowRoot.querySelector('table-pagination');
        if (pagination) {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
            pagination.setAttribute('current-page', this.currentPage.toString());
            pagination.setAttribute('total-pages', totalPages.toString());
        }
    }

    handlePageChange(e) {
        this.currentPage = e.detail.page;
        this.updateTable();
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

                .patient-view {
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

                .new-patient-btn {
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

                .new-patient-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
                }

                .search-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .search-input {
                    padding: 0.5rem 1rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    width: 250px;
                    transition: border-color 0.3s ease;
                }

                .search-input:focus {
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
            <div class="patient-view">
                <div class="view-header">
                    <h1 class="view-title">Gestión de Pacientes</h1>
                    <div class="header-actions">
                        <button id="new-patient-btn" class="new-patient-btn">
                            <span>+</span>
                            <span>Nuevo Paciente</span>
                        </button>
                        <div class="search-group">
                            <input type="text" id="search-input" class="search-input" placeholder="Buscar pacientes...">
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <patient-table></patient-table>
                    <table-pagination></table-pagination>
                </div>
                <patient-modal></patient-modal>
                <view-appointments-modal></view-appointments-modal>
                <confirmation-modal></confirmation-modal>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Event listener para paginación
        this.shadowRoot.addEventListener('page-change', (e) => {
            this.handlePageChange(e);
        });

        // Event listener para editar paciente
        this.shadowRoot.addEventListener('edit-patient-requested', (e) => {
            this.handleEditPatient(e.detail);
        });

        // Event listener para paciente guardado
        this.shadowRoot.addEventListener('patient-saved', (e) => {
            // Esperar más tiempo para asegurar que el backend haya procesado la actualización
            setTimeout(() => {
                this.loadPatientData().catch(() => {
                    // Error al recargar datos
                });
            }, 500);
        });
    }
}

customElements.define('patient-view', PatientView);
