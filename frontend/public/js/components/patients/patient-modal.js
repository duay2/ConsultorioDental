/**
 * patient-modal
 * Modal para crear o editar un paciente
 */
class PatientModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._editingPatient = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    open(patient = null) {
        this._editingPatient = patient;
        this.updateForm();
        this.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.style.display = 'none';
        document.body.style.overflow = '';

        // Limpiar formulario
        const form = this.shadowRoot.querySelector('.patient-form');
        if (form) form.reset();

        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }

        this._editingPatient = null;
    }

    updateForm() {
        const form = this.shadowRoot.querySelector('.patient-form');
        if (!form) return;

        if (this._editingPatient) {
            // Modo edición
            form.querySelector('#first-name-input').value = this._editingPatient.first_name || '';
            form.querySelector('#last-name-input').value = this._editingPatient.last_name || '';
            form.querySelector('#email-input').value = this._editingPatient.email || '';
            form.querySelector('#phone-input').value = this._editingPatient.phone || '';
            form.querySelector('#birth-date-input').value = this._editingPatient.birth_date ?
                new Date(this._editingPatient.birth_date).toISOString().split('T')[0] : '';
            form.querySelector('#address-input').value = this._editingPatient.address || '';
            form.querySelector('#medical-history-textarea').value = this._editingPatient.medical_history || '';

            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Editar Paciente';

            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Actualizar Paciente';
        } else {
            // Modo creación
            form.reset();

            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Nuevo Paciente';

            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Crear Paciente';
        }
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');
        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const form = this.shadowRoot.querySelector('.patient-form');

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
        const form = this.shadowRoot.querySelector('.patient-form');
        if (!form) return;

        const formData = new FormData(form);

        // Obtener valores y limpiar strings vacíos
        const getValue = (key) => {
            const value = formData.get(key);
            return value && value.trim() !== '' ? value.trim() : null;
        };

        const firstName = getValue('first_name');
        const lastName = getValue('last_name');
        const email = getValue('email');
        const phone = getValue('phone');
        const birthDate = getValue('birth_date');
        const address = getValue('address');
        const medicalHistory = getValue('medical_history');
        
        // Validación de campos requeridos
        if (!firstName || !lastName || !email || !phone) {
            this.showError('Por favor, complete todos los campos requeridos (Primer Nombre, Apellido, Email y Teléfono).');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Por favor, ingrese un email válido.');
            return;
        }

        // Construir objeto de datos del paciente
        const patientData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone
        };
        
        // Solo incluir campos opcionales si tienen valor
        if (birthDate) {
            patientData.birth_date = birthDate;
        }
        
        if (address) {
            patientData.address = address;
        }
        
        if (medicalHistory) {
            patientData.medical_history = medicalHistory;
        }

        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const errorMsg = this.shadowRoot.querySelector('.error-message');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this._editingPatient ? 'Actualizando...' : 'Creando...';
            if (errorMsg) errorMsg.textContent = '';

            const patientService = await import('../../services/patient-service.js');

            let result;
            if (this._editingPatient) {
                const patientId = parseInt(this._editingPatient.id || this._editingPatient._id);
                result = await patientService.default.updatePatient(patientId, patientData);
            } else {
                result = await patientService.default.createPatient(patientData);
            }

            // Despachar evento de éxito
            this.dispatchEvent(new CustomEvent('patient-saved', {
                bubbles: true,
                composed: true,
                detail: { patient: result, isEdit: !!this._editingPatient }
            }));

            this.close();
        } catch (error) {
            const errorMessage = error.message || 'Error al guardar el paciente. Por favor, intente nuevamente.';
            this.showError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this._editingPatient ? 'Actualizar Paciente' : 'Crear Paciente';
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

                .patient-form {
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
                .form-textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }

                .form-input:focus,
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
                    <h2 class="modal-title">Nuevo Paciente</h2>
                    <button class="close-btn" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="patient-form">
                        <div class="form-group">
                            <label class="form-label" for="first-name-input">
                                Primer Nombre <span class="required">*</span>
                            </label>
                            <input
                                type="text"
                                class="form-input"
                                id="first-name-input"
                                name="first_name"
                                required
                                placeholder="Luis"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="last-name-input">
                                Apellido <span class="required">*</span>
                            </label>
                            <input
                                type="text"
                                class="form-input"
                                id="last-name-input"
                                name="last_name"
                                required
                                placeholder="Suarez"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="email-input">
                                Email <span class="required">*</span>
                            </label>
                            <input
                                type="email"
                                class="form-input"
                                id="email-input"
                                name="email"
                                required
                                placeholder="luis@gmail.com"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="phone-input">
                                Teléfono <span class="required">*</span>
                            </label>
                            <input
                                type="tel"
                                class="form-input"
                                id="phone-input"
                                name="phone"
                                required
                                placeholder="6221478946"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="birth-date-input">
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                class="form-input"
                                id="birth-date-input"
                                name="birth_date"
                            />
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label" for="address-input">
                                Dirección
                            </label>
                            <input
                                type="text"
                                class="form-input"
                                id="address-input"
                                name="address"
                                placeholder="Calle, número"
                            />
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label" for="medical-history-textarea">
                                Antecedentes Médicos
                            </label>
                            <textarea
                                class="form-textarea"
                                id="medical-history-textarea"
                                name="medical_history"
                                placeholder="Alergias, enfermedades crónicas..."
                            ></textarea>
                        </div>

                        <div class="error-message"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn cancel-btn">Cancelar</button>
                    <button type="button" class="btn submit-btn">Crear Paciente</button>
                </div>
            </div>
        `;
    }
}

customElements.define('patient-modal', PatientModal);
