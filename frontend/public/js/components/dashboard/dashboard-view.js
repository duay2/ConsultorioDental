/**
 * dashboard-view
 * Contenedor principal del dashboard 
 */
class DashboardView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.loadUserInfo();
        this.loadDashboardData();
    }

    getFormattedDate() {
        const date = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formatter = new Intl.DateTimeFormat('es-ES', options);
        return formatter.format(date);
    }

    async loadUserInfo() {
        try {
            const authService = (await import('../../services/auth-service.js')).default;
            const user = authService.getUser();
            if (user) {
                this.updateWelcomeText(user);
            }
        } catch (error) {
        }
    }

    updateWelcomeText(user) {
        const welcomeTextEl = this.shadowRoot.querySelector('.welcome-text');
        if (welcomeTextEl && user.name) {
            const rolePrefix = user.role === 'doctor' || user.role === 'Dentista' ? 'Dr.' : '';
            welcomeTextEl.textContent = `Bienvenido, ${rolePrefix} ${user.name}`.trim();
        }
    }

    async loadDashboardData() {
        try {
            const dashboardService = (await import('../../services/dashboard-service.js')).default;
            const counts = await dashboardService.getAllCounts();

            // Actualizar los valores de las tarjetas KPI
            this.updateKPICard('patients', counts.patients);
            this.updateKPICard('appointments', counts.appointments);
            this.updateKPICard('records', counts.records);
            this.updateKPICard('inventory', counts.inventory);
        } catch (error) {
            // En caso de error, mantener valores por defecto
        }
    }

    updateKPICard(type, value) {
        const card = this.shadowRoot.querySelector(`kpi-card[icon-type="${type}"]`);
        if (card) {
            card.setAttribute('value', value.toString());
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

                .dashboard {
                    min-height: 100vh;
                    background: #f5f5f5;
                    padding: 2rem;
                }

                .dashboard-header {
                    margin-bottom: 2rem;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .welcome-text {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .date-text {
                    font-size: 1rem;
                    color: #666;
                }

                .quick-actions {
                    margin-bottom: 2.5rem;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .quick-actions-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .quick-actions-title::before {
                    content: '';
                    width: 4px;
                    height: 20px;
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    border-radius: 2px;
                }

                .quick-actions-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .quick-action-btn {
                    padding: 1.25rem 1.75rem;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    letter-spacing: 0.3px;
                }

                .quick-action-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                }

                .quick-action-btn:hover::before {
                    left: 100%;
                }

                .quick-action-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }

                .quick-action-btn:active {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
                }

                .btn-new-appointment {
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    color: white;
                }

                .btn-new-appointment:hover {
                    background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
                }

                .btn-new-patient {
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    color: white;
                }

                .btn-new-patient:hover {
                    background: linear-gradient(135deg, #357ABD 0%, #2d6a9e 100%);
                }

                .btn-new-record {
                    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
                    color: white;
                }

                .btn-new-record:hover {
                    background: linear-gradient(135deg, #F57C00 0%, #e66a00 100%);
                }

                @media (max-width: 768px) {
                    .quick-actions-buttons {
                        grid-template-columns: 1fr;
                    }

                    .quick-action-btn {
                        padding: 1rem 1.5rem;
                    }
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .panels-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                @media (max-width: 1024px) {
                    .panels-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .dashboard {
                        padding: 1rem;
                    }

                    .kpi-grid {
                        grid-template-columns: 1fr;
                    }

                    .header-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                }
            </style>
            <div class="dashboard">
                <div class="dashboard-header">
                    <div class="header-content">
                        <div class="welcome-text">Bienvenido</div>
                        <div class="date-text">${this.getFormattedDate()}</div>
                    </div>
                </div>

                <div class="quick-actions">
                    <div class="quick-actions-title">Accesos Rápidos</div>
                    <div class="quick-actions-buttons">
                        <button class="quick-action-btn btn-new-appointment" id="btn-new-appointment">
                            Nueva Cita
                        </button>
                        <button class="quick-action-btn btn-new-patient" id="btn-new-patient">
                            Nuevo Paciente
                        </button>
                        <button class="quick-action-btn btn-new-record" id="btn-new-record">
                            Nuevo Registro
                        </button>
                    </div>
                </div>

                <div class="kpi-grid">
                    <kpi-card 
                        icon-type="patients" 
                        value="0" 
                        label="Pacientes"
                        color="#4A90E2">
                    </kpi-card>
                    <kpi-card 
                        icon-type="appointments" 
                        value="0" 
                        label="Citas"
                        color="#4CAF50">
                    </kpi-card>
                    <kpi-card 
                        icon-type="records" 
                        value="0" 
                        label="Registros"
                        color="#4A90E2">
                    </kpi-card>
                    <kpi-card 
                        icon-type="inventory" 
                        value="0" 
                        label="Inventario"
                        color="#4CAF50">
                    </kpi-card>
                </div>

                <div class="panels-grid">
                    <activity-feed></activity-feed>
                    <chart-panel></chart-panel>
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        // Agregar modales al shadow DOM
        const newAppointmentModal = document.createElement('new-appointment-modal');
        const patientModal = document.createElement('patient-modal');
        const dentalRecordsModal = document.createElement('dental-records-modal');
        
        this.shadowRoot.appendChild(newAppointmentModal);
        this.shadowRoot.appendChild(patientModal);
        this.shadowRoot.appendChild(dentalRecordsModal);
        
        // Configurar event listeners para los botones
        this.setupQuickActionButtons();
    }

    setupQuickActionButtons() {
        const btnNewAppointment = this.shadowRoot.querySelector('#btn-new-appointment');
        const btnNewPatient = this.shadowRoot.querySelector('#btn-new-patient');
        const btnNewRecord = this.shadowRoot.querySelector('#btn-new-record');

        if (btnNewAppointment) {
            btnNewAppointment.addEventListener('click', () => {
                const modal = this.shadowRoot.querySelector('new-appointment-modal');
                if (modal) {
                    modal.open();
                }
            });
        }

        if (btnNewPatient) {
            btnNewPatient.addEventListener('click', () => {
                const modal = this.shadowRoot.querySelector('patient-modal');
                if (modal) {
                    modal.open();
                }
            });
        }

        if (btnNewRecord) {
            btnNewRecord.addEventListener('click', () => {
                const modal = this.shadowRoot.querySelector('dental-records-modal');
                if (modal) {
                    modal.open();
                }
            });
        }

        // Escuchar eventos de los modales para actualizar el dashboard
        const newAppointmentModal = this.shadowRoot.querySelector('new-appointment-modal');
        const patientModal = this.shadowRoot.querySelector('patient-modal');
        const dentalRecordsModal = this.shadowRoot.querySelector('dental-records-modal');

        if (newAppointmentModal) {
            newAppointmentModal.addEventListener('appointment-created', () => {
                this.loadDashboardData();
            });
        }

        if (patientModal) {
            patientModal.addEventListener('patient-saved', () => {
                this.loadDashboardData();
            });
        }

        if (dentalRecordsModal) {
            dentalRecordsModal.addEventListener('dental-record-saved', () => {
                this.loadDashboardData();
            });
        }
    }
}

customElements.define('dashboard-view', DashboardView);
