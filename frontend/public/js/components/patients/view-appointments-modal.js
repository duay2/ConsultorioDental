/**
 * view-appointments-modal
 * Modal para visualizar las citas de un paciente
 */
class ViewAppointmentsModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._patientId = null;
        this._appointments = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    async open(patientId, patientName) {
        this._patientId = patientId;
        this._patientName = patientName;
        this.shadowRoot.querySelector('.modal-title').textContent = `Citas de ${patientName}`;
        this.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        await this.loadAppointments();
    }

    close() {
        this.style.display = 'none';
        document.body.style.overflow = '';
        this._appointments = [];
        this._patientId = null;
        this._patientName = null;
        this.shadowRoot.querySelector('.appointments-table-body').innerHTML = '';
    }

    async loadAppointments() {
        const tableBody = this.shadowRoot.querySelector('.appointments-table-body');
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando citas...</td></tr>';

        try {
            // Asegurar que patientId sea un número
            const patientId = parseInt(this._patientId, 10);
            if (isNaN(patientId) || patientId <= 0) {
                throw new Error('ID de paciente inválido');
            }

            const appointmentService = await import('../../services/appointment-service.js');
            const response = await appointmentService.default.getAppointmentsByPatientId(patientId);
            this._appointments = response.data || [];
            this.updateAppointmentsTable();
        } catch (error) {
            console.error('Error al cargar citas del paciente:', error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar citas.</td></tr>';
        }
    }

    updateAppointmentsTable() {
        const tableBody = this.shadowRoot.querySelector('.appointments-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this._appointments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay citas registradas para este paciente.</td></tr>';
            return;
        }

        this._appointments.forEach(appointment => {
            const row = document.createElement('tr');
            const date = appointment.appointment_date || appointment.date;
            const time = appointment.appointment_time || appointment.time;
            const description = appointment.notes || appointment.description || appointment.type || 'Sin descripción';
            const status = appointment.status || 'scheduled';
            
            row.innerHTML = `
                <td>${this.formatDate(date)}</td>
                <td>${time || '-'}</td>
                <td>${description}</td>
                <td><span class="status-badge status-${status.toLowerCase().replace(/ /g, '-')}">${status}</span></td>
            `;
            tableBody.appendChild(row);
        });
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

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
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
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1001;
                    display: flex;
                    flex-direction: column;
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
                    flex-grow: 1;
                    padding: 24px;
                    overflow-y: auto;
                }

                .appointments-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }

                .appointments-table th,
                .appointments-table td {
                    border: 1px solid #eee;
                    padding: 12px;
                    text-align: left;
                }

                .appointments-table th {
                    background-color: #f5f5f5;
                    font-weight: 600;
                    color: #333;
                }

                .appointments-table tbody tr:nth-child(even) {
                    background-color: #f9f9f9;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    width: fit-content;
                    display: inline-block;
                }

                .status-badge.status-pendiente {
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

            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Citas del Paciente</h2>
                    <button class="close-btn" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <table class="appointments-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody class="appointments-table-body">
                            <!-- Citas se cargarán aquí -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define('view-appointments-modal', ViewAppointmentsModal);
