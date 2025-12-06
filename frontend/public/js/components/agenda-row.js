/**
 * agenda-row
 * Componente que representa una fila completa de la agenda (hora + time-slot)
 */
class AgendaRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._time = '';
    }

    static get observedAttributes() {
        return ['time'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'time' && oldValue !== newValue) {
            this._time = newValue || '';
            if (this.shadowRoot) {
                this.updateTimeLabel();
            }
        }
    }

    connectedCallback() {
        this.render();
    }

    updateTimeLabel() {
        const timeLabel = this.shadowRoot.querySelector('.time-label');
        if (timeLabel) {
            timeLabel.textContent = this._time;
        }

        const timeSlot = this.shadowRoot.querySelector('time-slot');
        if (timeSlot) {
            timeSlot.setAttribute('time', this._time);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    width: 100%;
                    border-bottom: 1px solid #e0e0e0;
                    min-height: 60px;
                }

                .time-label {
                    width: 80px;
                    padding: 12px 16px;
                    font-weight: 500;
                    color: #666;
                    display: flex;
                    align-items: center;
                    background: #fafafa;
                    border-right: 1px solid #e0e0e0;
                    flex-shrink: 0;
                }

                .slot-container {
                    flex: 1;
                    padding: 4px 12px;
                    display: flex;
                    align-items: flex-start;
                }
            </style>

            <div class="time-label">${this._time}</div>
            <div class="slot-container">
                <time-slot time="${this._time}">
                    <slot></slot>
                </time-slot>
            </div>
        `;

        // Asegurar que el time-slot tenga el atributo time
        const timeSlot = this.shadowRoot.querySelector('time-slot');
        if (timeSlot && this._time) {
            timeSlot.setAttribute('time', this._time);
        }
    }
}

customElements.define('agenda-row', AgendaRow);

