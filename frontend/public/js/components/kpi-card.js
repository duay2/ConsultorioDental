/**
 * kpi-card
 * Tarjeta  para mostrar métricas 
 * Atributos: icon-type, value, label, color
 */
class KpiCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon-type', 'value', 'label', 'color'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    getIconTemplate(iconType, color) {
        const icons = {
            'patients': `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            `,
            'appointments': `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            `,
            'records': `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            `,
            'inventory': `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            `
        };
        return icons[iconType] || icons['patients'];
    }

    render() {
        const iconType = this.getAttribute('icon-type') || 'patients';
        const value = this.getAttribute('value') || '0';
        const label = this.getAttribute('label') || 'Label';
        const color = this.getAttribute('color') || '#4A90E2';

        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .kpi-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
                }

                .kpi-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .kpi-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .kpi-content {
                    display: flex;
                    flex-direction: column;
                }

                .kpi-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    line-height: 1;
                }

                .kpi-label {
                    font-size: 0.9rem;
                    color: #666;
                    font-weight: 500;
                    margin-top: 0.25rem;
                }
            </style>
            <div class="kpi-card">
                <div class="kpi-header">
                    <div class="kpi-icon">
                        ${this.getIconTemplate(iconType, color)}
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">${value}</div>
                        <div class="kpi-label">${label}</div>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('kpi-card', KpiCard);

