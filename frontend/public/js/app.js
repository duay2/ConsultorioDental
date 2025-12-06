/**
 * Módulo principal de la aplicación
 * Registra e inicializa todos los componentes Web
 */

// Importar todos los componentes
import './components/navbar.js';
import './components/login-view.js';
import './components/dashboard-view.js';
import './components/kpi-card.js';
import './components/activity-feed.js';
import './components/chart-panel.js';
import './components/inventory-view.js';
import './components/inventory-table.js';
import './components/inventory-row.js';
import './components/table-pagination.js';
import './components/inventory-modal.js';
import './components/daily-agenda-view.js';
import './components/agenda-row.js';
import './components/time-slot.js';
import './components/appointment-card.js';
import './components/new-appointment-modal.js';
import './components/edit-appointment-modal.js';
import authService from './services/auth-service.js';

// Variable para evitar múltiples inicializaciones
let isInitialized = false;
let navbarInstance = null;

// Observador para detectar navbars duplicados
const navbarObserver = new MutationObserver((mutations) => {
    const navbars = document.querySelectorAll('app-navbar');
    if (navbars.length > 1) {
        console.warn(`⚠️ DETECTADO: ${navbars.length} navbars en el DOM! Eliminando duplicados...`);
        // Mantener solo el primero, eliminar los demás
        for (let i = 1; i < navbars.length; i++) {
            console.warn(`Eliminando navbar duplicado ${i + 1}`);
            navbars[i].remove();
        }
    }
});

// Iniciar observador cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        navbarObserver.observe(document.body, { childList: true, subtree: true });
    });
} else {
    navbarObserver.observe(document.body, { childList: true, subtree: true });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    if (isInitialized) {
        console.warn('Aplicación ya inicializada, evitando doble inicialización');
        return;
    }
    isInitialized = true;
    
    console.log('DentalFlow - Aplicación inicializada');
    
    // Verificar autenticación y mostrar vista correspondiente
    await checkAuthAndRender();
    
    // Event listeners globales
    setupEventListeners();
});

/**
 * Verifica autenticación y renderiza la vista correspondiente
 */
async function checkAuthAndRender() {
    const isAuthenticated = authService.isAuthenticated();
    const appRoot = document.getElementById('app-root') || document.body;
    
    if (isAuthenticated) {
        showDashboard(appRoot);
    } else {
        showLogin(appRoot);
    }
}

/**
 * Muestra la vista de login
 */
function showLogin(container) {
    // Remover cualquier navbar existente
    const existingNavbars = document.querySelectorAll('app-navbar');
    existingNavbars.forEach(nav => nav.remove());
    navbarInstance = null; // Resetear la referencia
    
    container.innerHTML = '<login-view></login-view>';
    
    const loginView = container.querySelector('login-view');
    if (loginView) {
        // Remover listeners anteriores para evitar duplicados
        loginView.removeEventListener('login-success', handleLoginSuccess);
        loginView.addEventListener('login-success', handleLoginSuccess);
    }
}

// Función separada para manejar login exitoso
function handleLoginSuccess(e) {
    console.log('Login exitoso, mostrando dashboard');
    const appRoot = document.getElementById('app-root') || document.body;
    showDashboard(appRoot);
}

/**
 * Muestra el dashboard
 */
// Variable para evitar múltiples llamadas a showDashboard
let isShowingDashboard = false;

function showDashboard(container) {
    // Evitar múltiples llamadas simultáneas
    if (isShowingDashboard) {
        console.warn('showDashboard ya está ejecutándose, ignorando llamada duplicada');
        return;
    }
    isShowingDashboard = true;
    
    console.log('showDashboard llamado');
    
    // Asegurarse de que container sea el app-root
    const appRoot = document.getElementById('app-root') || container;
    
    // Remover TODOS los navbars existentes (en todo el documento)
    const existingNavbars = document.querySelectorAll('app-navbar');
    console.log(`Navbars encontrados antes de eliminar: ${existingNavbars.length}`);
    existingNavbars.forEach((nav, index) => {
        console.log(`Eliminando navbar ${index + 1}`);
        nav.remove();
    });
    navbarInstance = null; // Resetear la referencia
    
    // Limpiar contenido y mostrar dashboard PRIMERO
    appRoot.innerHTML = '<dashboard-view></dashboard-view>';
    
    // Esperar un momento para asegurar que el DOM se actualizó
    setTimeout(() => {
        // Verificar si ya hay un navbar después de limpiar
        const navbarsAfterClean = document.querySelectorAll('app-navbar');
        console.log(`Navbars después de limpiar: ${navbarsAfterClean.length}`);
        
        // Si aún hay navbars, eliminarlos
        if (navbarsAfterClean.length > 0) {
            console.warn('Aún hay navbars después de limpiar, eliminándolos');
            navbarsAfterClean.forEach(nav => nav.remove());
        }
        
        // Crear un nuevo navbar SOLO si no existe uno
        if (!navbarInstance) {
            console.log('Creando nuevo navbar');
            navbarInstance = document.createElement('app-navbar');
            // Insertar al inicio del body, antes del app-root
            document.body.insertBefore(navbarInstance, appRoot);
            console.log('Navbar creado e insertado');
        } else {
            console.warn('No se creará navbar - navbarInstance ya existe');
        }
        
        isShowingDashboard = false;
    }, 10);
}

/**
 * Muestra la vista de agenda diaria
 */
function showAgenda(container) {
    const appRoot = document.getElementById('app-root') || container;
    appRoot.innerHTML = '<daily-agenda-view></daily-agenda-view>';
    
    // Actualizar navbar para marcar "Citas" como activo
    const navbar = document.querySelector('app-navbar');
    if (navbar && navbar.shadowRoot) {
        const citasLink = navbar.shadowRoot.querySelector('[data-section="citas"]');
        const allLinks = navbar.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        if (citasLink) {
            citasLink.classList.add('active');
        }
    }
}

/**
 * Configura los event listeners globales
 */
function setupEventListeners() {
    // Usar delegación de eventos para manejar navbars que se crean dinámicamente
    document.body.addEventListener('navigate', (e) => {
<<<<<<< HEAD
        console.log('Navegar a:', e.detail.section);
=======
        const section = e.detail?.section;
>>>>>>> 6b457dca72e62d59ab7cdf7c3c2db8c5816f866a
        const appRoot = document.getElementById('app-root') || document.body;
        
        console.log('Navegar a:', section);
        
        switch (section) {
            case 'citas':
                showAgenda(appRoot);
                break;
            case 'pacientes':
            case 'registros':
            case 'inventario':
                // Por ahora mostrar dashboard, luego se pueden crear vistas específicas
                showDashboard(appRoot);
                break;
            default:
                showDashboard(appRoot);
        }
    });

    document.body.addEventListener('logout', async () => {
        // Cerrar sesión
        authService.logout();
        
        // Mostrar login
        const appRoot = document.getElementById('app-root') || document.body;
        showLogin(appRoot);
    });
}
