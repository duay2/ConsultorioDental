/**
 * new-appointment-modal
 * Modal para crear una nueva cita
 */
class NewAppointmentModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._selectedDate = new Date();
        this._patients = [];
        this._doctors = [];
        this._occupiedTimes = [];
        this._timeSlots = this.generateTimeSlots();
    }

    static get observedAttributes() {
        return ['selected-date'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'selected-date' && oldValue !== newValue) {
            // Si newValue es un string YYYY-MM-DD, crear Date correctamente en hora local
            // Usar new Date(year, month - 1, day) para crear la fecha en hora local medianoche
            if (newValue && typeof newValue === 'string') {
                const parts = newValue.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);
                    // Crear fecha en hora local (medianoche local del día especificado)
                    this._selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
                    console.log('[NewAppointmentModal] Fecha string recibida:', newValue);
                    console.log('[NewAppointmentModal] Fecha creada (local):', this._selectedDate);
                    console.log('[NewAppointmentModal] Año:', year, 'Mes:', month, 'Día:', day);
                    console.log('[NewAppointmentModal] Fecha formateada:', this.formatDateForAPI(this._selectedDate));
                } else {
                    this._selectedDate = new Date(newValue);
                }
            } else {
                this._selectedDate = newValue ? new Date(newValue) : new Date();
            }
            if (this.shadowRoot) {
                this.loadOccupiedTimes();
            }
        }
    }

    generateTimeSlots() {
        const slots = [];
        const startHour = 8;
        const endHour = 13;
        
        for (let hour = startHour; hour <= endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < endHour) {
                slots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        
        return slots;
    }

    connectedCallback() {
        this.render();
        this.loadData();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            // Verificar autenticación
            const authService = await import('../services/auth-service.js');
            if (!authService.default.isAuthenticated()) {
                this.showError('No estás autenticado. Por favor, inicia sesión.');
                return;
            }

            // Cargar pacientes y doctores en paralelo
            const [patientService, userService] = await Promise.all([
                import('../services/patient-service.js'),
                import('../services/user-service.js')
            ]);

            console.log('Cargando pacientes y doctores...');
            
            const [patients, doctors] = await Promise.all([
                patientService.default.getAllPatients().catch(err => {
                    console.error('Error específico al cargar pacientes:', err);
                    throw new Error(`Error al cargar pacientes: ${err.message}`);
                }),
                userService.default.getDoctorsAndDentists().catch(err => {
                    console.error('Error específico al cargar doctores:', err);
                    throw new Error(`Error al cargar doctores: ${err.message}`);
                })
            ]);

            console.log('Pacientes cargados:', patients.length);
            console.log('Doctores cargados:', doctors.length);

            this._patients = patients || [];
            this._doctors = doctors || [];
            
            if (this._patients.length === 0) {
                this.showError('No hay pacientes registrados. Por favor, registre pacientes primero.');
            }
            
            if (this._doctors.length === 0) {
                this.showError('No hay doctores registrados. Por favor, registre doctores primero.');
            }
            
            this.updateSelects();
            await this.loadOccupiedTimes();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            const errorMessage = error.message || 'Error al cargar datos. Por favor, recarga la página.';
            this.showError(errorMessage);
        }
    }

    async loadOccupiedTimes() {
        try {
            const appointmentService = await import('../services/appointment-service.js');
            const dateStr = this.formatDateForAPI(this._selectedDate);
            const appointments = await appointmentService.default.getAppointmentsByDate(dateStr);
            
            this._occupiedTimes = appointments.map(apt => apt.appointment_time || apt.time);
            this.updateTimeSelect();
        } catch (error) {
            console.error('Error al cargar horarios ocupados:', error);
        }
    }

    formatDateForAPI(date) {
        // Usar métodos de fecha local (getFullYear, getMonth, getDate) para evitar problemas de zona horaria
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        console.log('[NewAppointmentModal] Fecha formateada para API:', dateStr, 'desde fecha:', date);
        return dateStr;
    }

    updateSelects() {
        const patientSelect = this.shadowRoot.querySelector('#patient-select');
        const doctorSelect = this.shadowRoot.querySelector('#doctor-select');

        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
            this._patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.first_name} ${patient.last_name} - ${patient.phone || 'Sin teléfono'}`;
                patientSelect.appendChild(option);
            });
        }

        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Seleccione un doctor</option>';
            this._doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = doctor.name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || doctor.email;
                doctorSelect.appendChild(option);
            });
        }
    }

    updateTimeSelect() {
        const timeSelect = this.shadowRoot.querySelector('#time-select');
        if (!timeSelect) return;

        timeSelect.innerHTML = '<option value="">Seleccione una hora</option>';
        
        this._timeSlots.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            
            const isOccupied = this._occupiedTimes.includes(time);
            option.textContent = isOccupied ? `${time} (Ocupado)` : time;
            option.disabled = isOccupied;
            option.style.color = isOccupied ? '#999' : '#000';
            
            timeSelect.appendChild(option);
        });
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');
        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const form = this.shadowRoot.querySelector('.appointment-form');

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
        const form = this.shadowRoot.querySelector('.appointment-form');
        if (!form) return;

        const formData = new FormData(form);
        const patientId = formData.get('patient');
        const doctorId = formData.get('doctor');
        const time = formData.get('time');
        const type = formData.get('type');
        const notes = formData.get('notes');
        const duration = parseInt(formData.get('duration')) || 30;

        // Validación
        if (!patientId || !doctorId || !time) {
            this.showError('Por favor, complete todos los campos requeridos.');
            return;
        }

        // Validar que el horario no esté ocupado
        if (this._occupiedTimes.includes(time)) {
            this.showError('Este horario ya está ocupado. Por favor, seleccione otro.');
            return;
        }

        // Obtener datos del paciente y doctor
        const patient = this._patients.find(p => p.id === parseInt(patientId));
        const doctor = this._doctors.find(d => d.id === parseInt(doctorId));

        if (!patient || !doctor) {
            this.showError('Error al obtener datos del paciente o doctor.');
            return;
        }

        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando...';
            if (errorMsg) errorMsg.textContent = '';

            const appointmentService = await import('../services/appointment-service.js');
            const dateStr = this.formatDateForAPI(this._selectedDate);
            
            console.log('[NewAppointmentModal] Creando cita con:');
            console.log('  - Fecha seleccionada (Date object):', this._selectedDate);
            console.log('  - Fecha formateada (string):', dateStr);
            console.log('  - Hora:', time);
            console.log('  - Año:', this._selectedDate.getFullYear());
            console.log('  - Mes:', this._selectedDate.getMonth() + 1);
            console.log('  - Día:', this._selectedDate.getDate());

            const appointmentData = {
                appointment_date: dateStr,
                appointment_time: time,
                type: type || 'consultation',
                status: 'scheduled',
                notes: notes || '',
                duration_minutes: duration,
                patient_info: {
                    id: patient.id,
                    name: `${patient.first_name} ${patient.last_name}`,
                    phone: patient.phone || ''
                },
                doctor_info: {
                    id: doctor.id,
                    name: doctor.name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || doctor.email
                }
            };

            const newAppointment = await appointmentService.default.createAppointment(appointmentData);

            // Despachar evento de éxito
            this.dispatchEvent(new CustomEvent('appointment-created', {
                bubbles: true,
                composed: true,
                detail: { appointment: newAppointment }
            }));

            this.close();
        } catch (error) {
            console.error('Error al crear cita:', error);
            const errorMessage = error.message || 'Error al crear la cita. Por favor, intente nuevamente.';
            this.showError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cita';
        }
    }

    showError(message) {
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
    }

    open() {
        this.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.style.display = 'none';
        document.body.style.overflow = '';
        
        // Limpiar formulario
        const form = this.shadowRoot.querySelector('.appointment-form');
        if (form) form.reset();
        
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
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
                    max-width: 600px;
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

                .appointment-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
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

                .form-select:disabled {
                    background: #f5f5f5;
                    color: #999;
                    cursor: not-allowed;
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
                    <h2 class="modal-title">Nueva Cita</h2>
                    <button class="close-btn" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="appointment-form">
                        <div class="form-group">
                            <label class="form-label" for="patient-select">
                                Paciente <span class="required">*</span>
                            </label>
                            <select class="form-select" id="patient-select" name="patient" required>
                                <option value="">Cargando pacientes...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="doctor-select">
                                Doctor <span class="required">*</span>
                            </label>
                            <select class="form-select" id="doctor-select" name="doctor" required>
                                <option value="">Cargando doctores...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="time-select">
                                Hora <span class="required">*</span>
                            </label>
                            <select class="form-select" id="time-select" name="time" required>
                                <option value="">Cargando horarios...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="type-select">
                                Tipo de Cita
                            </label>
                            <select class="form-select" id="type-select" name="type">
                                <option value="consultation">Consulta</option>
                                <option value="cleaning">Limpieza</option>
                                <option value="treatment">Tratamiento</option>
                                <option value="follow-up">Seguimiento</option>
                                <option value="emergency">Emergencia</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="duration-select">
                                Duración (minutos)
                            </label>
                            <select class="form-select" id="duration-select" name="duration">
                                <option value="30">30 minutos</option>
                                <option value="60">60 minutos</option>
                                <option value="90">90 minutos</option>
                                <option value="120">120 minutos</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="notes-textarea">
                                Notas
                            </label>
                            <textarea 
                                class="form-textarea" 
                                id="notes-textarea" 
                                name="notes" 
                                placeholder="Notas adicionales sobre la cita..."
                            ></textarea>
                        </div>

                        <div class="error-message"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn cancel-btn">Cancelar</button>
                    <button type="button" class="btn submit-btn">Crear Cita</button>
                </div>
            </div>
        `;
    }
}

customElements.define('new-appointment-modal', NewAppointmentModal);

