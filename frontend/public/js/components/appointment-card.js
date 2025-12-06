/**
 * appointment-card
 * Componente arrastrable que representa una cita en la agenda
 */
class AppointmentCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._appointmentId = null;
        this._patientName = '';
        this._time = '';
        this._status = 'scheduled'; // 'scheduled' (azul) o 'confirmed' (verde)
        this._duration = 30; // minutos
        this._isDragging = false;
    }

    static get observedAttributes() {
        return ['appointment-id', 'patient-name', 'time', 'status', 'duration'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'appointment-id':
                this._appointmentId = newValue;
                break;
            case 'patient-name':
                this._patientName = newValue || '';
                break;
            case 'time':
                this._time = newValue || '';
                break;
            case 'status':
                this._status = newValue || 'scheduled';
                break;
            case 'duration':
                this._duration = parseInt(newValue) || 30;
                break;
        }

        if (this.shadowRoot) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        this.setupDragAndDrop();
        this.setupDeleteButton();
        this.setupEditButton();
    }

    setupEditButton() {
        const editBtn = this.shadowRoot.querySelector('.edit-btn');
        if (!editBtn) {
            console.warn('[AppointmentCard] Botón de editar no encontrado');
            return;
        }

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se active el drag
            e.preventDefault();
            
            console.log('[AppointmentCard] Botón de editar clickeado, ID de cita:', this._appointmentId);
            
            // Despachar evento para abrir modal de edición
            const event = new CustomEvent('appointment-edit', {
                bubbles: true,
                composed: true,
                detail: {
                    appointmentId: this._appointmentId,
                    patientName: this._patientName,
                    time: this._time
                }
            });
            
            console.log('[AppointmentCard] Despachando evento appointment-edit:', event.detail);
            this.dispatchEvent(event);
        });
    }

    setupDeleteButton() {
        const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
        if (!deleteBtn) return;

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se active el drag
            e.preventDefault();
            
            // Confirmar eliminación
            const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la cita de ${this._patientName} a las ${this._time}?`);
            
            if (confirmDelete) {
                // Despachar evento personalizado para que el componente padre maneje la eliminación
                this.dispatchEvent(new CustomEvent('appointment-delete', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        appointmentId: this._appointmentId,
                        patientName: this._patientName,
                        time: this._time
                    }
                }));
            }
        });
    }

    setupDragAndDrop() {
        const card = this.shadowRoot.querySelector('.appointment-card');
        if (!card) return;

        // Hacer el elemento arrastrable
        card.setAttribute('draggable', 'true');

        // Evento dragstart - cuando comienza el arrastre
        card.addEventListener('dragstart', (e) => {
            // No permitir drag si se hace clic en los botones de acción
            const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
            const editBtn = this.shadowRoot.querySelector('.edit-btn');
            const actionsContainer = this.shadowRoot.querySelector('.appointment-actions');
            
            if (actionsContainer && actionsContainer.contains(e.target)) {
                e.preventDefault();
                return;
            }

            this._isDragging = true;
            
            // Guardar el ID de la cita en dataTransfer
            e.dataTransfer.setData('text/plain', this._appointmentId);
            e.dataTransfer.effectAllowed = 'move';

            // Cambiar opacidad para feedback visual
            card.style.opacity = '0.5';
            card.style.cursor = 'grabbing';

            // Crear imagen personalizada para el arrastre (opcional)
            const dragImage = card.cloneNode(true);
            dragImage.style.width = card.offsetWidth + 'px';
            e.dataTransfer.setDragImage(dragImage, 0, 0);

            console.log(`[AppointmentCard] Iniciando arrastre de cita ID: ${this._appointmentId}`);
        });

        // Evento dragend - cuando termina el arrastre
        card.addEventListener('dragend', (e) => {
            this._isDragging = false;
            
            // Restaurar opacidad
            card.style.opacity = '1';
            card.style.cursor = 'grab';

            // Verificar si se soltó exitosamente
            if (e.dataTransfer.dropEffect === 'move') {
                console.log(`[AppointmentCard] Cita ${this._appointmentId} soltada exitosamente`);
            } else {
                console.log(`[AppointmentCard] Arrastre cancelado para cita ${this._appointmentId}`);
            }
        });
    }

    getStatusColor() {
        return this._status === 'confirmed' || this._status === 'completed' ? 'green' : 'blue';
    }

    getStatusText() {
        const statusMap = {
            'scheduled': 'Programada',
            'confirmed': 'Confirmada',
            'completed': 'Completada',
            'cancelled': 'Cancelada',
            'rescheduled': 'Reagendada'
        };
        return statusMap[this._status] || 'Programada';
    }

    render() {
        const color = this.getStatusColor();
        const statusText = this.getStatusText();
        const displayTime = this._time || '00:00';
        const displayName = this._patientName || 'Sin nombre';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    margin-bottom: 4px;
                }

                .appointment-card {
                    background: ${color === 'green' ? '#4CAF50' : '#2196F3'};
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: grab;
                    user-select: none;
                    transition: opacity 0.2s, transform 0.2s;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    font-size: 14px;
                    font-weight: 500;
                }

                .appointment-card:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
                }

                .appointment-card:active {
                    cursor: grabbing;
                }

                .appointment-card:has(.appointment-actions:hover) {
                    cursor: default;
                }

                .appointment-time {
                    font-weight: 600;
                    margin-bottom: 2px;
                }

                .appointment-name {
                    font-size: 13px;
                    opacity: 0.95;
                }

                .appointment-status {
                    font-size: 11px;
                    opacity: 0.9;
                    margin-top: 2px;
                }

                .appointment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 4px;
                }

                .appointment-actions {
                    display: flex;
                    gap: 4px;
                    flex-shrink: 0;
                    margin-left: 8px;
                }

                .edit-btn,
                .delete-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 1;
                    transition: background 0.2s;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .edit-btn:hover {
                    background: rgba(33, 150, 243, 0.8);
                }

                .edit-btn:active {
                    background: rgba(33, 150, 243, 1);
                }

                .delete-btn:hover {
                    background: rgba(255, 77, 77, 0.8);
                }

                .delete-btn:active {
                    background: rgba(255, 77, 77, 1);
                }

                .appointment-content {
                    flex: 1;
                }
            </style>

            <div class="appointment-card" draggable="true">
                <div class="appointment-header">
                    <div class="appointment-content">
                        <div class="appointment-time">${displayTime}</div>
                        <div class="appointment-name">${displayName}</div>
                        <div class="appointment-status">(${statusText})</div>
                    </div>
                    <div class="appointment-actions">
                        <button class="edit-btn" title="Editar cita">✎</button>
                        <button class="delete-btn" title="Eliminar cita">×</button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('appointment-card', AppointmentCard);

