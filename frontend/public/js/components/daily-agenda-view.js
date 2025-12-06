/**
 * daily-agenda-view
 * Vista principal de la agenda diaria con funcionalidad de drag and drop
 */
class DailyAgendaView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._currentDate = new Date();
        this._appointments = [];
        this._timeSlots = this.generateTimeSlots();
    }

    connectedCallback() {
        this.render();
        this.loadAppointments();
        this.setupEventListeners();
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

    formatDate(date, useUTC = false) {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        // Si useUTC es true, usar métodos UTC para evitar problemas de zona horaria
        const dayName = useUTC ? days[date.getUTCDay()] : days[date.getDay()];
        const day = useUTC ? date.getUTCDate() : date.getDate();
        const month = useUTC ? months[date.getUTCMonth()] : months[date.getMonth()];
        
        return `${dayName}, ${day} de ${month}`;
    }

    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        console.log('[DailyAgendaView] Fecha formateada para API:', dateStr);
        return dateStr;
    }

    async loadAppointments() {
        try {
            // Importar dinámicamente el servicio
            const appointmentService = await import('../services/appointment-service.js');
            const dateStr = this.formatDateForAPI(this._currentDate);
            
            console.log('[DailyAgendaView] Cargando citas para fecha:', dateStr);
            
            // Primero, obtener todas las citas para debugging
            try {
                const allAppointments = await appointmentService.default.getAllAppointments(1, 100);
                console.log('[DailyAgendaView] TODAS las citas en la BD:', allAppointments.data || allAppointments);
                if (allAppointments.data) {
                    allAppointments.data.forEach((apt, idx) => {
                        console.log(`[DailyAgendaView] Cita ${idx + 1} en BD:`, {
                            id: apt.id,
                            date: apt.appointment_date,
                            time: apt.appointment_time,
                            patient: apt.patient_info?.name || apt.patient_info
                        });
                    });
                }
            } catch (err) {
                console.warn('[DailyAgendaView] No se pudieron obtener todas las citas:', err);
            }
            
            this._appointments = await appointmentService.default.getAppointmentsByDate(dateStr);
            console.log('[DailyAgendaView] Citas cargadas para fecha específica:', this._appointments);
            console.log('[DailyAgendaView] Número de citas:', this._appointments.length);
            
            // Log de cada cita para debugging
            this._appointments.forEach((apt, index) => {
                console.log(`[DailyAgendaView] Cita ${index + 1}:`, {
                    id: apt.id,
                    date: apt.appointment_date,
                    time: apt.appointment_time,
                    patient: apt.patient_info,
                    status: apt.status
                });
            });
            
            this.renderAppointments();
        } catch (error) {
            console.error('Error al cargar citas:', error);
            
            // Mostrar error al usuario
            const errorMessage = error.message || 'Error al cargar las citas. Verifique su conexión.';
            this.showErrorMessage(errorMessage);
            
            // Usar datos de ejemplo si falla la API (solo para desarrollo)
            if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
                console.warn('Usando datos de ejemplo debido a error de red');
                this._appointments = this.getSampleAppointments();
                this.renderAppointments();
            } else {
                this._appointments = [];
                this.renderAppointments();
            }
        }
    }

    getSampleAppointments() {
        // Datos de ejemplo para desarrollo
        return [
            {
                id: 1,
                appointment_time: '08:30',
                patient_info: { first_name: 'María', last_name: 'L' },
                status: 'confirmed',
                duration_minutes: 30
            },
            {
                id: 2,
                appointment_time: '09:30',
                patient_info: { first_name: 'Pedro', last_name: 'S' },
                status: 'scheduled',
                duration_minutes: 60
            }
        ];
    }

    getAppointmentsForTime(time) {
        return this._appointments.filter(apt => {
            const aptTime = apt.appointment_time || apt.time;
            return aptTime === time;
        });
    }

    renderAppointments() {
        const agendaContainer = this.shadowRoot.querySelector('.agenda-container');
        if (!agendaContainer) {
            console.warn('[DailyAgendaView] No se encontró el contenedor de agenda');
            return;
        }

        console.log('[DailyAgendaView] Renderizando citas...');
        console.log('[DailyAgendaView] Total de citas a renderizar:', this._appointments.length);

        // Limpiar citas existentes de todos los rows
        const rows = agendaContainer.querySelectorAll('agenda-row');
        console.log('[DailyAgendaView] Filas encontradas:', rows.length);
        
        rows.forEach(row => {
            if (row.shadowRoot) {
                const slotContainer = row.shadowRoot.querySelector('.slot-container');
                if (slotContainer) {
                    const timeSlot = slotContainer.querySelector('time-slot');
                    if (timeSlot) {
                        // Limpiar todas las tarjetas existentes
                        const existingCards = timeSlot.querySelectorAll('appointment-card');
                        existingCards.forEach(card => {
                            console.log('[DailyAgendaView] Eliminando tarjeta existente:', card.getAttribute('appointment-id'));
                            card.remove();
                        });
                    }
                }
            }
        });

        // Renderizar citas en sus respectivos time-slots
        this._appointments.forEach((appointment, index) => {
            // Normalizar el tiempo - puede venir como "10:00" o "10:00:00" o Date object
            let time = appointment.appointment_time || appointment.time;
            
            // Si es un objeto Date, extraer la hora
            if (time instanceof Date) {
                const hours = String(time.getHours()).padStart(2, '0');
                const minutes = String(time.getMinutes()).padStart(2, '0');
                time = `${hours}:${minutes}`;
            }
            
            // Si tiene segundos, removerlos (ej: "10:00:00" -> "10:00")
            if (typeof time === 'string' && time.includes(':')) {
                const parts = time.split(':');
                time = `${parts[0]}:${parts[1]}`;
            }
            
            console.log(`[DailyAgendaView] Cita ${index + 1} - Buscando fila para hora: "${time}"`);
            
            const row = agendaContainer.querySelector(`agenda-row[time="${time}"]`);
            
            if (!row) {
                console.warn(`[DailyAgendaView] No se encontró fila para hora "${time}"`);
                return;
            }
            
            if (row && row.shadowRoot) {
                const slotContainer = row.shadowRoot.querySelector('.slot-container');
                if (slotContainer) {
                    const timeSlot = slotContainer.querySelector('time-slot');
                    if (timeSlot) {
                        const card = document.createElement('appointment-card');
                        card.setAttribute('appointment-id', appointment.id);
                        
                        // Obtener nombre del paciente
                        let patientName = '';
                        if (appointment.patient_info) {
                            if (appointment.patient_info.name) {
                                patientName = appointment.patient_info.name;
                            } else if (appointment.patient_info.first_name || appointment.patient_info.last_name) {
                                patientName = `${appointment.patient_info.first_name || ''} ${appointment.patient_info.last_name || ''}`.trim();
                            }
                        }
                        
                        if (!patientName) {
                            patientName = 'Paciente';
                        }
                        
                        card.setAttribute('patient-name', patientName);
                        card.setAttribute('time', time);
                        card.setAttribute('status', appointment.status || 'scheduled');
                        card.setAttribute('duration', appointment.duration_minutes || 30);
                        
                        // Asegurar que la tarjeta se agregue correctamente
                        timeSlot.appendChild(card);
                        console.log(`[DailyAgendaView] Cita ${index + 1} (ID: ${appointment.id}) renderizada en hora ${time} para paciente: ${patientName}`);
                    } else {
                        console.warn(`[DailyAgendaView] No se encontró time-slot en la fila para hora "${time}"`);
                    }
                } else {
                    console.warn(`[DailyAgendaView] No se encontró slot-container en la fila para hora "${time}"`);
                }
            } else {
                console.warn(`[DailyAgendaView] La fila para hora "${time}" no tiene shadowRoot`);
            }
        });
        
        console.log('[DailyAgendaView] Renderizado completado');
    }

    setupEventListeners() {
        // Navegación de fechas
        const prevBtn = this.shadowRoot.querySelector('.date-nav-prev');
        const nextBtn = this.shadowRoot.querySelector('.date-nav-next');
        const newAppointmentBtn = this.shadowRoot.querySelector('.new-appointment-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this._currentDate.setDate(this._currentDate.getDate() - 1);
                this.updateDateDisplay();
                this.loadAppointments();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this._currentDate.setDate(this._currentDate.getDate() + 1);
                this.updateDateDisplay();
                this.loadAppointments();
            });
        }

        if (newAppointmentBtn) {
            newAppointmentBtn.addEventListener('click', () => {
                this.openNewAppointmentModal();
            });
        }

        // Escuchar evento de cita creada (desde el modal que está fuera del shadow DOM)
        document.addEventListener('appointment-created', async (e) => {
            const { appointment } = e.detail;
            console.log('[DailyAgendaView] Nueva cita creada:', appointment);
            
            // Mostrar confirmación
            this.showSuccessMessage('Cita creada exitosamente');
            
            // Recargar citas
            await this.loadAppointments();
        });

        // Escuchar evento de edición de cita (desde appointment-card)
        document.addEventListener('appointment-edit', async (e) => {
            console.log('[DailyAgendaView] Evento appointment-edit recibido:', e.detail);
            const { appointmentId } = e.detail;
            
            if (!appointmentId) {
                console.error('[DailyAgendaView] ID de cita no proporcionado en el evento');
                return;
            }
            
            console.log('[DailyAgendaView] Abriendo modal de edición para cita:', appointmentId);
            this.openEditAppointmentModal(appointmentId);
        });

        // Escuchar evento de cita actualizada (desde el modal de edición)
        document.addEventListener('appointment-updated', async (e) => {
            const { appointment } = e.detail;
            console.log('[DailyAgendaView] Cita actualizada:', appointment);
            
            // Obtener la fecha de la cita actualizada usando UTC
            let appointmentDate;
            let appointmentDateStr = null;
            
            if (appointment.appointment_date) {
                if (typeof appointment.appointment_date === 'string') {
                    appointmentDate = new Date(appointment.appointment_date);
                    // Usar métodos UTC para obtener el día correcto
                    const year = appointmentDate.getUTCFullYear();
                    const month = String(appointmentDate.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(appointmentDate.getUTCDate()).padStart(2, '0');
                    appointmentDateStr = `${year}-${month}-${day}`;
                } else {
                    appointmentDate = new Date(appointment.appointment_date);
                    const year = appointmentDate.getUTCFullYear();
                    const month = String(appointmentDate.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(appointmentDate.getUTCDate()).padStart(2, '0');
                    appointmentDateStr = `${year}-${month}-${day}`;
                }
            }
            
            const currentDateStr = this.formatDateForAPI(this._currentDate);
            
            console.log('[DailyAgendaView] Fecha de cita actualizada:', appointmentDateStr);
            console.log('[DailyAgendaView] Fecha actual del calendario:', currentDateStr);
            
            // Si la cita cambió de fecha, cambiar la vista al día de la cita
            if (appointmentDateStr && appointmentDateStr !== currentDateStr) {
                console.log('[DailyAgendaView] La cita cambió de fecha, actualizando vista al día:', appointmentDateStr);
                
                // Crear fecha correcta usando UTC para el mensaje y la vista
                const [year, month, day] = appointmentDateStr.split('-').map(Number);
                const dateForMessage = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Usar mediodía UTC para evitar problemas de zona horaria
                
                // Crear fecha local para la vista (usando hora local)
                const localDate = new Date(year, month - 1, day);
                
                this._currentDate = localDate;
                this.updateDateDisplay();
                
                // Formatear fecha para el mensaje usando la fecha local
                this.showSuccessMessage(`Cita actualizada y movida al ${this.formatDate(localDate)}`);
            } else {
                this.showSuccessMessage('Cita actualizada exitosamente');
            }
            
            // Esperar un momento para asegurar que la BD se actualizó
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Recargar citas inmediatamente
            await this.loadAppointments();
        });

        // Escuchar eventos de eliminación (desde appointment-card)
        document.addEventListener('appointment-delete', async (e) => {
            const { appointmentId, patientName, time } = e.detail;
            
            console.log(`[DailyAgendaView] Eliminando cita ${appointmentId} de ${patientName} a las ${time}`);
            
            // Eliminar la cita del backend
            try {
                const appointmentService = await import('../services/appointment-service.js');
                
                // Asegurar que appointmentId sea un número
                const id = parseInt(appointmentId);
                if (isNaN(id)) {
                    throw new Error('ID de cita inválido');
                }
                
                await appointmentService.default.deleteAppointment(id);
                
                // Mostrar confirmación
                this.showSuccessMessage(`Cita de ${patientName} eliminada exitosamente`);
                
                // Recargar citas para actualizar la UI
                await this.loadAppointments();
            } catch (error) {
                console.error('[DailyAgendaView] Error al eliminar cita:', error);
                const errorMessage = error.message || 'Error al eliminar la cita. Por favor, intente nuevamente.';
                this.showErrorMessage(errorMessage);
            }
        });

        // Escuchar eventos de reagendamiento (desde time-slot que está en Shadow DOM)
        document.addEventListener('appointment-rescheduled', async (e) => {
            const { appointmentId, newTime } = e.detail;
            
            console.log(`[DailyAgendaView] Cita ${appointmentId} reagendada a ${newTime}`);
            
            // Validar que el nuevo horario no esté ocupado
            const isOccupied = await this.isTimeSlotOccupied(newTime);
            if (isOccupied) {
                this.showErrorMessage('Este horario ya está ocupado. Por favor, seleccione otro.');
                await this.loadAppointments(); // Recargar para restaurar estado
                return;
            }
            
            // Actualizar la cita en el backend
            try {
                const appointmentService = await import('../services/appointment-service.js');
                const dateStr = this.formatDateForAPI(this._currentDate);
                
                console.log(`[DailyAgendaView] Actualizando cita ${appointmentId} con fecha: ${dateStr}, hora: ${newTime}`);
                
                const updatedAppointment = await appointmentService.default.updateAppointment(appointmentId, {
                    appointment_date: dateStr,
                    appointment_time: newTime
                });

                console.log(`[DailyAgendaView] Cita actualizada en backend:`, updatedAppointment);

                // Mostrar confirmación visual
                this.showSuccessMessage(`Cita reagendada exitosamente a las ${newTime}`);
                
                // Esperar un momento antes de recargar para asegurar que la BD se actualizó
                setTimeout(async () => {
                    await this.loadAppointments();
                }, 500);
            } catch (error) {
                console.error('Error al actualizar cita:', error);
                const errorMessage = error.message || 'Error al reagendar la cita. Por favor, intente nuevamente.';
                this.showErrorMessage(errorMessage);
                
                // Recargar citas para restaurar estado
                await this.loadAppointments();
            }
        });
    }

    updateDateDisplay() {
        const dateDisplay = this.shadowRoot.querySelector('.date-display');
        if (dateDisplay) {
            const isToday = this.isToday(this._currentDate);
            dateDisplay.textContent = isToday ? `Hoy, ${this.formatDate(this._currentDate)}` : this.formatDate(this._currentDate);
        }
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    async isTimeSlotOccupied(time) {
        const appointments = this._appointments.filter(apt => {
            const aptTime = apt.appointment_time || apt.time;
            return aptTime === time;
        });
        return appointments.length > 0;
    }

    openNewAppointmentModal() {
        let modal = document.querySelector('new-appointment-modal');
        
        if (!modal) {
            modal = document.createElement('new-appointment-modal');
            document.body.appendChild(modal);
        }
        
        // Pasar la fecha como string YYYY-MM-DD directamente
        const dateStr = this.formatDateForAPI(this._currentDate);
        console.log('[DailyAgendaView] Abriendo modal con fecha:', dateStr, 'fecha actual:', this._currentDate);
        modal.setAttribute('selected-date', dateStr);
        modal.open();
    }

    openEditAppointmentModal(appointmentId) {
        let modal = document.querySelector('edit-appointment-modal');
        
        if (!modal) {
            modal = document.createElement('edit-appointment-modal');
            document.body.appendChild(modal);
        }
        
        console.log('[DailyAgendaView] Abriendo modal de edición para cita:', appointmentId);
        modal.open(appointmentId);
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        // Remover notificación anterior si existe
        const existingNotification = this.shadowRoot.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 24px;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 2000;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
                font-weight: 500;
            }

            .notification-success {
                background: #4CAF50;
                color: white;
            }

            .notification-error {
                background: #f44336;
                color: white;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;

        if (!this.shadowRoot.querySelector('style[data-notification]')) {
            style.setAttribute('data-notification', 'true');
            this.shadowRoot.appendChild(style);
        }

        this.shadowRoot.appendChild(notification);

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    render() {
        const dateStr = this.isToday(this._currentDate) 
            ? `Hoy, ${this.formatDate(this._currentDate)}` 
            : this.formatDate(this._currentDate);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    min-height: 100vh;
                    background: #f5f5f5;
                    padding: 24px;
                }

                .agenda-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .agenda-title {
                    font-size: 28px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 0;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .date-navigation {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .date-nav-btn {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .date-nav-btn:hover {
                    background: #e0e0e0;
                }

                .date-display {
                    font-size: 16px;
                    font-weight: 500;
                    color: #333;
                    min-width: 200px;
                    text-align: center;
                }

                .new-appointment-btn {
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .new-appointment-btn:hover {
                    background: #1976D2;
                }

                .agenda-card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .agenda-container {
                    display: flex;
                    flex-direction: column;
                }

                .legend {
                    display: flex;
                    gap: 24px;
                    padding: 16px 24px;
                    border-top: 1px solid #e0e0e0;
                    font-size: 14px;
                    color: #666;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .legend-dot.green {
                    background: #4CAF50;
                }

                .legend-dot.blue {
                    background: #2196F3;
                }
            </style>

            <div class="agenda-header">
                <h1 class="agenda-title">Agenda Diaria</h1>
                <div class="header-right">
                    <div class="date-navigation">
                        <button class="date-nav-btn date-nav-prev">&lt;</button>
                        <div class="date-display">${dateStr}</div>
                        <button class="date-nav-btn date-nav-next">&gt;</button>
                    </div>
                    <button class="new-appointment-btn">+ Nueva Cita</button>
                </div>
            </div>

            <div class="agenda-card">
                <div class="agenda-container">
                    ${this._timeSlots.map(time => `
                        <agenda-row time="${time}"></agenda-row>
                    `).join('')}
                </div>

                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-dot green"></div>
                        <span>Confirmada (Verde)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot blue"></div>
                        <span>Programada (Azul) - Arrastre para reagendar</span>
                    </div>
                </div>
            </div>
        `;

        // Renderizar citas después de que el DOM esté listo
        setTimeout(() => {
            this.renderAppointments();
        }, 100);
    }
}

customElements.define('daily-agenda-view', DailyAgendaView);

