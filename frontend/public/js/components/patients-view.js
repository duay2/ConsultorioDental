import patientService from "../services/patient-service.js";

/**
 * Vista principal de pacientes
 * Maneja render, carga de datos, modal y confirmación
 */
class PatientsView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.patients = [];
    }

    connectedCallback() {
        this.render();


        // Cargar pacientes al iniciar
        this.loadPatients();

        // Botón: abrir modal vacío
        this.shadowRoot.querySelector("#newPatientBtn")
            .addEventListener("click", () => {
                this.shadowRoot.querySelector("patients-modal").open();
            });

        // Buscador
        this.shadowRoot.querySelector("#searchInput")
            .addEventListener("input", (e) => {
                const table = this.shadowRoot.querySelector("patients-table");
                table.filter(e.target.value);
            });

        // Eventos del modal
        this.addEventListener("patient-saved", () => this.loadPatients());
        this.addEventListener("patient-updated", () => this.loadPatients());
        this.addEventListener("patient-deleted", () => this.loadPatients());

        // Evento editar
        this.addEventListener("edit-patient", (e) => {
            const modal = this.shadowRoot.querySelector("patients-modal");
            modal.open(e.detail);
        });

        // Evento borrar
        this.shadowRoot.addEventListener("request-delete", (e) => {
            const patient = e.detail;
            const dialog = this.shadowRoot.querySelector("confirm-dialog");

            dialog.open({
                message: `¿Eliminar paciente ${patient.first_name} ${patient.last_name}?`,
                onConfirm: () => this.deletePatient(patient.id)
            });
        });
    }

    /**
     * Eliminar paciente en backend
     */
    async deletePatient(id) {
        try {
            await patientService.deletePatient(id);
            await this.loadPatients();

            this.shadowRoot.querySelector("toast-notification")
                .show("Paciente eliminado correctamente", "success");

        } catch (err) {
            this.shadowRoot.querySelector("toast-notification")
                .show("No se pudo eliminar el paciente", "error");
        }
    }

    /**
     * Cargar pacientes y actualizar tabla
     */
    async loadPatients() {
        try {
            this.patients = await patientService.getAllPatients();

            const table = this.shadowRoot.querySelector("patients-table");
            table.setAttribute("data-patients", JSON.stringify(this.patients));

        } catch (err) {
            console.error("Error cargando pacientes:", err);
        }
    }

    /**
     * Render principal
     */
    render() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                background: #f5f7fb;
                min-height: 100vh;
                font-family: 'Inter', sans-serif;
            }
            .container {
                max-width: 1200px;
                margin: auto;
                padding: 2rem;
            }
            h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
            #searchInput {
                width: 260px; padding: 10px 14px;
                border-radius: 10px; border: 1px solid #d1d5db;
            }
            #newPatientBtn {
                background: #2563eb; color: white;
                border: none; padding: 12px 18px;
                border-radius: 10px; font-weight: 600;
            }
        </style>

        <div class="container">
            <h1>Gestión de Pacientes</h1>

            <input id="searchInput" placeholder="Buscar paciente...">
            <button id="newPatientBtn">Nuevo Paciente</button>

            <patients-table></patients-table>
            <patients-modal></patients-modal>
            <toast-notification></toast-notification>

            <!-- Esto queda pero no se usa (render lo elimina antes de append) -->
            <confirm-dialog></confirm-dialog>
        </div>
        `;
    }
}

customElements.define("patients-view", PatientsView);