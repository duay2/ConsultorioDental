/**
 * dental-records-modal
 * Modal para crear o editar un registro dental
 */
class DentalRecordsModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._editingRecord = null;
        this._patients = [];

        // Mapeo inverso para convertir valores del backend a valores del frontend
        this.reverseRecordTypeMapping = {
            'general': 'Limpieza',
            'surgery': 'Extracción',
            'orthodontic': 'Ortodoncia'
        };
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.loadPatients();
    }

    async loadPatients() {
        try {
            const patientService = (await import('../../services/patient-service.js')).default;
            this._patients = await patientService.getAllPatients(1, 100);
            this.updatePatientSelect();
        } catch (error) {
            this._patients = [];
            this.updatePatientSelect();
        }
    }

    updatePatientSelect() {
        const select = this.shadowRoot?.querySelector('#patient-select');
        if (!select) return;

        // Limpiar opciones existentes excepto la primera
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // Agregar las nuevas opciones
        this._patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = patient.name;
            select.appendChild(option);
        });
    }

    async open(record = null) {
        this._editingRecord = record;

        // Asegurar que los pacientes estén cargados
        if (this._patients.length === 0) {
            await this.loadPatients();
        }

        this.updateForm();
        this.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.style.display = 'none';
        document.body.style.overflow = '';

        // Limpiar formulario
        const form = this.shadowRoot.querySelector('.record-form');
        if (form) form.reset();

        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }

        this._editingRecord = null;
    }

    updateForm() {
        const form = this.shadowRoot.querySelector('.record-form');
        if (!form) return;

        if (this._editingRecord) {
            // Modo edición
            form.querySelector('#patient-select').value = this._editingRecord.patient_id || '';

            // Convertir el valor del backend al valor del frontend para el select
            const backendRecordType = this._editingRecord.record_type || this._editingRecord.treatment_type || 'general';
            const frontendTreatmentType = this.reverseRecordTypeMapping[backendRecordType] || 'Limpieza';
            form.querySelector('#treatment-type-select').value = frontendTreatmentType;

            form.querySelector('#description-textarea').value = this._editingRecord.description || '';
            form.querySelector('#diagnosis-textarea').value = this._editingRecord.diagnosis || '';
            form.querySelector('#treatment-plan-textarea').value = this._editingRecord.treatment_plan || '';
            form.querySelector('#notes-textarea').value = this._editingRecord.treatment_notes || this._editingRecord.notes || '';
            form.querySelector('#cost-input').value = this._editingRecord.treatment_cost || this._editingRecord.cost || 0;

            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Editar Registro Dental';

            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Actualizar Registro';
        } else {
            // Modo creación
            form.reset();

            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Nuevo Registro Dental';

            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Crear Registro';
        }
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');
        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const form = this.shadowRoot.querySelector('.record-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Cerrar al hacer clic fuera del modal
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
    }

    async handleSubmit() {
        const form = this.shadowRoot.querySelector('.record-form');
        if (!form) return;

        const formData = new FormData(form);
        const treatmentType = formData.get('treatment_type') || 'general';

        // Mapear los tipos de tratamiento del frontend a los valores aceptados por el backend
        const recordTypeMapping = {
            'Limpieza': 'general',
            'Extracción': 'surgery',
            'Empaste': 'general',
            'Corona': 'general',
            'Ortodoncia': 'orthodontic',
            'Endodoncia': 'surgery',
            'Implante': 'surgery',
            'Blanqueamiento': 'general',
            'Consulta': 'general',
            'Otro': 'general'
        };

        const patientId = parseInt(formData.get('patient_id'));
        const recordData = {
            patient_id: patientId,
            record_type: recordTypeMapping[treatmentType] || 'general',
            description: formData.get('description')?.trim() || '',
            diagnosis: formData.get('diagnosis')?.trim() || '',
            treatment_plan: formData.get('treatment_plan')?.trim() || '',
            treatment_notes: formData.get('notes')?.trim() || '',
            treatment_cost: parseFloat(formData.get('cost')) || 0,
            payment_status: 'pending'
        };

        // Validación
        if (!patientId || isNaN(patientId) || patientId <= 0) {
            this.showError('Por favor, seleccione un paciente válido.');
            return;
        }

        if (!recordData.record_type) {
            this.showError('Por favor, seleccione un tipo de tratamiento.');
            return;
        }

        if (!recordData.description || recordData.description.trim().length === 0) {
            this.showError('Por favor, ingrese una descripción del tratamiento.');
            return;
        }

        if (!recordData.diagnosis || recordData.diagnosis.trim().length === 0) {
            this.showError('Por favor, ingrese el diagnóstico del paciente.');
            return;
        }

        if (!recordData.treatment_plan || recordData.treatment_plan.trim().length === 0) {
            this.showError('Por favor, ingrese el plan de tratamiento.');
            return;
        }

        const cost = parseFloat(formData.get('cost'));
        if (isNaN(cost) || cost < 0) {
            this.showError('El costo debe ser un número positivo.');
            return;
        }

        // Verificar que los campos de texto no estén vacíos después del trim
        if (recordData.description.trim().length === 0 ||
            recordData.diagnosis.trim().length === 0 ||
            recordData.treatment_plan.trim().length === 0) {
            this.showError('Los campos de texto no pueden contener solo espacios en blanco.');
            return;
        }

        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const errorMsg = this.shadowRoot.querySelector('.error-message');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this._editingRecord ? 'Actualizando...' : 'Creando...';
            if (errorMsg) errorMsg.textContent = '';

            const dentalRecordsService = (await import('../../services/dental-records-service.js')).default;

            let result;
            if (this._editingRecord) {
                const recordId = parseInt(this._editingRecord.id || this._editingRecord._id);
                result = await dentalRecordsService.updateDentalRecord(recordId, recordData);
            } else {
                result = await dentalRecordsService.createDentalRecord(recordData);
            }

            // Despachar evento de éxito
            this.dispatchEvent(new CustomEvent('record-saved', {
                bubbles: true,
                composed: true,
                detail: { record: result, isEdit: !!this._editingRecord }
            }));

            this.close();
        } catch (error) {
            const errorMessage = error.message || 'Error al guardar el registro dental. Por favor, intente nuevamente.';
            this.showError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this._editingRecord ? 'Actualizar Registro' : 'Crear Registro';
        }
    }

    showError(message) {
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
    }

    render() {
        // Crear opciones de pacientes
        const patientOptions = this._patients.map(patient =>
            `<option value="${patient.id}">${patient.name}</option>`
        ).join('');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }

                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1001;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .modal-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 28px;
                    color: #666;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .close-btn:hover {
                    background: #f0f0f0;
                }

                .modal-body {
                    padding: 24px;
                }

                .record-form {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-label {
                    font-weight: 500;
                    color: #333;
                    font-size: 14px;
                }

                .form-label .required {
                    color: #e53935;
                }

                .form-input,
                .form-select,
                .form-textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }

                .form-input:focus,
                .form-select:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: #2196F3;
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .error-message {
                    display: none;
                    padding: 12px;
                    background: #ffebee;
                    color: #c62828;
                    border-radius: 6px;
                    font-size: 14px;
                    margin-top: 8px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 24px;
                    border-top: 1px solid #e0e0e0;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn {
                    background: #f5f5f5;
                    color: #333;
                }

                .cancel-btn:hover {
                    background: #e0e0e0;
                }

                .submit-btn {
                    background: #2196F3;
                    color: white;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #1976D2;
                }

                .submit-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
            </style>

            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Nuevo Registro Dental</h2>
                    <button class="close-btn" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="record-form">
                        <div class="form-group">
                            <label class="form-label" for="patient-select">
                                Paciente <span class="required">*</span>
                            </label>
                            <select class="form-select" id="patient-select" name="patient_id" required>
                                <option value="">Seleccione un paciente</option>
                                ${patientOptions}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="treatment-type-select">
                                Tipo de Tratamiento <span class="required">*</span>
                            </label>
                            <select class="form-select" id="treatment-type-select" name="treatment_type" required>
                                <option value="">Seleccione un tratamiento</option>
                                <option value="Limpieza">Limpieza</option>
                                <option value="Extracción">Extracción</option>
                                <option value="Empaste">Empaste</option>
                                <option value="Corona">Corona</option>
                                <option value="Ortodoncia">Ortodoncia</option>
                                <option value="Endodoncia">Endodoncia</option>
                                <option value="Implante">Implante</option>
                                <option value="Blanqueamiento">Blanqueamiento</option>
                                <option value="Consulta">Consulta</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label" for="description-textarea">
                                Descripción del Tratamiento <span class="required">*</span>
                            </label>
                            <textarea
                                class="form-textarea"
                                id="description-textarea"
                                name="description"
                                required
                                placeholder="Describa el tratamiento realizado..."
                            ></textarea>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label" for="diagnosis-textarea">
                                Diagnóstico <span class="required">*</span>
                            </label>
                            <textarea
                                class="form-textarea"
                                id="diagnosis-textarea"
                                name="diagnosis"
                                required
                                placeholder="Diagnóstico del paciente..."
                            ></textarea>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label" for="treatment-plan-textarea">
                                Plan de Tratamiento <span class="required">*</span>
                            </label>
                            <textarea
                                class="form-textarea"
                                id="treatment-plan-textarea"
                                name="treatment_plan"
                                required
                                placeholder="Plan de tratamiento recomendado..."
                            ></textarea>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label" for="notes-textarea">
                                Notas Adicionales
                            </label>
                            <textarea
                                class="form-textarea"
                                id="notes-textarea"
                                name="notes"
                                placeholder="Observaciones, complicaciones, recomendaciones..."
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="cost-input">
                                Costo (opcional)
                            </label>
                            <input
                                type="number"
                                class="form-input"
                                id="cost-input"
                                name="cost"
                                min="0"
                                step="0.01"
                                value="0"
                                placeholder="0.00"
                            />
                        </div>

                        <div class="error-message"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn cancel-btn">Cancelar</button>
                    <button type="button" class="btn submit-btn">Crear Registro</button>
                </div>
            </div>
        `;
    }
}

customElements.define('dental-records-modal', DentalRecordsModal);
