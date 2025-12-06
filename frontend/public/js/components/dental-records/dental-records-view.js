/**
 * dental-records-view
 * Vista principal de gestión de registros dentales
 * Contenedor que orquesta la tabla, filtros y acciones
 */
class DentalRecordsView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.recordsData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentPatientFilter = 'all';
        this.currentSearch = '';
        this._confirmationModalInstance = null; // Declarar la instancia del modal de confirmación
    }

    static get observedAttributes() {
        return ['data-records'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // Esperar a que el DOM esté listo antes de cargar datos
        setTimeout(() => {
            this.loadRecordsData();
        }, 100);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-records' && newValue) {
            try {
                this.recordsData = JSON.parse(newValue);
                this.applyFilters();
            } catch (e) {
                // Error parsing records data
            }
        }
    }

    async loadRecordsData() {
        try {
            const dentalRecordsService = (await import('../../services/dental-records-service.js')).default;
            this.recordsData = await dentalRecordsService.getAllDentalRecords();

            // Llenar filtro de pacientes después de obtener datos
            const patients = this.getUniquePatients();
            const select = this.shadowRoot.querySelector('#patient-filter');
            if (select) {
                // Limpiar opciones existentes (excepto "Todos")
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                patients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = patient.name;
                    select.appendChild(option);
                });
            }

            this.applyFilters();
        } catch (error) {
            this.recordsData = [];
            this.applyFilters();
        }
    }

    applyFilters() {
        let filtered = [...this.recordsData];

        // Filtro por paciente
        if (this.currentPatientFilter !== 'all') {
            filtered = filtered.filter(record => record.patient_id === parseInt(this.currentPatientFilter));
        }

        // Filtro por búsqueda
        if (this.currentSearch.trim()) {
            filtered = filtered.filter(record =>
                record.description.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                record.treatment_type.toLowerCase().includes(this.currentSearch.toLowerCase())
            );
        }

        this.filteredData = filtered;

        // Esperar un momento para asegurar que los componentes hijos estén listos
        setTimeout(() => {
            this.updateTable();
        }, 50);
    }

    setupEventListeners() {
        // Botón nuevo registro
        const newRecordBtn = this.shadowRoot.querySelector('#new-record-btn');
        if (newRecordBtn) {
            newRecordBtn.addEventListener('click', async () => {
                const modal = this.shadowRoot.querySelector('dental-records-modal');
                if (modal) {
                    await modal.open();
                }
            });
        }

        // Filtro de paciente
        const patientFilter = this.shadowRoot.querySelector('#patient-filter');
        if (patientFilter) {
            patientFilter.addEventListener('change', (e) => {
                this.currentPatientFilter = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Buscador
        const searchInput = this.shadowRoot.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Eventos de la tabla - editar registro
        this.shadowRoot.addEventListener('edit-record-requested', async (e) => {
            await this.handleEditRecord(e.detail);
        });

        // Evento de registro guardado
        this.shadowRoot.addEventListener('record-saved', () => {
            this.loadRecordsData();
        });

        // Event listener para eliminar registro
        this.shadowRoot.addEventListener('delete-record-requested', async (e) => {
            await this.handleDeleteDentalRecord(e.detail);
        });
    }

    async handleEditRecord(detail) {
        const modal = this.shadowRoot.querySelector('dental-records-modal');
        if (modal && detail.record) {
            await modal.open(detail.record);
        }
    }

    async handleDeleteDentalRecord(detail) {
        const confirmModal = this.shadowRoot.querySelector('confirmation-modal');
        if (!confirmModal) return;

        const message = `¿Está seguro de que desea eliminar el registro dental del paciente ${detail.patientName} (${detail.description})? Esta acción no se puede deshacer.`;
        const confirmed = await confirmModal.open('Eliminar Registro Dental', message);

        if (confirmed) {
            try {
                const dentalRecordsService = (await import('../../services/dental-records-service.js')).default;
                await dentalRecordsService.deleteDentalRecord(detail.recordId);
                this.loadRecordsData(); // Recargar datos después de la eliminación
            } catch (error) {
                console.error('Error al eliminar registro dental:', error);
                // Aquí podrías mostrar un mensaje de error al usuario
            }
        }
    }

    updateTable() {
        // Intentar encontrar la tabla, si no existe, esperar un poco más
        let table = this.shadowRoot.querySelector('dental-records-table');
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

    getUniquePatients() {
        const patientMap = new Map();
        this.recordsData.forEach(record => {
            if (record.patient_info && !patientMap.has(record.patient_id)) {
                patientMap.set(record.patient_id, {
                    id: record.patient_id,
                    name: record.patient_info.name
                });
            }
        });
        return Array.from(patientMap.values()).sort((a, b) => a.name.localeCompare(b.name));
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

                .dental-records-view {
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

                .new-record-btn {
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

                .new-record-btn:hover {
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
            <div class="dental-records-view">
                <div class="view-header">
                    <h1 class="view-title">Registros Dentales</h1>
                    <div class="header-actions">
                        <button id="new-record-btn" class="new-record-btn">
                            <span>+</span>
                            <span>Nuevo Registro</span>
                        </button>
                        <div class="filter-group">
                            <label class="filter-label">Paciente:</label>
                            <select id="patient-filter" class="filter-select">
                                <option value="all">Todos</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <input type="text" id="search-input" class="search-input" placeholder="Buscar registros...">
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <dental-records-table></dental-records-table>
                    <table-pagination></table-pagination>
                </div>
                <dental-records-modal></dental-records-modal>
                <confirmation-modal></confirmation-modal> <!-- Nuevo modal de confirmación -->
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Event listener para paginación
        this.shadowRoot.addEventListener('page-change', (e) => {
            this.handlePageChange(e);
        });

        // Event listener para editar registro
        this.shadowRoot.addEventListener('edit-record-requested', async (e) => {
            await this.handleEditRecord(e.detail);
        });

        // Event listener para registro guardado
        this.shadowRoot.addEventListener('record-saved', (e) => {
            // Esperar más tiempo para asegurar que el backend haya procesado la actualización
            setTimeout(() => {
                this.loadRecordsData().catch(() => {
                    // Error al recargar datos
                });
            }, 500);
        });
    }
}

customElements.define('dental-records-view', DentalRecordsView);
