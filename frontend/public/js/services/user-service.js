/**
 * Servicio para manejar las operaciones de usuarios/doctores con la API
 */
const API_BASE_URL = 'http://localhost:3000/api';

class UserService {
    constructor() {
        this.token = this.getToken();
    }

    getToken() {
        return localStorage.getItem('dentalflow_token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Obtener token actualizado en cada petición
        const currentToken = this.getToken();
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }

        return headers;
    }

    /**
     * Obtener usuarios por rol (doctores)
     * @param {string} role - Rol del usuario (doctor, admin, etc.)
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getUsersByRole(role = 'doctor') {
        try {
            const response = await fetch(`${API_BASE_URL}/users/role?role=${role}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener doctores y dentistas (combina ambos roles)
     * @returns {Promise<Array>} Lista de doctores y dentistas
     */
    async getDoctorsAndDentists() {
        try {
            // Obtener usuarios con rol 'doctor' y variaciones de 'dentista' en paralelo
            const [doctors, dentists1, dentists2, dentists3] = await Promise.all([
                this.getUsersByRole('doctor').catch(err => {
                    return [];
                }),
                this.getUsersByRole('dentista').catch(err => {
                    return [];
                }),
                this.getUsersByRole('Dentista').catch(err => {
                    return [];
                }),
                this.getUsersByRole('Dentiste').catch(err => {
                    return [];
                })
            ]);


            // Combinar todos los resultados
            const allDoctors = [...doctors, ...dentists1, ...dentists2, ...dentists3];
            
            // Eliminar duplicados por ID
            const uniqueDoctors = allDoctors.filter((doctor, index, self) => 
                index === self.findIndex(d => d.id === doctor.id)
            );

            
            return uniqueDoctors;
        } catch (error) {
            throw error;
        }
    }
}

const userService = new UserService();
export default userService;

