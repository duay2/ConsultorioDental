/**
 * edit-appointment-modal
 * Modal para editar una cita existente
 */
class EditAppointmentModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._appointmentId = null;
        this._appointment = null;
        this._patients = [];
        this._doctors = [];
        this._occupiedTimes = [];
        this._timeSlots = this.generateTimeSlots();
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
            const [patientService, userService, appointmentService] = await Promise.all([
                import('../services/patient-service.js'),
                import('../services/user-service.js'),
                import('../services/appointment-service.js')
            ]);

            console.log('Cargando datos para edición...');
            
            // Cargar la cita actual
            if (this._appointmentId) {
                this._appointment = await appointmentService.default.getAppointmentById(this._appointmentId);
                console.log('Cita cargada:', this._appointment);
            }

            const [patients, doctors] = await Promise.all([
                patientService.default.getAllPatients().catch(err => {
                    console.error('Error al cargar pacientes:', err);
                    throw new Error(`Error al cargar pacientes: ${err.message}`);
                }),
                userService.default.getDoctorsAndDentists().catch(err => {
                    console.error('Error al cargar doctores:', err);
                    throw new Error(`Error al cargar doctores: ${err.message}`);
                })
            ]);

            this._patients = patients || [];
            this._doctors = doctors || [];

            // Cargar horarios ocupados para la fecha actual de la cita
            if (this._appointment) {
                await this.loadOccupiedTimes();
            }

            this.updateSelects();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.showError(error.message || 'Error al cargar los datos necesarios.');
        }
    }

    async loadOccupiedTimes() {
        if (!this._appointment) return;

        try {
            const appointmentService = await import('../services/appointment-service.js');
            const dateStr = this.formatDateForAPI(new Date(this._appointment.appointment_date));
            
            const appointments = await appointmentService.default.getAppointmentsByDate(dateStr);
            
            // Obtener horarios ocupados, excluyendo la cita actual que estamos editando
            this._occupiedTimes = appointments
                .filter(apt => apt.id !== this._appointmentId)
                .map(apt => apt.appointment_time || apt.time)
                .filter(time => time);
            
            console.log('Horarios ocupados (excluyendo cita actual):', this._occupiedTimes);
            this.updateTimeSelect();
        } catch (error) {
            console.error('Error al cargar horarios ocupados:', error);
        }
    }

    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    updateSelects() {
        const patientSelect = this.shadowRoot.querySelector('#patient-select');
        const doctorSelect = this.shadowRoot.querySelector('#doctor-select');
        const dateInput = this.shadowRoot.querySelector('#date-input');
        const timeSelect = this.shadowRoot.querySelector('#time-select');
        const typeSelect = this.shadowRoot.querySelector('#type-select');
        const durationSelect = this.shadowRoot.querySelector('#duration-select');
        const notesTextarea = this.shadowRoot.querySelector('#notes-textarea');

        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
            this._patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.first_name} ${patient.last_name}`;
                if (this._appointment && this._appointment.patient_info && 
                    this._appointment.patient_info.id === patient.id) {
                    option.selected = true;
                }
                patientSelect.appendChild(option);
            });
        }

        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Seleccione un doctor</option>';
            this._doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = doctor.name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || doctor.email;
                if (this._appointment && this._appointment.doctor_info && 
                    this._appointment.doctor_info.id === doctor.id) {
                    option.selected = true;
                }
                doctorSelect.appendChild(option);
            });
        }

        if (dateInput && this._appointment) {
            // Manejar la fecha correctamente para evitar problemas de zona horaria
            let appointmentDate;
            if (typeof this._appointment.appointment_date === 'string') {
                // Si es string, puede ser ISO string o YYYY-MM-DD
                if (this._appointment.appointment_date.includes('T')) {
                    // Es ISO string (UTC), usar métodos UTC para obtener el día correcto
                    appointmentDate = new Date(this._appointment.appointment_date);
                    // Usar métodos UTC para obtener año, mes y día
                    const year = appointmentDate.getUTCFullYear();
                    const month = String(appointmentDate.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(appointmentDate.getUTCDate()).padStart(2, '0');
                    const dateValue = `${year}-${month}-${day}`;
                    
                    console.log('[EditAppointmentModal] Fecha de cita original (ISO):', this._appointment.appointment_date);
                    console.log('[EditAppointmentModal] Fecha procesada (UTC):', dateValue);
                    dateInput.value = dateValue;
                    return; // Salir temprano para evitar procesar dos veces
                } else {
                    // Es YYYY-MM-DD, usar directamente
                    dateInput.value = this._appointment.appointment_date;
                    console.log('[EditAppointmentModal] Fecha de cita (string):', this._appointment.appointment_date);
                    return;
                }
            } else if (this._appointment.appointment_date instanceof Date) {
                appointmentDate = this._appointment.appointment_date;
            } else {
                appointmentDate = new Date(this._appointment.appointment_date);
            }
            
            // Si llegamos aquí, usar métodos UTC para obtener año, mes y día
            const year = appointmentDate.getUTCFullYear();
            const month = String(appointmentDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(appointmentDate.getUTCDate()).padStart(2, '0');
            const dateValue = `${year}-${month}-${day}`;
            
            console.log('[EditAppointmentModal] Fecha de cita original:', this._appointment.appointment_date);
            console.log('[EditAppointmentModal] Fecha procesada (UTC):', dateValue);
            dateInput.value = dateValue;
        }

        if (typeSelect && this._appointment) {
            typeSelect.value = this._appointment.type || 'consultation';
        }

        if (durationSelect && this._appointment) {
            durationSelect.value = this._appointment.duration_minutes || 30;
        }

        if (notesTextarea && this._appointment) {
            notesTextarea.value = this._appointment.notes || '';
        }

        this.updateTimeSelect();
    }

    updateTimeSelect() {
        const timeSelect = this.shadowRoot.querySelector('#time-select');
        if (!timeSelect) return;

        timeSelect.innerHTML = '<option value="">Seleccione una hora</option>';
        
        this._timeSlots.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            
            // Marcar como deshabilitado si está ocupado (excepto la hora actual de la cita)
            const isOccupied = this._occupiedTimes.includes(time);
            const isCurrentTime = this._appointment && 
                (this._appointment.appointment_time === time || this._appointment.time === time);
            
            if (isOccupied && !isCurrentTime) {
                option.disabled = true;
                option.textContent += ' (Ocupado)';
            }
            
            // Seleccionar la hora actual de la cita
            if (isCurrentTime) {
                option.selected = true;
            }
            
            timeSelect.appendChild(option);
        });
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const form = this.shadowRoot.querySelector('.appointment-form');
        const dateInput = this.shadowRoot.querySelector('#date-input');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
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

        if (dateInput) {
            dateInput.addEventListener('change', () => {
                this.loadOccupiedTimes();
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
        const dateStr = formData.get('date');
        const time = formData.get('time');
        const type = formData.get('type');
        const notes = formData.get('notes');
        const duration = parseInt(formData.get('duration')) || 30;

        // Validación
        if (!patientId || !doctorId || !dateStr || !time) {
            this.showError('Por favor, complete todos los campos requeridos.');
            return;
        }

        // Validar que el horario no esté ocupado (excepto si es la hora actual)
        const isCurrentTime = this._appointment && 
            (this._appointment.appointment_time === time || this._appointment.time === time);
        if (this._occupiedTimes.includes(time) && !isCurrentTime) {
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
            submitBtn.textContent = 'Guardando...';
            if (errorMsg) errorMsg.textContent = '';

            const appointmentService = await import('../services/appointment-service.js');

            // Asegurar que dateStr esté en formato YYYY-MM-DD
            console.log('[EditAppointmentModal] Fecha seleccionada en input:', dateStr);
            console.log('[EditAppointmentModal] Validando formato de fecha...');
            
            // Validar que la fecha esté en formato correcto
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(dateStr)) {
                throw new Error('Formato de fecha inválido');
            }
            
            const updateData = {
                appointment_date: dateStr, // Enviar como string YYYY-MM-DD
                appointment_time: time,
                type: type || 'consultation',
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

            console.log('[EditAppointmentModal] Actualizando cita con:', updateData);
            console.log('[EditAppointmentModal] Fecha que se enviará al backend:', dateStr);

            const updatedAppointment = await appointmentService.default.updateAppointment(
                this._appointmentId,
                updateData
            );

            console.log('[EditAppointmentModal] Cita actualizada exitosamente:', updatedAppointment);

            // Cerrar modal primero
            this.close();

            // Despachar evento de éxito después de cerrar el modal
            // Esto permite que el modal se cierre visualmente antes de recargar
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('appointment-updated', {
                    bubbles: true,
                    composed: true,
                    detail: { appointment: updatedAppointment }
                }));
            }, 100);
        } catch (error) {
            console.error('Error al actualizar cita:', error);
            const errorMessage = error.message || 'Error al actualizar la cita. Por favor, intente nuevamente.';
            this.showError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    }

    showError(message) {
        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
    }

    async open(appointmentId) {
        this._appointmentId = appointmentId;
        this.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Cargar datos de la cita y formularios
        await this.loadData();
    }

    close() {
        this.style.display = 'none';
        document.body.style.overflow = '';
        
        // Limpiar datos
        this._appointmentId = null;
        this._appointment = null;
        
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

                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .form-select option:disabled {
                    color: #999;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 24px;
                    border-top: 1px solid #e0e0e0;
                }

                .submit-btn,
                .cancel-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
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

                .cancel-btn {
                    background: #f5f5f5;
                    color: #333;
                }

                .cancel-btn:hover {
                    background: #e0e0e0;
                }

                .error-message {
                    display: none;
                    padding: 12px;
                    background: #ffebee;
                    color: #c62828;
                    border-radius: 6px;
                    font-size: 14px;
                    margin-bottom: 16px;
                }
            </style>

            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Editar Cita</h2>
                    <button class="close-btn" aria-label="Cerrar">×</button>
                </div>
                <div class="modal-body">
                    <div class="error-message"></div>
                    <form class="appointment-form">
                        <div class="form-group">
                            <label class="form-label" for="patient-select">
                                Paciente <span class="required">*</span>
                            </label>
                            <select id="patient-select" name="patient" class="form-select" required>
                                <option value="">Seleccione un paciente</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="doctor-select">
                                Doctor <span class="required">*</span>
                            </label>
                            <select id="doctor-select" name="doctor" class="form-select" required>
                                <option value="">Seleccione un doctor</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="date-input">
                                Fecha <span class="required">*</span>
                            </label>
                            <input type="date" id="date-input" name="date" class="form-input" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="time-select">
                                Hora <span class="required">*</span>
                            </label>
                            <select id="time-select" name="time" class="form-select" required>
                                <option value="">Seleccione una hora</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="type-select">
                                Tipo de Cita
                            </label>
                            <select id="type-select" name="type" class="form-select">
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
                            <select id="duration-select" name="duration" class="form-select">
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">60 minutos</option>
                                <option value="90">90 minutos</option>
                                <option value="120">120 minutos</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="notes-textarea">
                                Notas
                            </label>
                            <textarea id="notes-textarea" name="notes" class="form-textarea" placeholder="Notas adicionales sobre la cita..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="cancel-btn" onclick="this.getRootNode().host.close()">Cancelar</button>
                    <button type="submit" class="submit-btn">Guardar Cambios</button>
                </div>
            </div>
        `;
    }
}

customElements.define('edit-appointment-modal', EditAppointmentModal);

