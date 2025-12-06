/**
 * table-pagination
 * Componente de paginación para tablas
 * Emite eventos cuando se cambia de página
 */
class TablePagination extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentPage = 1;
        this.totalPages = 1;
    }

    static get observedAttributes() {
        return ['current-page', 'total-pages'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'current-page' && newValue) {
            this.currentPage = parseInt(newValue) || 1;
            this.updateButtons();
        }
        if (name === 'total-pages' && newValue) {
            this.totalPages = parseInt(newValue) || 1;
            this.updateButtons();
        }
    }

    updateButtons() {
        const firstBtn = this.shadowRoot.querySelector('#first-page');
        const prevBtn = this.shadowRoot.querySelector('#prev-page');
        const nextBtn = this.shadowRoot.querySelector('#next-page');
        const lastBtn = this.shadowRoot.querySelector('#last-page');
        const currentPageSpan = this.shadowRoot.querySelector('#current-page');

        if (currentPageSpan) {
            currentPageSpan.textContent = this.currentPage;
        }

        // Habilitar/deshabilitar botones
        if (firstBtn) firstBtn.disabled = this.currentPage === 1;
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
        if (lastBtn) lastBtn.disabled = this.currentPage >= this.totalPages;
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        this.updateButtons();
        
        this.dispatchEvent(new CustomEvent('page-change', {
            bubbles: true,
            detail: { page: this.currentPage }
        }));
    }

    setupEventListeners() {
        this.shadowRoot.querySelector('#first-page').addEventListener('click', () => {
            this.goToPage(1);
        });

        this.shadowRoot.querySelector('#prev-page').addEventListener('click', () => {
            this.goToPage(this.currentPage - 1);
        });

        this.shadowRoot.querySelector('#next-page').addEventListener('click', () => {
            this.goToPage(this.currentPage + 1);
        });

        this.shadowRoot.querySelector('#last-page').addEventListener('click', () => {
            this.goToPage(this.totalPages);
        });
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

                .pagination {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e0e0e0;
                }

                .pagination-btn {
                    width: 36px;
                    height: 36px;
                    border: 1px solid #e0e0e0;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    font-size: 0.9rem;
                    color: #333;
                }

                .pagination-btn:hover:not(:disabled) {
                    background: #f5f5f5;
                    border-color: #4A90E2;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .pagination-btn.current {
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    color: white;
                    border-color: #4A90E2;
                    font-weight: 600;
                }

                .pagination-icon {
                    width: 16px;
                    height: 16px;
                }
            </style>
            <div class="pagination">
                <button id="first-page" class="pagination-btn" title="Primera página">
                    <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="11 17 6 12 11 7"></polyline>
                        <polyline points="18 17 13 12 18 7"></polyline>
                    </svg>
                </button>
                <button id="prev-page" class="pagination-btn" title="Página anterior">
                    <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="pagination-btn current" id="current-page">1</button>
                <button id="next-page" class="pagination-btn" title="Página siguiente">
                    <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                <button id="last-page" class="pagination-btn" title="Última página">
                    <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="13 17 18 12 13 7"></polyline>
                        <polyline points="6 17 11 12 6 7"></polyline>
                    </svg>
                </button>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        // Configurar event listeners
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }
}

customElements.define('table-pagination', TablePagination);

