/**
 * login-view
 * Componente de login para autenticación
 */
class LoginView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isLoading = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = this.shadowRoot.querySelector('.login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    async handleLogin() {
        if (this.isLoading) return;

        const emailInput = this.shadowRoot.querySelector('#email');
        const passwordInput = this.shadowRoot.querySelector('#password');
        const errorMessage = this.shadowRoot.querySelector('.error-message');
        const submitBtn = this.shadowRoot.querySelector('.submit-btn');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validación básica
        if (!email || !password) {
            this.showError('Por favor, completa todos los campos');
            return;
        }

        this.isLoading = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';

        try {
            // servicio de autenticación
            const authService = (await import('../services/auth-service.js')).default;
            
            await authService.login(email, password);

            // evento de login exitoso
            this.dispatchEvent(new CustomEvent('login-success', { 
                bubbles: true,
                detail: { user: authService.getUser() }
            }));

        } catch (error) {
            console.error('Error completo:', error);
            let errorMsg = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            
            // Mensajes más específicos según el tipo de error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMsg = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000';
            } else if (error.message.includes('Credenciales inválidas')) {
                errorMsg = 'El email o la contraseña son incorrectos. Verifica tus credenciales.';
            }
            
            this.showError(errorMsg);
        } finally {
            this.isLoading = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    }

    showError(message) {
        const errorMessage = this.shadowRoot.querySelector('.error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .login-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .login-card {
                    background: white;
                    border-radius: 16px;
                    padding: 3rem;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .logo-text {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .login-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                }

                .login-subtitle {
                    font-size: 0.95rem;
                    color: #666;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #333;
                }

                .form-input {
                    padding: 0.75rem 1rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #4A90E2;
                }

                .error-message {
                    display: none;
                    padding: 0.75rem;
                    background: #fee;
                    border: 1px solid #fcc;
                    border-radius: 8px;
                    color: #c33;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .submit-btn {
                    padding: 0.875rem;
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    margin-top: 0.5rem;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            </style>
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="logo-container">
                            <div class="logo-text">DentalFlow</div>
                        </div>
                        <h1 class="login-title">Iniciar Sesión</h1>
                        <p class="login-subtitle">Ingresa tus credenciales para continuar</p>
                    </div>
                    <form class="login-form">
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                class="form-input" 
                                placeholder="tu@email.com"
                                required
                                autocomplete="email"
                            >
                        </div>
                        <div class="form-group">
                            <label for="password" class="form-label">Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                class="form-input" 
                                placeholder="••••••••"
                                required
                                autocomplete="current-password"
                            >
                        </div>
                        <div class="error-message"></div>
                        <button type="submit" class="submit-btn">Iniciar Sesión</button>
                    </form>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('login-view', LoginView);
