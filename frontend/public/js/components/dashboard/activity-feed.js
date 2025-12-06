/**
 * activity-feed
 * Panel de actividades recientes con timeline vertical
 */
class ActivityFeed extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._activities = [];
    }

    static get observedAttributes() {
        return ['activities'];
    }

    connectedCallback() {
        this.render();
        this.loadRecentActivities();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    async loadRecentActivities() {
        try {
            const activities = [];
            
            // Cargar citas recientes
            const appointmentService = await import('../../services/appointment-service.js');
            const appointments = await appointmentService.default.getAllAppointments(1, 5);
            
            if (appointments.data && appointments.data.length > 0) {
                appointments.data.forEach(apt => {
                    const date = new Date(apt.appointment_date || apt.created_at);
                    const patientName = apt.patient_info?.name || 'Paciente';
                    const doctorName = apt.doctor_info?.name || 'Doctor';
                    activities.push({
                        timestamp: this.formatTimeAgo(date),
                        description: `Cita de ${patientName} con ${doctorName} - ${apt.type || 'Consulta'}`,
                        date: date
                    });
                });
            }

            // Cargar pacientes recientes
            const patientService = await import('../../services/patient-service.js');
            const patients = await patientService.default.getAllPatients(1, 5);
            
            if (patients && patients.length > 0) {
                patients.forEach(patient => {
                    if (patient.created_at) {
                        const date = new Date(patient.created_at);
                        const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Paciente';
                        activities.push({
                            timestamp: this.formatTimeAgo(date),
                            description: `Nuevo paciente registrado: ${patientName}`,
                            date: date
                        });
                    }
                });
            }

            // Cargar registros dentales recientes
            try {
                const dentalRecordsService = await import('../../services/dental-records-service.js');
                const records = await dentalRecordsService.default.getAllDentalRecords(1, 5);
                
                if (records && records.data && records.data.length > 0) {
                    records.data.forEach(record => {
                        if (record.created_at) {
                            const date = new Date(record.created_at);
                            const patientName = record.patient_info?.name || 'Paciente';
                            activities.push({
                                timestamp: this.formatTimeAgo(date),
                                description: `Registro dental creado para ${patientName}`,
                                date: date
                            });
                        }
                    });
                }
            } catch (error) {
                // Si no hay servicio de registros dentales, continuar
            }

            // Ordenar por fecha (más recientes primero) y tomar los 10 más recientes
            this._activities = activities
                .sort((a, b) => b.date - a.date)
                .slice(0, 10)
                .map(a => ({
                    timestamp: a.timestamp,
                    description: a.description
                }));

            // Si no hay actividades, mostrar mensaje
            if (this._activities.length === 0) {
                this._activities = [{
                    timestamp: '',
                    description: 'No hay actividades recientes'
                }];
            }

            this.render();
        } catch (error) {
            console.error('Error al cargar actividades:', error);
            this._activities = this.getDefaultActivities();
            this.render();
        }
    }

    formatTimeAgo(date) {
        if (!date || isNaN(date.getTime())) {
            return 'Reciente';
        }

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return 'Hace unos momentos';
        } else if (diffMins < 60) {
            return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }
    }

    getActivities() {
        if (this._activities.length > 0) {
            return this._activities;
        }
        
        const activitiesJson = this.getAttribute('activities');
        if (activitiesJson) {
            try {
                return JSON.parse(activitiesJson);
            } catch (e) {
                return this.getDefaultActivities();
            }
        }
        return this.getDefaultActivities();
    }

    getDefaultActivities() {
        return [
            {
                timestamp: '',
                description: 'Cargando actividades...'
            }
        ];
    }

    render() {
        const activities = this.getActivities();

        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .activity-feed {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .feed-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 1.5rem;
                }

                .activities-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    position: relative;
                }

                .activity-item {
                    display: flex;
                    gap: 1rem;
                    position: relative;
                    padding-left: 1rem;
                    border-left: 3px solid #e0e0e0;
                }

                .activity-item:first-child {
                    border-left-color: #4A90E2;
                }

                .activity-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .activity-description {
                    font-size: 0.95rem;
                    color: #333;
                    line-height: 1.4;
                }

                .activity-timestamp {
                    font-size: 0.8rem;
                    color: #999;
                }

                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: #999;
                    font-style: italic;
                }

                .loading-state {
                    text-align: center;
                    padding: 2rem;
                    color: #666;
                }
            </style>
            <div class="activity-feed">
                <h2 class="feed-title">Actividades Recientes</h2>
                <div class="activities-list">
                    ${activities.length === 0 ? `
                        <div class="empty-state">No hay actividades recientes</div>
                    ` : activities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-description">${activity.description}</div>
                                ${activity.timestamp ? `<div class="activity-timestamp">${activity.timestamp}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('activity-feed', ActivityFeed);
