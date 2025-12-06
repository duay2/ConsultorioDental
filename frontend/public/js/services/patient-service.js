/**
 * Servicio para comunicarse con la API de pacientes
 * Maneja listar, crear, actualizar y eliminar pacientes
 */

const API_BASE_URL = "http://localhost:3000/api";

class PatientService {

    constructor() {
        this.token = this.getToken();
    }

    /**
     * Obtiene el token almacenado en localStorage
     */
    getToken() {
        return localStorage.getItem("dentalflow_token");
    }

    /**
     * Genera los headers con el token JWT
     */
    getHeaders() {
        const token = this.getToken();
        return {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        };
    }

    /**
     * Obtiene todos los pacientes desde el backend
     */
    async getAllPatients() {
        try {
            const res = await fetch(`${API_BASE_URL}/patients?page=1&limit=100`, {
                method: "GET",
                headers: this.getHeaders()
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            const json = await res.json();

            /**
             * Normaliza los nombres de los campos
             * para que coincidan con el frontend
             */
            return (json.data || []).map(p => ({
                id: p.id,
                first_name: p.first_name,
                last_name: p.last_name,
                email: p.email,
                phone: p.phone,
                birth_date: p.birth_date
            }));

        } catch (err) {
            console.error("[PatientService] Error obteniendo pacientes:", err);
            return [];
        }
    }

    /**
     * Envía nuevo paciente al backend
     */
    async createPatient(patientData) {
        const res = await fetch(`${API_BASE_URL}/patients`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(patientData)
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);
        
        return (await res.json()).data;
    }

    /**
     * Actualiza un paciente por su ID
     */
    async updatePatient(id, data) {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        return (await res.json()).data;
    }

    /**
     * Elimina un paciente del sistema
     */
    async deletePatient(id) {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: "DELETE",
            headers: this.getHeaders()
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        return true;
    }
}

const patientService = new PatientService();

// Para pruebas desde la consola del navegador
window.patientService = patientService;

export default patientService;