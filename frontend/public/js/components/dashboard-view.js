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
            const authService = (await import('../services/auth-service.js')).default;
            const user = authService.getUser();
            if (user) {
                this.updateWelcomeText(user);
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    updateWelcomeText(user) {
        const welcomeTextEl = this.shadowRoot.querySelector('.welcome-text');
        if (welcomeTextEl && user.name) {
            const rolePrefix = user.role === 'doctor' ? 'Dr.' : '';
            welcomeTextEl.textContent = `Bienvenido, ${rolePrefix} ${user.name}`.trim();
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

                <div class="kpi-grid">
                    <kpi-card 
                        icon-type="patients" 
                        value="3" 
                        label="Pacientes"
                        color="#4A90E2">
                    </kpi-card>
                    <kpi-card 
                        icon-type="appointments" 
                        value="4" 
                        label="Citas"
                        color="#4CAF50">
                    </kpi-card>
                    <kpi-card 
                        icon-type="records" 
                        value="3" 
                        label="Registros"
                        color="#4A90E2">
                    </kpi-card>
                    <kpi-card 
                        icon-type="inventory" 
                        value="3" 
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
    }
}

customElements.define('dashboard-view', DashboardView);

