/**
 * user-view
 * Vista principal de gestión de usuarios
 */
class UserView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSearch = '';
        this._userModalInstance = null;
        this._confirmationModalInstance = null;
    }

    connectedCallback() {
        this.render();
        this._userModalInstance = this.shadowRoot.querySelector('user-modal');
        this._confirmationModalInstance = this.shadowRoot.querySelector('confirmation-modal');
        this.setupEventListeners();
        this.loadUserData();
    }

    getUserModal() {
        return this._userModalInstance;
    }

    async loadUserData() {
        try {
            const userService = (await import('../../services/user-service.js')).default;
            this.userData = await userService.getAllUsers(1, 100);

            this.applyFilters();
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            this.userData = [];
            this.applyFilters();
        }
    }

    applyFilters() {
        if (this.currentSearch.trim()) {
            this.filteredData = this.userData.filter(user => {
                const fullName = `${user.name || ''} ${user.last_name || ''}`.trim().toLowerCase();
                return fullName.includes(this.currentSearch.toLowerCase()) ||
                    (user.email || '').toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                    (user.phone || '').includes(this.currentSearch);
            });
        } else {
            this.filteredData = [...this.userData];
        }

        setTimeout(() => {
            this.updateTable();
        }, 50);
    }

    setupEventListeners() {
        // Botón nuevo usuario
        const newUserBtn = this.shadowRoot.querySelector('#new-user-btn');
        if (newUserBtn) {
            newUserBtn.addEventListener('click', () => {
                const modal = this.getUserModal();
                if (modal) {
                    modal.open();
                }
            });
        }

        // Evento de confirmación de eliminación
        this.shadowRoot.addEventListener('delete-user-requested', async (e) => {
            await this.handleDeleteUser(e.detail);
        });

        // Buscador
        const searchInput = this.shadowRoot.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Eventos de la tabla - editar usuario
        this.shadowRoot.addEventListener('edit-user-requested', (e) => {
            this.handleEditUser(e.detail);
        });

        // Evento de usuario guardado
        this.shadowRoot.addEventListener('user-saved', () => {
            this.loadUserData();
        });

        // Paginación
        this.shadowRoot.addEventListener('page-change', (e) => {
            this.handlePageChange(e);
        });
    }

    handleEditUser(detail) {
        const modal = this.getUserModal();
        if (modal && detail.user) {
            modal.open(detail.user);
        }
    }

    async handleDeleteUser(detail) {
        const confirmModal = this._confirmationModalInstance;
        if (!confirmModal) {
            console.error('No se encontró la instancia del modal de confirmación.');
            return;
        }

        const message = `¿Está seguro de que desea eliminar al usuario ${detail.userName}? Esta acción no se puede deshacer.`;
        const confirmed = await confirmModal.open('Eliminar Usuario', message);

        if (confirmed) {
            try {
                const userService = (await import('../../services/user-service.js')).default;
                await userService.deleteUser(detail.userId);

                await this.loadUserData();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                alert('Error al eliminar usuario. Por favor, intente nuevamente.');
            }
        }
    }

    updateTable() {
        let table = this.shadowRoot.querySelector('user-table');
        if (!table) {
            setTimeout(() => {
                this.updateTable();
            }, 100);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        table.setAttribute('data-items', JSON.stringify(pageData));

        // Actualizar paginación
        const pagination = this.shadowRoot.querySelector('table-pagination');
        if (pagination) {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
            pagination.setAttribute('current-page', this.currentPage.toString());
            pagination.setAttribute('total-pages', totalPages.toString());
        }
    }

    handlePageChange(e) {
        this.currentPage = e.detail.page;
        this.updateTable();
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

                .user-view {
                    min-height: 100vh;
                    background: #f5f5f5;
                    padding: 2rem;
                }

                .view-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .view-title {
                    font-size: 2rem;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .new-user-btn {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .new-user-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
                }

                .search-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .search-input {
                    padding: 0.5rem 1rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    width: 250px;
                    transition: border-color 0.3s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #4A90E2;
                }

                .table-container {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
            </style>
            <div class="user-view">
                <div class="view-header">
                    <h1 class="view-title">Gestión de Usuarios</h1>
                    <div class="header-actions">
                        <button id="new-user-btn" class="new-user-btn">
                            <span>+</span>
                            <span>Nuevo Usuario</span>
                        </button>
                        <div class="search-group">
                            <input type="text" id="search-input" class="search-input" placeholder="Buscar usuarios...">
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <user-table></user-table>
                    <table-pagination></table-pagination>
                </div>
                <user-modal></user-modal>
                <confirmation-modal></confirmation-modal>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('user-view', UserView);

