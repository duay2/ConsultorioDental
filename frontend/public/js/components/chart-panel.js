/**
 * chart-panel.js
 * Panel con gráfico para estado de citas
 * Usa Chart.js para el gráfico
 */
class ChartPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chart = null;
    }

    connectedCallback() {
        this.loadChartLibrary().then(() => {
            this.render();
        });
    }

    loadChartLibrary() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Chart.js'));
            document.head.appendChild(script);
        });
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

                .chart-panel {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    display: flex;
                    flex-direction: column;
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .chart-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .chart-icon {
                    width: 24px;
                    height: 24px;
                    color: #999;
                }

                .chart-container {
                    position: relative;
                    height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chart-legend {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
            </style>
            <div class="chart-panel">
                <div class="chart-header">
                    <h2 class="chart-title">Estado de Citas</h2>
                    <svg class="chart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                </div>
                <div class="chart-container">
                    <canvas id="appointmentChart"></canvas>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #4A90E2;"></div>
                        <span>Programadas</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #4CAF50;"></div>
                        <span>Confirmadas</span>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Crear gráfico después de que el DOM esté listo
        setTimeout(() => {
            this.createChart();
        }, 100);
    }

    createChart() {
        const canvas = this.shadowRoot.querySelector('#appointmentChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        // Datos basados en la citas programadas y confirmadas
        const data = {
            labels: ['Programadas', 'Confirmadas'],
            datasets: [{
                data: [3, 1], 
                backgroundColor: ['#4A90E2', '#4CAF50'],
                borderWidth: 0,
                cutout: '60%'
            }]
        };

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateRotate: false,
                    animateScale: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });
    }
}

customElements.define('chart-panel', ChartPanel);
