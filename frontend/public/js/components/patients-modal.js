import patientService from "../services/patient-service.js";

/**
 * Modal para crear o editar pacientes.
 * Se encarga de recolectar datos, validar y enviar al servicio.
 */
class PatientsModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.editData = null; 
    }

    connectedCallback() {
        this.render();
    }

    /**
     * Abre el modal y carga datos si es edición.
     */
    open(data = null) {
        this.editData = data;
        this.render();
        this.shadowRoot.querySelector("#modal").classList.add("show");
    }

    /**
     * Cierra el modal.
     */
    close() {
        this.shadowRoot.querySelector("#modal").classList.remove("show");
    }

    // Convierte fecha del backend a yyyy-MM-dd
    formatDate(date) {
        if (!date) return "";
        return date.split("T")[0];
    }

    // Guarda o actualiza paciente
    async save() {
        const form = new FormData(this.shadowRoot.querySelector("#form"));

        const payload = {
            first_name: form.get("first_name"),
            last_name: form.get("last_name"),
            email: form.get("email"),
            phone: form.get("phone"),
            birth_date: form.get("birth_date")
        };

        if (this.editData) {
            await patientService.updatePatient(this.editData.id, payload);
            this.dispatchEvent(new CustomEvent("patient-updated", { bubbles: true, composed: true }));
        } else {
            await patientService.createPatient(payload);
            this.dispatchEvent(new CustomEvent("patient-saved", { bubbles: true, composed: true }));
        }

        this.close();
    }

    // Dibuja el modal
    render() {
        const d = this.editData || {};

        this.shadowRoot.innerHTML = `
        <style>
            #modal { position: fixed; inset: 0; background: rgba(0,0,0,.35); display:flex;
                     justify-content:center; align-items:center; opacity:0; pointer-events:none; transition:.2s }
            #modal.show { opacity:1; pointer-events:auto }

            .card { background:white; padding:2rem; width:420px; border-radius:14px; font-family:Inter }

            input { width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #d1d5db }
            button { padding:10px 16px; border:none; border-radius:8px; cursor:pointer; font-weight:600 }
            .save { background:#2563eb; color:white }
            .cancel { background:#e5e7eb }
        </style>

        <div id="modal">
            <div class="card">
                <h2>${this.editData ? "Editar Paciente" : "Nuevo Paciente"}</h2>

                <form id="form">
                    <input name="first_name" placeholder="Nombre" value="${d.first_name ?? ""}">
                    <input name="last_name" placeholder="Apellidos" value="${d.last_name ?? ""}">
                    <input name="email" placeholder="Correo" value="${d.email ?? ""}">
                    <input name="phone" placeholder="Teléfono" value="${d.phone ?? ""}">
                    <input type="date" name="birth_date" value="${this.formatDate(d.birth_date)}">
                </form>

                <div style="margin-top:1rem; display:flex; justify-content:end; gap:10px;">
                    <button class="cancel" id="cancelBtn">Cancelar</button>
                    <button class="save" id="saveBtn">Guardar</button>
                </div>
            </div>
        </div>
        `;

        this.shadowRoot.querySelector("#cancelBtn").onclick = () => this.close();
        this.shadowRoot.querySelector("#saveBtn").onclick = () => this.save();
    }
}

customElements.define("patients-modal", PatientsModal);