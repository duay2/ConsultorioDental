/**
 * user-modal
 * Modal para crear o editar un usuario
 */
class UserModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._editingUser = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    open(user = null) {
        this._editingUser = user;
        this.updateForm();
        this.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.style.display = 'none';
        document.body.style.overflow = '';

        const form = this.shadowRoot.querySelector('.user-form');
        if (form) form.reset();

        const errorMsg = this.shadowRoot.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }

        this._editingUser = null;
    }

    updateForm() {
        const form = this.shadowRoot.querySelector('.user-form');
        if (!form) return;

        if (this._editingUser) {
            form.querySelector('#name-input').value = this._editingUser.name || '';
            form.querySelector('#last-name-input').value = this._editingUser.last_name || '';
            form.querySelector('#email-input').value = this._editingUser.email || '';
            form.querySelector('#phone-input').value = this._editingUser.phone || '';
            form.querySelector('#role-select').value = this._editingUser.role || '';
            
            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Editar Usuario';

            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Actualizar Usuario';

            // Mostrar campo de contraseña en edición (opcional)
            const passwordGroup = this.shadowRoot.querySelector('.password-group');
            const passwordLabel = this.shadowRoot.querySelector('#password-label');
            const passwordInput = this.shadowRoot.querySelector('#password-input');
            if (passwordGroup) {
                passwordGroup.style.display = 'flex';
                if (passwordLabel) {
                    passwordLabel.innerHTML = 'Nueva Contraseña (opcional)';
                }
                if (passwordInput) {
                    passwordInput.removeAttribute('required');
                    passwordInput.value = '';
                    passwordInput.placeholder = 'Dejar vacío para mantener la contraseña actual';
                }
            }
        } else {
            form.reset();

            const title = this.shadowRoot.querySelector('.modal-title');
            if (title) title.textContent = 'Nuevo Usuario';

            const submitBtn = this.shadowRoot.querySelector('.submit-btn');
            if (submitBtn) submitBtn.textContent = 'Crear Usuario';

            // Mostrar campo de contraseña en creación (requerido)
            const passwordGroup = this.shadowRoot.querySelector('.password-group');
            const passwordLabel = this.shadowRoot.querySelector('#password-label');
            const passwordInput = this.shadowRoot.querySelector('#password-input');
            if (passwordGroup) {
                passwordGroup.style.display = 'flex';
                if (passwordLabel) {
                    passwordLabel.innerHTML = 'Contraseña <span class="required">*</span>';
                }
                if (passwordInput) {
                    passwordInput.setAttribute('required', 'required');
                    passwordInput.placeholder = 'Mínimo 6 caracteres';
                }
            }
        }
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');
        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const form = this.shadowRoot.querySelector('.user-form');

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
        const form = this.shadowRoot.querySelector('.user-form');
        if (!form) return;

        const formData = new FormData(form);

        const getValue = (key) => {
            const value = formData.get(key);
            return value && value.trim() !== '' ? value.trim() : null;
        };

        const name = getValue('name');
        const lastName = getValue('last_name');
        const email = getValue('email');
        const phone = getValue('phone');
        const role = getValue('role');
        const password = getValue('password');

        if (!name || !email || !role) {
            this.showError('Por favor, complete todos los campos requeridos (Nombre, Email y Rol).');
            return;
        }

        if (!this._editingUser && !password) {
            this.showError('La contraseña es requerida para crear un nuevo usuario.');
            return;
        }

        // Solo validar longitud mínima al crear un nuevo usuario, no al editar
        if (!this._editingUser && password && password.length < 6) {
            this.showError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Por favor, ingrese un email válido.');
            return;
        }

        const userData = {
            name: name,
            last_name: lastName || '',
            email: email,
            phone: phone || '',
            role: role
        };

        if (password) {
            userData.password = password;
        }

        const submitBtn = this.shadowRoot.querySelector('.submit-btn');
        const errorMsg = this.shadowRoot.querySelector('.error-message');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this._editingUser ? 'Actualizando...' : 'Creando...';
            if (errorMsg) errorMsg.textContent = '';

            const userService = await import('../../services/user-service.js');

            let result;
            if (this._editingUser) {
                const userId = parseInt(this._editingUser.id || this._editingUser._id);
                result = await userService.default.updateUser(userId, userData);
            } else {
                result = await userService.default.createUser(userData);
            }

            this.dispatchEvent(new CustomEvent('user-saved', {
                bubbles: true,
                composed: true,
                detail: { user: result, isEdit: !!this._editingUser }
            }));

            this.close();
        } catch (error) {
            const errorMessage = error.message || 'Error al guardar el usuario. Por favor, intente nuevamente.';
            this.showError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = this._editingUser ? 'Actualizar Usuario' : 'Crear Usuario';
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

                .user-form {
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
                .form-select {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }

                .form-input:focus,
                .form-select:focus {
                    outline: none;
                    border-color: #2196F3;
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
                    <h2 class="modal-title">Nuevo Usuario</h2>
                    <button class="close-btn" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="user-form">
                        <div class="form-group">
                            <label class="form-label" for="name-input">
                                Nombre <span class="required">*</span>
                            </label>
                            <input
                                type="text"
                                class="form-input"
                                id="name-input"
                                name="name"
                                required
                                placeholder="Luis"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="last-name-input">
                                Apellido
                            </label>
                            <input
                                type="text"
                                class="form-input"
                                id="last-name-input"
                                name="last_name"
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
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                class="form-input"
                                id="phone-input"
                                name="phone"
                                placeholder="6221478946"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="role-select">
                                Rol <span class="required">*</span>
                            </label>
                            <select class="form-select" id="role-select" name="role" required>
                                <option value="">Seleccione un rol</option>
                                <option value="admin">Administrador</option>
                                <option value="doctor">Doctor</option>
                                <option value="assistant">Asistente</option>
                                <option value="receptionist">Secretaria</option>
                            </select>
                        </div>

                        <div class="form-group password-group full-width">
                            <label class="form-label" id="password-label" for="password-input">
                                Contraseña <span class="required">*</span>
                            </label>
                            <input
                                type="password"
                                class="form-input"
                                id="password-input"
                                name="password"
                                placeholder="Mínimo 6 caracteres"
                                minlength="6"
                                required
                            />
                        </div>

                        <div class="error-message"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn cancel-btn">Cancelar</button>
                    <button type="button" class="btn submit-btn">Crear Usuario</button>
                </div>
            </div>
        `;
    }
}

customElements.define('user-modal', UserModal);

