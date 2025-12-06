/**
 * Servicio para obtener datos del dashboard
 * Obtiene conteos de pacientes, citas, registros e inventario
 */

const API_BASE_URL = 'http://localhost:3000/api';

class DashboardService {
    /**
     * Obtiene el token de autenticación
     */
    async getAuthHeader() {
        const authService = (await import('./auth-service.js')).default;
        return authService.getAuthHeader();
    }

    /**
     * Obtiene el conteo de pacientes
     * @returns {Promise<number>}
     */
    async getPatientsCount() {
        try {
            const headers = await this.getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/patients?page=1&limit=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener pacientes: ${response.status}`);
            }

            const data = await response.json();
            return data.pagination?.total || 0;
        } catch (error) {
            console.error('Error obteniendo conteo de pacientes:', error);
            return 0;
        }
    }

    /**
     * Obtiene el conteo de citas
     * @returns {Promise<number>}
     */
    async getAppointmentsCount() {
        try {
            const headers = await this.getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/appointments?page=1&limit=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener citas: ${response.status}`);
            }

            const data = await response.json();
            return data.pagination?.total || 0;
        } catch (error) {
            console.error('Error obteniendo conteo de citas:', error);
            return 0;
        }
    }

    /**
     * Obtiene el conteo de registros dentales
     * @returns {Promise<number>}
     */
    async getDentalRecordsCount() {
        try {
            const headers = await this.getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/dental-records`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener registros dentales: ${response.status}`);
            }

            const data = await response.json();
            return data.total || (data.data?.length || 0);
        } catch (error) {
            console.error('Error obteniendo conteo de registros dentales:', error);
            return 0;
        }
    }

    /**
     * Obtiene el conteo de items de inventario
     * @returns {Promise<number>}
     */
    async getInventoryCount() {
        try {
            const headers = await this.getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/inventory?page=1&limit=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener inventario: ${response.status}`);
            }

            const data = await response.json();
            return data.pagination?.total || 0;
        } catch (error) {
            console.error('Error obteniendo conteo de inventario:', error);
            return 0;
        }
    }

    /**
     * Obtiene los appointments agrupados por estado
     * @returns {Promise<Object>} Objeto con conteos por estado
     */
    async getAppointmentsByStatus() {
        try {
            const headers = await this.getAuthHeader();
            
            // Obtener todas las citas (el backend limita a 100 por página)
            // Hacer múltiples peticiones si es necesario
            let allAppointments = [];
            let page = 1;
            const limit = 100; // Máximo permitido por el backend
            let hasMore = true;

            while (hasMore) {
                const response = await fetch(`${API_BASE_URL}/appointments?page=${page}&limit=${limit}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`Error al obtener citas: ${response.status}`);
                }

                const data = await response.json();
                const appointments = data.data || [];
                
                // Agregar appointments de esta página
                allAppointments = allAppointments.concat(appointments);
                
                // Verificar si hay más páginas
                const total = data.pagination?.total || 0;
                const currentTotal = allAppointments.length;
                hasMore = currentTotal < total && appointments.length === limit;
                
                if (hasMore) {
                    page++;
                }
            }

            console.log('Total appointments obtenidos:', allAppointments.length);

            // Contar por estado
            const statusCounts = {
                scheduled: 0,
                completed: 0
            };

            allAppointments.forEach((appointment) => {
                const status = appointment.status || 'scheduled';
                
                if (status === 'scheduled') {
                    statusCounts.scheduled++;
                } else if (status === 'completed') {
                    statusCounts.completed++;
                }
            });

            console.log('Conteos finales:', statusCounts);
            return statusCounts;
        } catch (error) {
            console.error('Error obteniendo appointments por estado:', error);
            return {
                scheduled: 0,
                completed: 0,
                cancelled: 0,
                rescheduled: 0
            };
        }
    }

    /**
     * Obtiene todos los conteos del dashboard
     * @returns {Promise<Object>}
     */
    async getAllCounts() {
        try {
            const [patients, appointments, records, inventory] = await Promise.all([
                this.getPatientsCount(),
                this.getAppointmentsCount(),
                this.getDentalRecordsCount(),
                this.getInventoryCount()
            ]);

            return {
                patients,
                appointments,
                records,
                inventory
            };
        } catch (error) {
            console.error('Error obteniendo conteos del dashboard:', error);
            return {
                patients: 0,
                appointments: 0,
                records: 0,
                inventory: 0
            };
        }
    }
}

// Exportar instancia singleton
export default new DashboardService();

