import authService from './auth-service.js';

const API_BASE_URL = '/api';

const apiService = {
    async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (requiresAuth) {
            const token = authService.getToken();
            if (!token) {
                // Redirigir al login si no hay token y la ruta lo requiere
                window.location.hash = '#/login'; // O la ruta que corresponda
                throw new Error('No autenticado. Por favor, inicie sesión.');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (response.status === 401) {
                // Token inválido o expirado, cerrar sesión
                authService.logout();
                window.location.hash = '#/login';
                throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Error en la solicitud: ${response.statusText}`);
            }

            // Para operaciones DELETE o si la respuesta es 204 No Content
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en la solicitud a ${endpoint}:`, error);
            throw error;
        }
    }
};

export default apiService;
