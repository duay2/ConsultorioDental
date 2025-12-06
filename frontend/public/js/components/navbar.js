/**
 * app-navbar
 * Barra de navegación superior con logo, menú y perfil de usuario
 */
class AppNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isRendered = false;
    }

    connectedCallback() {
        // Evitar renderizado múltiple
        if (this._isRendered) {
            console.warn('Navbar ya renderizado, evitando doble render');
            return;
        }
        
        if (!this.shadowRoot.innerHTML) {
            this.render();
            this._isRendered = true;
        }
        // Cargar datos del usuario después de renderizar
        this.loadUserInfo();
    }

    updateUserInfo(user) {
        if (!user) return;
        
        const userNameEl = this.shadowRoot.querySelector('#user-name');
        const userRoleEl = this.shadowRoot.querySelector('#user-role');
        const userAvatarEl = this.shadowRoot.querySelector('#user-avatar');

        if (userNameEl) {
            userNameEl.textContent = user.name || 'Usuario';
        }
        
        if (userRoleEl) {
            const roleMap = {
                'admin': 'Administrador',
                'doctor': 'Dentista',
                'assistant': 'Asistente'
            };
            userRoleEl.textContent = roleMap[user.role] || user.role || 'Usuario';
        }

        if (userAvatarEl && user.name) {
            userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
        }
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

                .navbar {
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .navbar-left {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 600;
                    text-decoration: none;
                }

                .logo-icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                }

                .nav-links {
                    display: flex;
                    gap: 0.5rem;
                }

                .nav-link {
                    padding: 0.5rem 1.25rem;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }

                .nav-link:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .nav-link.active {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    font-weight: 600;
                }

                .navbar-right {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: white;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.1rem;
                }

                .user-details {
                    display: flex;
                    flex-direction: column;
                }

                .user-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .user-role {
                    font-size: 0.8rem;
                    opacity: 0.9;
                }

                .logout-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .logout-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                }

                .logout-icon {
                    width: 16px;
                    height: 16px;
                }
            </style>
            <nav class="navbar">
                <div class="navbar-left">
                    <a href="#" class="logo">
                        <span>DentalFlow</span>
                    </a>
                    <div class="nav-links">
                        <a href="#" class="nav-link active" data-section="pacientes">Pacientes</a>
                        <a href="#" class="nav-link" data-section="citas">Citas</a>
                        <a href="#" class="nav-link" data-section="registros">Registros</a>
                        <a href="#" class="nav-link" data-section="inventario">Inventario</a>
                    </div>
                </div>
                <div class="navbar-right">
                    <div class="user-info">
                        <div class="user-avatar" id="user-avatar">U</div>
                        <div class="user-details">
                            <div class="user-name" id="user-name">Usuario</div>
                            <div class="user-role" id="user-role">Cargando...</div>
                        </div>
                    </div>
                    <button class="logout-btn">
                        <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </nav>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Cargar datos del usuario si está autenticado
        this.loadUserInfo();

        // Event listeners
        this.shadowRoot.querySelector('.logout-btn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('logout', { bubbles: true }));
        });

        // Navegación
        this.shadowRoot.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.setActiveSection(section);
                this.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { section },
                    bubbles: true 
                }));
            });
        });
    }

    async loadUserInfo() {
        try {
            // Verificar que el shadowRoot esté listo
            if (!this.shadowRoot) {
                console.warn('Navbar shadowRoot no está listo');
                return;
            }
            
            const authService = (await import('../services/auth-service.js')).default;
            const user = authService.getUser();
            
            if (user) {
                this.updateUserInfo(user);
            } else {
                // Si no hay usuario, mantener valores por defecto
                const userNameEl = this.shadowRoot.querySelector('#user-name');
                const userRoleEl = this.shadowRoot.querySelector('#user-role');
                if (userNameEl) userNameEl.textContent = 'Usuario';
                if (userRoleEl) userRoleEl.textContent = 'No autenticado';
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    setActiveSection(section) {
        this.shadowRoot.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });
    }
}

customElements.define('app-navbar', AppNavbar);

