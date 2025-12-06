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
        this.statusData = null;
    }

    static get observedAttributes() {
        return ['status-data'];
    }

    connectedCallback() {
        this.loadChartLibrary().then(() => {
            this.render();
            // Esperar a que el DOM esté listo y Chart.js esté cargado
            setTimeout(() => {
                // Crear gráfico inicial con datos por defecto
                if (window.Chart) {
                    this.createChart();
                    // Luego cargar datos reales
                    this.loadAppointmentData();
                } else {
                }
            }, 200);
        }).catch(error => {
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'status-data' && newValue && this.chart) {
            try {
                const data = JSON.parse(newValue);
                this.updateChart(data);
            } catch (e) {
            }
        }
    }

    async loadAppointmentData() {
        try {
            const dashboardService = (await import('../../services/dashboard-service.js')).default;
            const statusCounts = await dashboardService.getAppointmentsByStatus();
            this.statusData = statusCounts;
            
            // Actualizar el gráfico existente con los datos reales
            if (this.chart) {
                this.updateChartData(statusCounts);
            } else {
                // Si el gráfico no existe aún, crearlo
                this.createChart(statusCounts);
            }
        } catch (error) {
            // Si hay error, mantener los datos por defecto
        }
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
                <div class="chart-legend" id="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #4A90E2;"></div>
                        <span>Programadas</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #4CAF50;"></div>
                        <span>Completadas</span>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    createChart(data = null) {
        const canvas = this.shadowRoot.querySelector('#appointmentChart');
        if (!canvas) {
            return;
        }
        
        if (!window.Chart) {
            return;
        }

        const ctx = canvas.getContext('2d');

        // Si no hay datos, usar valores por defecto
        const statusCounts = data || this.statusData || {
            scheduled: 0,
            completed: 0
        };


        // Preparar datos para la gráfica (solo programadas y completadas)
        const scheduledCount = statusCounts.scheduled || 0;
        const completedCount = statusCounts.completed || 0;
        
        const chartData = {
            labels: ['Programadas', 'Completadas'],
            datasets: [{
                data: [scheduledCount, completedCount],
                backgroundColor: ['#4A90E2', '#4CAF50'],
                borderWidth: 0,
                cutout: '60%'
            }]
        };


        // Si ya existe un gráfico, destruirlo primero
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        // Crear nuevo gráfico
        try {
            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
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
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
        }
    }

    updateChartData(statusCounts) {
        if (!this.chart || !statusCounts) return;

        // Actualizar los datos del gráfico existente (solo programadas y completadas)
        this.chart.data.datasets[0].data = [
            statusCounts.scheduled || 0,
            statusCounts.completed || 0
        ];

        // Actualizar sin animación
        this.chart.update('none');
    }
}

customElements.define('chart-panel', ChartPanel);
