import '../common/confirmation-modal.js'; // Importar el modal de confirmación

/**
 * appointments-view
 * Vista principal de gestión de citas
 * Contenedor que orquesta la tabla, filtros y acciones de citas
 */
class AppointmentsView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.appointmentData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSearch = '';
        this._editAppointmentModalInstance = null;
        this._confirmationModalInstance = null; // Añadir instancia para el modal de confirmación
    }

    connectedCallback() {
        this.render();
        setTimeout(() => {
            this._editAppointmentModalInstance = this.shadowRoot.querySelector('edit-appointment-modal');
            this._confirmationModalInstance = this.shadowRoot.querySelector('confirmation-modal'); // Obtener referencia al modal de confirmación
            this.setupEventListeners();
            this.loadAppointmentData();
        }, 50);
    }

    getEditAppointmentModal() {
        return this._editAppointmentModalInstance;
    }

    async loadAppointmentData() {
        try {
            const appointmentService = (await import('../../services/appointment-service.js')).default;
            const result = await appointmentService.getAllAppointments(this.currentPage, this.itemsPerPage);
            console.log('[AppointmentsView] Resultado de getAllAppointments:', result);
            this.appointmentData = result.data || [];
            this.applyFilters();
        } catch (error) {
            console.error('[AppointmentsView] Error al cargar datos de citas:', error);
            this.appointmentData = [];
            this.applyFilters();
        }
    }

    applyFilters() {
        console.log('[AppointmentsView] Datos antes de filtrar:', this.appointmentData);
        this.filteredData = [...this.appointmentData];
        console.log('[AppointmentsView] Datos filtrados:', this.filteredData);
        this.updateTable();
    }

    setupEventListeners() {
        // Eventos para editar cita
        this.shadowRoot.addEventListener('edit-appointment-requested', (e) => {
            this.handleEditAppointment(e.detail);
        });

        // Eventos para marcar como completada
        this.shadowRoot.addEventListener('complete-appointment-requested', async (e) => {
            await this.handleCompleteAppointment(e.detail);
        });

        // Eventos para eliminar cita
        this.shadowRoot.addEventListener('delete-appointment-requested', async (e) => {
            await this.handleDeleteAppointmentRequest(e.detail);
        });

        // Escuchar evento de cita actualizada desde el modal de edición
        document.addEventListener('appointment-updated', async () => {
            await this.loadAppointmentData();
        });

        // Event listener para paginación
        this.shadowRoot.addEventListener('page-change', (e) => {
            this.handlePageChange(e);
        });
    }

    handleEditAppointment(detail) {
        const modal = this.getEditAppointmentModal();
        if (modal && detail.appointmentId) {
            modal.open(detail.appointmentId);
        }
    }

    async handleCompleteAppointment(detail) {
        try {
            const appointmentService = (await import('../../services/appointment-service.js')).default;
            await appointmentService.updateAppointmentStatus(detail.appointmentId, 'completed');
            this.loadAppointmentData();
        } catch (error) {
            console.error('Error al completar cita:', error);
        }
    }

    async handleDeleteAppointmentRequest(detail) {
        const confirmModal = this.getConfirmationModal();
        if (!confirmModal) return;

        const message = `¿Está seguro de que desea eliminar la cita de ${detail.patientName} a las ${detail.appointmentTime}? Esta acción no se puede deshacer.`;
        const confirmed = await confirmModal.open('Eliminar Cita', message);

        if (confirmed) {
            try {
                const appointmentService = (await import('../../services/appointment-service.js')).default;
                await appointmentService.deleteAppointment(detail.appointmentId);
                this.loadAppointmentData();
            } catch (error) {
                console.error('Error al eliminar cita:', error);
                // Aquí podrías mostrar un mensaje de error al usuario
            }
        }
    }

    updateTable() {
        let table = this.shadowRoot.querySelector('appointment-table');
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
        this.loadAppointmentData(); // Recargar datos para la nueva página
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

                .appointments-view {
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

                .table-container {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
            </style>
            <div class="appointments-view">
                <div class="view-header">
                    <h1 class="view-title">Gestión de Citas</h1>
                    <div class="header-actions">
                        <!-- Aquí se podrían añadir botones para nueva cita, filtros, etc. -->
                    </div>
                </div>
                <div class="table-container">
                    <appointment-table></appointment-table>
                    <table-pagination></table-pagination>
                </div>
                <edit-appointment-modal></edit-appointment-modal>
                <confirmation-modal></confirmation-modal> <!-- Nuevo modal de confirmación -->
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Event listener para editar cita
        this.shadowRoot.addEventListener('edit-appointment-requested', (e) => {
            this.handleEditAppointment(e.detail);
        });

        // Event listener para marcar como completada
        this.shadowRoot.addEventListener('complete-appointment-requested', (e) => {
            this.handleCompleteAppointment(e.detail);
        });

        // Event listener para eliminar cita
        this.shadowRoot.addEventListener('delete-appointment-requested', (e) => {
            this.handleDeleteAppointmentRequest(e.detail);
        });
    }

    getConfirmationModal() {
        return this._confirmationModalInstance;
    }
}

customElements.define('appointments-view', AppointmentsView);
