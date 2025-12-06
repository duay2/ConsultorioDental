/**
 * time-slot
 * Componente que representa una zona de aterrizaje (drop zone) para citas
 */
class TimeSlot extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._time = '';
        this._isDragOver = false;
    }

    static get observedAttributes() {
        return ['time'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'time' && oldValue !== newValue) {
            this._time = newValue || '';
        }
    }

    connectedCallback() {
        this.render();
        this.setupDropZone();
    }

    setupDropZone() {
        const slot = this.shadowRoot.querySelector('.time-slot');
        if (!slot) return;

        // Prevenir comportamiento por defecto para permitir drop
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';

            if (!this._isDragOver) {
                this._isDragOver = true;
                this.updateVisualFeedback();
            }
        });

        // Cuando el elemento arrastrable entra en la zona
        slot.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!this._isDragOver) {
                this._isDragOver = true;
                this.updateVisualFeedback();
            }
        });

        // Cuando el elemento arrastrable sale de la zona
        slot.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Solo actualizar si realmente salió del slot (no de un hijo)
            const rect = slot.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;

            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                this._isDragOver = false;
                this.updateVisualFeedback();
            }
        });

        // Cuando se suelta el elemento
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            this._isDragOver = false;
            this.updateVisualFeedback();

            // Obtener el ID de la cita desde dataTransfer
            const appointmentId = e.dataTransfer.getData('text/plain');

            if (appointmentId) {
                console.log(`[TimeSlot] Cita ${appointmentId} soltada en horario ${this._time}`);

                // Despachar Custom Event hacia arriba (desde el host, no desde shadowRoot)
                const rescheduleEvent = new CustomEvent('appointment-rescheduled', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        appointmentId: appointmentId,
                        newTime: this._time,
                        timeSlot: this
                    }
                });

                // Disparar desde el host para que pueda ser escuchado fuera del Shadow DOM
                this.dispatchEvent(rescheduleEvent);
                
                // También disparar en el documento para asegurar que se capture
                document.dispatchEvent(new CustomEvent('appointment-rescheduled', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        appointmentId: appointmentId,
                        newTime: this._time,
                        timeSlot: this
                    }
                }));
            }
        });
    }

    updateVisualFeedback() {
        const slot = this.shadowRoot.querySelector('.time-slot');
        if (!slot) return;

        if (this._isDragOver) {
            slot.classList.add('drag-over');
        } else {
            slot.classList.remove('drag-over');
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    min-height: 60px;
                }

                .time-slot {
                    width: 100%;
                    min-height: 60px;
                    background: #f5f5f5;
                    border: 2px dashed transparent;
                    border-radius: 4px;
                    padding: 4px;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .time-slot.drag-over {
                    background: #e3f2fd;
                    border-color: #2196F3;
                    border-style: dashed;
                }

                .time-slot.empty {
                    border: 2px dashed #ccc;
                }

                ::slotted(appointment-card) {
                    display: block;
                }
            </style>

            <div class="time-slot">
                <slot></slot>
            </div>
        `;
    }
}

customElements.define('time-slot', TimeSlot);

