/**
 * Módulo principal de la aplicación
 * Registra e inicializa todos los componentes Web
 */

// Importar todos los componentes
import './components/common/navbar.js';
import './components/auth/login-view.js';
import './components/dashboard/dashboard-view.js';
import './components/dashboard/kpi-card.js';
import './components/dashboard/activity-feed.js';
import './components/dashboard/chart-panel.js';
import './components/inventory/inventory-view.js';
import './components/inventory/inventory-table.js';
import './components/inventory/inventory-row.js';
import './components/common/table-pagination.js';
import './components/inventory/inventory-modal.js';
import './components/appointments/daily-agenda-view.js';
import './components/appointments/agenda-row.js';
import './components/appointments/time-slot.js';
import './components/appointments/appointment-card.js';
import './components/appointments/new-appointment-modal.js';
import './components/appointments/edit-appointment-modal.js';
import './components/patients/patient-view.js';
import './components/patients/patient-table.js';
import './components/patients/patient-row.js';
import './components/patients/patient-modal.js';
import './components/patients/view-appointments-modal.js';
import './components/dental-records/dental-records-view.js';
import './components/dental-records/dental-records-table.js';
import './components/dental-records/dental-records-row.js';
import './components/dental-records/dental-records-modal.js';
import './components/appointments/appointment-table.js'; // Nuevo import
import './components/appointments/appointment-row.js'; // Nuevo import
import './components/appointments/appointments-view.js'; // Nuevo import
import './components/common/confirmation-modal.js'; // Nuevo import para el modal de confirmación
import './components/users/user-view.js';
import './components/users/user-table.js';
import './components/users/user-row.js';
import './components/users/user-modal.js';
import authService from './services/auth-service.js';

// Variable para evitar múltiples inicializaciones
let isInitialized = false;
let navbarInstance = null;

// Observador para detectar navbars duplicados
const navbarObserver = new MutationObserver((mutations) => {
    const navbars = document.querySelectorAll('app-navbar');
    if (navbars.length > 1) {
        // Mantener solo el primero, eliminar los demás
        for (let i = 1; i < navbars.length; i++) {
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
        return;
    }
    isInitialized = true;

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
        return;
    }
    isShowingDashboard = true;

    // Asegurarse de que container sea el app-root
    const appRoot = document.getElementById('app-root') || container;

    // Remover TODOS los navbars existentes (en todo el documento)
    const existingNavbars = document.querySelectorAll('app-navbar');
    existingNavbars.forEach((nav, index) => {
        nav.remove();
    });
    navbarInstance = null; // Resetear la referencia
    
    // Limpiar contenido y mostrar dashboard PRIMERO
    appRoot.innerHTML = '<dashboard-view></dashboard-view>';
    
    // Esperar un momento para asegurar que el DOM se actualizó
    setTimeout(() => {
        // Verificar si ya hay un navbar después de limpiar
        const navbarsAfterClean = document.querySelectorAll('app-navbar');

        // Si aún hay navbars, eliminarlos
        if (navbarsAfterClean.length > 0) {
            navbarsAfterClean.forEach(nav => nav.remove());
        }

        // Crear un nuevo navbar SOLO si no existe uno
        if (!navbarInstance) {
            navbarInstance = document.createElement('app-navbar');
            // Insertar al inicio del body, antes del app-root
            document.body.insertBefore(navbarInstance, appRoot);
        }

        // Actualizar navbar para marcar "Dashboard" como activo
        const navbar = document.querySelector('app-navbar');
        if (navbar && navbar.shadowRoot) {
            const dashboardLink = navbar.shadowRoot.querySelector('[data-section="dashboard"]');
            const allLinks = navbar.shadowRoot.querySelectorAll('.nav-link');
            allLinks.forEach(link => link.classList.remove('active'));
            if (dashboardLink) {
                dashboardLink.classList.add('active');
            }
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
 * Muestra la vista de inventario
 */
function showInventory(container) {
    const appRoot = document.getElementById('app-root') || container;
    appRoot.innerHTML = '<inventory-view></inventory-view>';

    // Actualizar navbar para marcar "Inventario" como activo
    const navbar = document.querySelector('app-navbar');
    if (navbar && navbar.shadowRoot) {
        const inventarioLink = navbar.shadowRoot.querySelector('[data-section="inventario"]');
        const allLinks = navbar.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        if (inventarioLink) {
            inventarioLink.classList.add('active');
        }
    }
}

/**
 * Muestra la vista de pacientes
 */
function showPatients(container) {
    const appRoot = document.getElementById('app-root') || container;
    appRoot.innerHTML = '<patient-view></patient-view>';

    // Actualizar navbar para marcar "Pacientes" como activo
    const navbar = document.querySelector('app-navbar');
    if (navbar && navbar.shadowRoot) {
        const pacientesLink = navbar.shadowRoot.querySelector('[data-section="pacientes"]');
        const allLinks = navbar.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        if (pacientesLink) {
            pacientesLink.classList.add('active');
        }
    }
}

/**
 * Muestra la vista de registros dentales
 */
function showDentalRecords(container) {
    const appRoot = document.getElementById('app-root') || container;
    appRoot.innerHTML = '<dental-records-view></dental-records-view>';

    // Actualizar navbar para marcar "Registros" como activo
    const navbar = document.querySelector('app-navbar');
    if (navbar && navbar.shadowRoot) {
        const registrosLink = navbar.shadowRoot.querySelector('[data-section="registros"]');
        const allLinks = navbar.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        if (registrosLink) {
            registrosLink.classList.add('active');
        }
    }
}

/**
 * Configura los event listeners globales
 */
function setupEventListeners() {
    // Usar delegación de eventos para manejar navbars que se crean dinámicamente
    document.body.addEventListener('navigate', (e) => {
        const section = e.detail?.section;
        const appRoot = document.getElementById('app-root') || document.body;
        
        switch (section) {
            case 'dashboard':
                showDashboard(appRoot);
                break;
            case 'citas':
                showAgenda(appRoot);
                break;
            case 'citas-gestion': // Nueva ruta para la gestión de citas
                showAppointmentsManagement(appRoot);
                break;
            case 'inventario':
                showInventory(appRoot);
                break;
            case 'pacientes':
                showPatients(appRoot);
                break;
            case 'registros':
                showDentalRecords(appRoot);
                break;
            case 'usuarios':
                showUsers(appRoot);
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

/**
 * Muestra la vista de usuarios
 */
function showUsers(container) {
    const appRoot = document.getElementById('app-root') || container;
    appRoot.innerHTML = '<user-view></user-view>';

    // Actualizar navbar para marcar "Usuarios" como activo
    const navbar = document.querySelector('app-navbar');
    if (navbar && navbar.shadowRoot) {
        const usuariosLink = navbar.shadowRoot.querySelector('[data-section="usuarios"]');
        const allLinks = navbar.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        if (usuariosLink) {
            usuariosLink.classList.add('active');
        }
    }
}

function showAppointmentsManagement(container) {
    const appRoot = document.getElementById('app-root') || container;
    appRoot.innerHTML = '<appointments-view></appointments-view>';

    const navbar = document.querySelector('app-navbar');
    if (navbar && navbar.shadowRoot) {
        const citasGestionLink = navbar.shadowRoot.querySelector('[data-section="citas-gestion"]');
        const allLinks = navbar.shadowRoot.querySelectorAll('.nav-link');
        allLinks.forEach(link => link.classList.remove('active'));
        if (citasGestionLink) {
            citasGestionLink.classList.add('active');
        }
    }
}
