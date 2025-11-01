const databaseConnection = require('../config/database');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const DentalRecord = require('../models/DentalRecord');

/**
 * Script de pruebas simplificado para la Capa de Acceso a Datos
 */
async function runTests() {
    try {
        console.log('Iniciando pruebas...\n');
        
        // Conectar a la base de datos
        await databaseConnection.connect();
        
        // Instanciar modelos
        const patient = new Patient();
        const appointment = new Appointment();
        const inventory = new Inventory();
        const user = new User();
        const dentalRecord = new DentalRecord();
        
        // Pruebas de Usuario
        console.log('PRUEBAS DE USUARIO');
        const timestamp = Date.now();
        const userData = {
            email: `dentista${timestamp}@test.com`,
            password: 'contra123',
            name: 'Dr. Jesus Suarez',
            role: 'Dentista'
        };
        
        try {
            const createdUser = await user.create(userData);
            console.log('Usuario creado con ID:', createdUser.id);
        } catch (error) {
            console.log('Usuario ya existe o error:', error.message);
        }
        
        const foundUser = await user.findByEmail(userData.email);
        console.log('Usuario encontrado:', foundUser ? 'Sí' : 'No');
        
        // Prueba de búsqueda por nombre
        const searchUsers = await user.searchByName('Jesus Suarez');
        console.log('Usuarios encontrados por nombre:', searchUsers.length);
        
        // Prueba de permisos
        const hasPermission = await user.hasPermission(foundUser.id, 'patients', 'read');
        console.log('Usuario tiene permiso de lectura:', hasPermission);
        
        // Pruebas de Paciente
        console.log('\n PRUEBAS DE PACIENTE ');
        const patientData = {
            first_name: 'Valeria',
            last_name: 'García',
            email: `valeria${timestamp}@test.com`,
            phone: '62214879875',
            birth_date: '1995-05-15',
            address: 'Las plazas 123',
            insurance: 'Seguro Social'
        };
        
        try {
            const createdPatient = await patient.create(patientData);
            console.log('Paciente creado con ID:', createdPatient.id);
        } catch (error) {
            console.log('Paciente ya existe o error:', error.message);
        }
        
        const foundPatient = await patient.findByEmail(patientData.email);
        console.log('Paciente encontrado:', foundPatient ? 'Sí' : 'No');
        
        // Prueba de búsqueda por nombre
        const searchResults = await patient.searchByName('Valeria');
        console.log('Pacientes encontrados por nombre:', searchResults.length);
        
        // Prueba de agregar ajuste de ortodoncia
        if (foundPatient) {
            await patient.addOrthodonticAdjustment(foundPatient.id, {
                type: 'wire_change',
                notes: 'Cambio de ligas',
                doctor: 'Dr. Jesus Suarez'
            });
            console.log('Ajuste de ortodoncia agregado');
        }
        
        // Pruebas de Cita
        console.log('\n PRUEBAS DE CITA ');
        const appointmentData = {
            appointment_date: new Date(),
            appointment_time: '10:00',
            type: 'consultation',
            patient_info: {
                id: foundPatient.id,
                name: 'Valeria Garcia',
                phone: '62214879875'
            },
            doctor_info: {
                id: foundUser.id,
                name: 'Dr. Jesus Suarez'
            }
        };
        const createdAppointment = await appointment.create(appointmentData);
        console.log('Cita creada con ID:', createdAppointment.id);
        
        const todayAppointments = await appointment.findByDate(new Date());
        console.log('Citas de hoy:', todayAppointments.length);
        
        // Pruebas de Inventario
        console.log('\n PRUEBAS DE INVENTARIO ');
        const itemData = {
            name: 'Brackets Metálicos',
            category: 'brackets',
            current_stock: 100,
            min_stock: 20,
            cost_per_unit: 5.50,
            supplier: 'Proveedor Dental'
        };
        const createdItem = await inventory.create(itemData);
        console.log('Item creado con ID:', createdItem.id);
        
        // Prueba de búsqueda por nombre
        const searchItems = await inventory.searchByName('Brackets');
        console.log('Items encontrados por nombre:', searchItems.length);
        
        await inventory.adjustStock(createdItem.id, 50, 'Entrada de stock');
        console.log('Stock ajustado');
        
        // Pruebas de Registro Dental
        console.log('\n PRUEBAS DE REGISTRO DENTAL ');
        const recordData = {
            patient_id: foundPatient.id,
            description: 'Primera consulta',
            treatment_notes: 'Paciente presenta maloclusión',
            diagnosis: 'Maloclusión clase II',
            treatment_cost: 5000,
            created_by_info: {
                id: foundUser.id,
                name: 'Dr. Jesus Suarez'
            }
        };
        const createdRecord = await dentalRecord.create(recordData);
        console.log('Registro creado con ID:', createdRecord.id);
        
        const patientRecords = await dentalRecord.findByPatient(foundPatient.id);
        console.log('Registros del paciente:', patientRecords.length);
        
        console.log('\nTodas las pruebas completadas exitosamente');
        
    } catch (error) {
        console.error('Error en las pruebas:', error);
    } finally {
        await databaseConnection.disconnect();
    }
}

// Función para limpiar datos de prueba
async function cleanTestData() {
    try {
        console.log('Limpiando datos de prueba...\n');
        
        await databaseConnection.connect();
        const db = databaseConnection.getDatabase();
        
        // Eliminar documentos que contengan '@test.com' en el email
        const resultUsers = await db.collection('users').deleteMany({
            email: { $regex: '@test.com$' }
        });
        console.log('Usuarios de prueba eliminados:', resultUsers.deletedCount);
        
        const resultPatients = await db.collection('patients').deleteMany({
            email: { $regex: '@test.com$' }
        });
        console.log('Pacientes de prueba eliminados:', resultPatients.deletedCount);
        
        // Eliminar citas de prueba (las que tienen nombres de prueba)
        const resultAppointments = await db.collection('appointments').deleteMany({
            'patient_info.name': { $regex: 'Valeria Garcia' }
        });
        console.log('Citas de prueba eliminadas:', resultAppointments.deletedCount);
        
        // Eliminar items de inventario de prueba
        const resultInventory = await db.collection('inventory').deleteMany({
            name: 'Brackets Metálicos'
        });
        console.log('Items de inventario de prueba eliminados:', resultInventory.deletedCount);
        
        // Eliminar registros dentales de prueba
        const resultRecords = await db.collection('dentalrecords').deleteMany({
            description: 'Primera consulta'
        });
        console.log('Registros dentales de prueba eliminados:', resultRecords.deletedCount);
        
        console.log('\nDatos de prueba limpiados exitosamente');
        
    } catch (error) {
        console.error('Error limpiando datos:', error);
    } finally {
        await databaseConnection.disconnect();
    }
}

// Ejecutar las pruebas o limpiar datos según el argumento
if (require.main === module) {
    const action = process.argv[2];
    
    if (action === 'clean') {
        cleanTestData().catch(console.error);
    } else {
        runTests().catch(console.error);
    }
}

module.exports = { runTests, cleanTestData };