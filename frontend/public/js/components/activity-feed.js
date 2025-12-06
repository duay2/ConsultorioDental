/**
 * activity-feed
 * Panel de actividades recientes con timeline vertical
 */
class ActivityFeed extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['activities'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    getActivities() {
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
                icon: 'person',
                timestamp: 'Hace 10m',
                description: 'Dr. Suárez completó registro de paciente María L.'
            },
            {
                icon: 'clock',
                timestamp: 'Hace 1h',
                description: 'Nuevo inventario de guantes añadido.'
            },
            {
                icon: 'clock',
                timestamp: 'Hace 2h',
                description: 'Cita de Pedro S. confirmada.'
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
            </style>
            <div class="activity-feed">
                <h2 class="feed-title">Actividades Recientes</h2>
                <div class="activities-list">
                    ${activities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-description">${activity.description}</div>
                                <div class="activity-timestamp">${activity.timestamp}</div>
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

