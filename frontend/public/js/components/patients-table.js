/**
 * Tabla de pacientes
 * Recibe data por atributo y emite eventos de editar/borrar
 */
class PatientsTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.data = [];
        this.filtered = [];
    }

    static get observedAttributes() { return ["data-patients"]; }

    attributeChangedCallback(_, __, newValue) {
        this.data = JSON.parse(newValue) || [];
        this.filtered = [...this.data];
        this.renderTable();
    }

    connectedCallback() { this.render(); }

    filter(text) {
        const t = text.toLowerCase();
        this.filtered = this.data.filter(p =>
            `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(t)
        );
        this.renderTable();
    }

    renderTable() {
        const tbody = this.shadowRoot.querySelector("tbody");
        tbody.innerHTML = "";

        if (!this.filtered.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center">No hay resultados.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filtered.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.first_name}</td>
                <td>${p.last_name}</td>
                <td>${p.email}</td>
                <td>${p.phone}</td>
                <td>${p.birth_date}</td>
                <td class="actions">
                    <button class="edit" data-id="${p.id}">Editar</button>
                    <button class="delete" data-id="${p.id}">Borrar</button>
                </td>
            </tr>
        `).join("");

        this.attachEvents();
    }

    attachEvents() {
        // Emitir evento editar
        this.shadowRoot.querySelectorAll(".edit").forEach(btn => {
            btn.onclick = () => {
                const patient = this.data.find(p => p.id == btn.dataset.id);
                this.dispatchEvent(new CustomEvent("edit-patient", {
                    bubbles: true, composed: true, detail: patient
                }));
            };
        });

        // Emitir evento borrar
        this.shadowRoot.querySelectorAll(".delete").forEach(btn => {
            btn.onclick = () => {
                const patient = this.data.find(p => p.id == btn.dataset.id);
                this.dispatchEvent(new CustomEvent("request-delete", {
                    bubbles: true, composed: true, detail: patient
                }));
            };
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            table { width: 100%; border-collapse: collapse; background: white; }
            th { background: #edf2f7; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .actions button { padding: 6px 12px; border-radius: 8px; border: none; }
            .edit { background: #dbeafe; color: #1e40af; }
            .delete { background: #fee2e2; color: #b91c1c; }
        </style>

        <table>
            <thead>
                <tr>
                    <th>ID</th><th>Nombre</th><th>Apellidos</th>
                    <th>Email</th><th>Teléfono</th><th>Nacimiento</th><th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        `;
    }
}

customElements.define("patients-table", PatientsTable);