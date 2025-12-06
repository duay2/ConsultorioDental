/**
 * inventory-service
 * Servicio para manejar operaciones de inventario con la API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class InventoryService {
    async getAuthHeaders() {
        // Usar auth-service para obtener el token
        const authService = await import('./auth-service.js');
        const token = authService.default.getToken();
        
        if (!token) {
            throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
        }
        
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async getAllInventory(page = 1, limit = 100) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener inventario');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async getInventoryById(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener el producto');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async createInventoryItem(itemData) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory`, {
                method: 'POST',
                headers,
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear el producto');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async updateInventoryItem(id, itemData) {
        try {
            const headers = await this.getAuthHeaders();
            // Asegurar que el ID sea un número
            const productId = parseInt(id);

            const response = await fetch(`${API_BASE_URL}/inventory/${productId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Error al actualizar el producto');
            }

            const result = await response.json();
            
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteInventoryItem(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar el producto');
            }

            // El backend debería devolver 204 (No Content) en una eliminación exitosa
            if (response.status === 204) {
                return { success: true, message: 'Producto de inventario eliminado exitosamente' };
            }

            // Si hay contenido, intentar parsearlo (caso poco probable para DELETE)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return { success: true, message: 'Producto de inventario eliminado exitosamente' };
        } catch (error) {
            throw error;
        }
    }
}

export default new InventoryService();

