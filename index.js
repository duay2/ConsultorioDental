const readline = require('readline');
const databaseConnection = require('./config/database');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Inventory = require('./models/Inventory');
const User = require('./models/User');
const DentalRecord = require('./models/DentalRecord');

/**
 * Sistema de gestión dental con CRUD integrado
 */
class DentalCRUD {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.patientModel = new Patient();
        this.appointmentModel = new Appointment();
        this.inventoryModel = new Inventory();
        this.userModel = new User();
        this.dentalRecordModel = new DentalRecord();
    }

    async init() {
        try {
            console.log('Sistema de Gestion Dental');
            await databaseConnection.connect();
            console.log('Conectado a la base de datos');
            await this.login();
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }

    // Sistema de login simple
    async login() {
        console.log('\n LOGIN ');
        const email = await this.ask('Email: ');
        const password = await this.ask('Password: ');
        
        try {
            const user = await this.userModel.verifyCredentials(email, password);
            if (user) {
                console.log(`\nBienvenido ${user.name} (${user.role})`);
                this.currentUser = user;
                await this.showMenu();
            } else {
                console.log('Credenciales incorrectas');
                await this.login();
            }
        } catch (error) {
            console.log('Error en login:', error.message);
            await this.login();
        }
    }

    async showMenu() {
        console.log('\n MENU PRINCIPAL ');
        console.log('1. Pacientes');
        console.log('2. Citas');
        console.log('3. Inventario');
        console.log('4. Usuarios');
        console.log('5. Registros Dentales');
        console.log('6. Salir');
        
        const choice = await this.ask('Selecciona opcion (1-6): ');
        
        switch (choice) {
            case '1': await this.patientMenu(); break;
            case '2': await this.appointmentMenu(); break;
            case '3': await this.inventoryMenu(); break;
            case '4': await this.userMenu(); break;
            case '5': await this.dentalRecordMenu(); break;
            case '6': this.exit(); break;
            default: console.log('Opcion invalida'); await this.showMenu();
        }
    }

    // Menú de gestión de pacientes
    async patientMenu() {
        console.log('\n PACIENTES ');
        console.log('1. Crear');
        console.log('2. Buscar por ID');
        console.log('3. Buscar por email');
        console.log('4. Listar todos');
        console.log('5. Actualizar');
        console.log('6. Eliminar');
        console.log('7. Volver');
        
        const choice = await this.ask('Opcion (1-7): ');
        
        switch (choice) {
            case '1': await this.createPatient(); break;
            case '2': await this.findPatientById(); break;
            case '3': await this.findPatientByEmail(); break;
            case '4': await this.listPatients(); break;
            case '5': await this.updatePatient(); break;
            case '6': await this.deletePatient(); break;
            case '7': await this.showMenu(); break;
            default: console.log('Opcion invalida'); await this.patientMenu();
        }
    }

    // Menú de gestión de citas
    async appointmentMenu() {
        console.log('\n CITAS ');
        console.log('1. Crear');
        console.log('2. Buscar por ID');
        console.log('3. Buscar por fecha');
        console.log('4. Listar todas');
        console.log('5. Actualizar');
        console.log('6. Eliminar');
        console.log('7. Volver');
        
        const choice = await this.ask('Opcion (1-7): ');
        
        switch (choice) {
            case '1': await this.createAppointment(); break;
            case '2': await this.findAppointmentById(); break;
            case '3': await this.findAppointmentsByDate(); break;
            case '4': await this.listAppointments(); break;
            case '5': await this.updateAppointment(); break;
            case '6': await this.deleteAppointment(); break;
            case '7': await this.showMenu(); break;
            default: console.log('Opcion invalida'); await this.appointmentMenu();
        }
    }

    // Menú de gestión de inventario
    async inventoryMenu() {
        console.log('\n INVENTARIO ');
        console.log('1. Crear');
        console.log('2. Buscar por ID');
        console.log('3. Buscar por categoria');
        console.log('4. Listar todos');
        console.log('5. Actualizar');
        console.log('6. Ajustar stock');
        console.log('7. Eliminar');
        console.log('8. Volver');
        
        const choice = await this.ask('Opcion (1-8): ');
        
        switch (choice) {
            case '1': await this.createInventoryItem(); break;
            case '2': await this.findInventoryItemById(); break;
            case '3': await this.findInventoryByCategory(); break;
            case '4': await this.listInventoryItems(); break;
            case '5': await this.updateInventoryItem(); break;
            case '6': await this.adjustInventoryStock(); break;
            case '7': await this.deleteInventoryItem(); break;
            case '8': await this.showMenu(); break;
            default: console.log('Opcion invalida'); await this.inventoryMenu();
        }
    }

    
    // Crea un nuevo paciente con datos ingresados por el usuario
    async createPatient() {
        try {
            const patientData = {
                first_name: await this.ask('Nombre: '),
                last_name: await this.ask('Apellido: '),
                email: await this.ask('Email: '),
                phone: await this.ask('Telefono: '),
                birth_date: await this.ask('Fecha nacimiento (YYYY-MM-DD): '),
                address: await this.ask('Direccion: '),
                insurance: await this.ask('Seguro: ')
            };
            
            const patient = await this.patientModel.create(patientData);
            console.log('Paciente creado con ID:', patient.id);
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.patientMenu();
    }

    // Busca un paciente por su ID numérico
    async findPatientById() {
        try {
            const id = await this.ask('ID del paciente: ');
            const patient = await this.patientModel.findById(id);
            console.log(patient ? JSON.stringify(patient, null, 2) : 'No encontrado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.patientMenu();
    }

    // Busca un paciente por su email
    async findPatientByEmail() {
        try {
            const email = await this.ask('Email: ');
            const patient = await this.patientModel.findByEmail(email);
            console.log(patient ? JSON.stringify(patient, null, 2) : 'No encontrado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.patientMenu();
    }

    // Lista todos los pacientes con paginación
    async listPatients() {
        try {
            const page = parseInt(await this.ask('Pagina (1): ') || '1');
            const result = await this.patientModel.findAll(page, 10);
            console.log(`Total: ${result.total}`);
            result.patients.forEach(p => console.log(`ID: ${p.id} - ${p.first_name} ${p.last_name} - ${p.email}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.patientMenu();
    }

    // Actualiza los datos de un paciente existente
    async updatePatient() {
        try {
            const id = await this.ask('ID del paciente: ');
            const updateData = {};
            
            const first_name = await this.ask('Nombre (enter para mantener): ');
            if (first_name) updateData.first_name = first_name;
            
            const last_name = await this.ask('Apellido (enter para mantener): ');
            if (last_name) updateData.last_name = last_name;
            
            const phone = await this.ask('Telefono (enter para mantener): ');
            if (phone) updateData.phone = phone;
            
            const result = await this.patientModel.update(id, updateData);
            console.log(result.modifiedCount > 0 ? 'Actualizado' : 'No actualizado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.patientMenu();
    }

    // Elimina permanentemente un paciente
    async deletePatient() {
        try {
            const id = await this.ask('ID del paciente: ');
            const confirm = await this.ask('Confirmar (s/n): ');
            
            if (confirm.toLowerCase() === 's') {
                const result = await this.patientModel.delete(id);
                console.log(result.deletedCount > 0 ? 'Eliminado' : 'No eliminado');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.patientMenu();
    }

    // Metodos para Citas
    // Crea una nueva cita
    async createAppointment() {
        try {
            const appointmentData = {
                appointment_date: await this.ask('Fecha (YYYY-MM-DD): '),
                appointment_time: await this.ask('Hora (HH:MM): '),
                type: await this.ask('Tipo: '),
                status: await this.ask('Estado (scheduled/completed/cancelled): ') || 'scheduled',
                notes: await this.ask('Notas: '),
                patient_info: {
                    id: parseInt(await this.ask('ID del paciente: ')),
                    name: await this.ask('Nombre del paciente: ')
                },
                doctor_info: {
                    _id: await this.ask('ID del doctor: '),
                    name: await this.ask('Nombre del doctor: ')
                }
            };
            
            const appointment = await this.appointmentModel.create(appointmentData);
            console.log('Cita creada con ID:', appointment.id);
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.appointmentMenu();
    }

    async findAppointmentById() {
        try {
            const id = await this.ask('ID de la cita: ');
            const appointment = await this.appointmentModel.findById(id);
            console.log(appointment ? JSON.stringify(appointment, null, 2) : 'No encontrada');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.appointmentMenu();
    }

    async findAppointmentsByDate() {
        try {
            const date = await this.ask('Fecha (YYYY-MM-DD): ');
            const appointments = await this.appointmentModel.findByDate(date);
            appointments.forEach(a => console.log(`ID: ${a.id} - ${a.appointment_time} - ${a.type} - ${a.status}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.appointmentMenu();
    }

    async listAppointments() {
        try {
            const page = parseInt(await this.ask('Pagina (1): ') || '1');
            const result = await this.appointmentModel.findAll(page, 10);
            console.log(`Total: ${result.total}`);
            result.appointments.forEach(a => console.log(`ID: ${a.id} - ${a.appointment_date.toISOString().split('T')[0]} ${a.appointment_time} - ${a.type}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.appointmentMenu();
    }

    async updateAppointment() {
        try {
            const id = await this.ask('ID de la cita: ');
            const updateData = {};
            
            const status = await this.ask('Estado (enter para mantener): ');
            if (status) updateData.status = status;
            
            const notes = await this.ask('Notas (enter para mantener): ');
            if (notes) updateData.notes = notes;
            
            const result = await this.appointmentModel.update(id, updateData);
            console.log(result.modifiedCount > 0 ? 'Actualizada' : 'No actualizada');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.appointmentMenu();
    }

    async deleteAppointment() {
        try {
            const id = await this.ask('ID de la cita: ');
            const confirm = await this.ask('Confirmar (s/n): ');
            
            if (confirm.toLowerCase() === 's') {
                const result = await this.appointmentModel.delete(id);
                console.log(result.deletedCount > 0 ? 'Eliminada' : 'No eliminada');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.appointmentMenu();
    }

   
    // Crea un nuevo item de inventario
    async createInventoryItem() {
        try {
            const itemData = {
                name: await this.ask('Nombre: '),
                category: await this.ask('Categoria: '),
                description: await this.ask('Descripcion: '),
                current_stock: parseInt(await this.ask('Stock actual: ') || '0'),
                min_stock: parseInt(await this.ask('Stock minimo: ') || '0'),
                cost_per_unit: parseFloat(await this.ask('Costo por unidad: ') || '0'),
                supplier: await this.ask('Proveedor: ')
            };
            
            const item = await this.inventoryModel.create(itemData);
            console.log('Item creado con ID:', item.id);
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.inventoryMenu();
    }

    async findInventoryItemById() {
        try {
            const id = await this.ask('ID del item: ');
            const item = await this.inventoryModel.findById(id);
            console.log(item ? JSON.stringify(item, null, 2) : 'No encontrado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.inventoryMenu();
    }

    async findInventoryByCategory() {
        try {
            const category = await this.ask('Categoria: ');
            const items = await this.inventoryModel.findByCategory(category);
            items.forEach(i => console.log(`ID: ${i.id} - ${i.name} - Stock: ${i.current_stock}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.inventoryMenu();
    }

    async listInventoryItems() {
        try {
            const page = parseInt(await this.ask('Pagina (1): ') || '1');
            const result = await this.inventoryModel.findAll(page, 10);
            console.log(`Total: ${result.total}`);
            result.items.forEach(i => console.log(`ID: ${i.id} - ${i.name} - ${i.category} - Stock: ${i.current_stock}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.inventoryMenu();
    }

    async updateInventoryItem() {
        try {
            const id = await this.ask('ID del item: ');
            const updateData = {};
            
            const name = await this.ask('Nombre (enter para mantener): ');
            if (name) updateData.name = name;
            
            const current_stock = await this.ask('Stock actual (enter para mantener): ');
            if (current_stock) updateData.current_stock = parseInt(current_stock);
            
            const result = await this.inventoryModel.update(id, updateData);
            console.log(result.modifiedCount > 0 ? 'Actualizado' : 'No actualizado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.inventoryMenu();
    }

    // Ajusta el stock de un item
    async adjustInventoryStock() {
        try {
            const id = await this.ask('ID del item: ');
            const quantity = parseInt(await this.ask('Cantidad (+/-): '));
            const reason = await this.ask('Razon: ');
            
            const result = await this.inventoryModel.adjustStock(id, quantity, reason);
            console.log(result.modifiedCount > 0 ? 'Stock ajustado' : 'No ajustado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.inventoryMenu();
    }

    async deleteInventoryItem() {
        try {
            const id = await this.ask('ID del item: ');
            const confirm = await this.ask('Confirmar (s/n): ');
            
            if (confirm.toLowerCase() === 's') {
                const result = await this.inventoryModel.delete(id);
                console.log(result.deletedCount > 0 ? 'Eliminado' : 'No eliminado');
            }
    } catch (error) {
            console.error('Error:', error.message);
        }
        await this.inventoryMenu();
    }

    // Menú de gestión de usuarios
    async userMenu() {
        console.log('\n USUARIOS ');
        console.log('1. Crear');
        console.log('2. Buscar por ID');
        console.log('3. Buscar por email');
        console.log('4. Listar todos');
        console.log('5. Actualizar');
        console.log('6. Eliminar');
        console.log('7. Volver');
        
        const choice = await this.ask('Opcion (1-7): ');
        
        switch (choice) {
            case '1': await this.createUser(); break;
            case '2': await this.findUserById(); break;
            case '3': await this.findUserByEmail(); break;
            case '4': await this.listUsers(); break;
            case '5': await this.updateUser(); break;
            case '6': await this.deleteUser(); break;
            case '7': await this.showMenu(); break;
            default: console.log('Opcion invalida'); await this.userMenu();
        }
    }

    // Crea un nuevo usuario
    async createUser() {
        try {
            const userData = {
                email: await this.ask('Email: '),
                password: await this.ask('Password: '),
                name: await this.ask('Nombre: '),
                last_name: await this.ask('Apellido: '),
                role: await this.ask('Rol (admin/doctor/assistant): '),
                specialty: await this.ask('Especialidad: '),
                phone: await this.ask('Telefono: ')
            };
            
            const user = await this.userModel.create(userData);
            console.log('Usuario creado con ID:', user.id);
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.userMenu();
    }

    async findUserById() {
        try {
            const id = await this.ask('ID del usuario: ');
            const user = await this.userModel.findById(id);
            console.log(user ? JSON.stringify(user, null, 2) : 'No encontrado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.userMenu();
    }

    async findUserByEmail() {
        try {
            const email = await this.ask('Email: ');
            const user = await this.userModel.findByEmail(email);
            console.log(user ? JSON.stringify(user, null, 2) : 'No encontrado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.userMenu();
    }

    async listUsers() {
        try {
            const page = parseInt(await this.ask('Pagina (1): ') || '1');
            const result = await this.userModel.findAll(page, 10);
            console.log(`Total: ${result.total}`);
            result.users.forEach(u => console.log(`ID: ${u.id} - ${u.name} ${u.last_name} - ${u.email} - ${u.role}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.userMenu();
    }

    async updateUser() {
        try {
            const id = await this.ask('ID del usuario: ');
            const updateData = {};
            
            const name = await this.ask('Nombre (enter para mantener): ');
            if (name) updateData.name = name;
            
            const last_name = await this.ask('Apellido (enter para mantener): ');
            if (last_name) updateData.last_name = last_name;
            
            const phone = await this.ask('Telefono (enter para mantener): ');
            if (phone) updateData.phone = phone;
            
            const result = await this.userModel.update(id, updateData);
            console.log(result.modifiedCount > 0 ? 'Actualizado' : 'No actualizado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.userMenu();
    }

    async deleteUser() {
        try {
            const id = await this.ask('ID del usuario: ');
            const confirm = await this.ask('Confirmar (s/n): ');
            
            if (confirm.toLowerCase() === 's') {
                const result = await this.userModel.delete(id);
                console.log(result.deletedCount > 0 ? 'Eliminado' : 'No eliminado');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.userMenu();
    }

    
    // Menú de gestión de registros dentales
    async dentalRecordMenu() {
        console.log('\n REGISTROS DENTALES ');
        console.log('1. Crear');
        console.log('2. Buscar por ID');
        console.log('3. Buscar por paciente');
        console.log('4. Listar todos');
        console.log('5. Actualizar');
        console.log('6. Actualizar estado de pago');
        console.log('7. Eliminar');
        console.log('8. Volver');
        
        const choice = await this.ask('Opcion (1-8): ');
        
        switch (choice) {
            case '1': await this.createDentalRecord(); break;
            case '2': await this.findDentalRecordById(); break;
            case '3': await this.findDentalRecordsByPatient(); break;
            case '4': await this.listDentalRecords(); break;
            case '5': await this.updateDentalRecord(); break;
            case '6': await this.updatePaymentStatus(); break;
            case '7': await this.deleteDentalRecord(); break;
            case '8': await this.showMenu(); break;
            default: console.log('Opcion invalida'); await this.dentalRecordMenu();
        }
    }

    // Crea un nuevo registro dental
    async createDentalRecord() {
        try {
            const recordData = {
                patient_id: await this.ask('ID del paciente: '),
                description: await this.ask('Descripcion: '),
                treatment_notes: await this.ask('Notas de tratamiento: '),
                diagnosis: await this.ask('Diagnostico: '),
                treatment_plan: await this.ask('Plan de tratamiento: '),
                treatment_cost: parseFloat(await this.ask('Costo del tratamiento: ') || '0'),
                payment_status: await this.ask('Estado de pago (pending/paid/partial): ') || 'pending',
                record_type: await this.ask('Tipo de registro (general/orthodontic/surgery): ') || 'general',
                created_by_info: {
                    id: await this.ask('ID del doctor: '),
                    name: await this.ask('Nombre del doctor: ')
                }
            };
            
            const record = await this.dentalRecordModel.create(recordData);
            console.log('Registro creado con ID:', record.id);
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.dentalRecordMenu();
    }

    async findDentalRecordById() {
        try {
            const id = await this.ask('ID del registro: ');
            const record = await this.dentalRecordModel.findById(id);
            console.log(record ? JSON.stringify(record, null, 2) : 'No encontrado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.dentalRecordMenu();
    }

    async findDentalRecordsByPatient() {
        try {
            const patientId = await this.ask('ID del paciente: ');
            const records = await this.dentalRecordModel.findByPatient(patientId);
            records.forEach(r => console.log(`ID: ${r.id} - ${r.description} - ${r.record_type} - ${r.payment_status}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.dentalRecordMenu();
    }

    async listDentalRecords() {
        try {
            const page = parseInt(await this.ask('Pagina (1): ') || '1');
            const result = await this.dentalRecordModel.findAll(page, 10);
            console.log(`Total: ${result.total}`);
            result.records.forEach(r => console.log(`ID: ${r.id} - Paciente: ${r.patient_id} - ${r.description} - ${r.payment_status}`));
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.dentalRecordMenu();
    }

    async updateDentalRecord() {
        try {
            const id = await this.ask('ID del registro: ');
            const updateData = {};
            
            const description = await this.ask('Descripcion (enter para mantener): ');
            if (description) updateData.description = description;
            
            const treatment_notes = await this.ask('Notas de tratamiento (enter para mantener): ');
            if (treatment_notes) updateData.treatment_notes = treatment_notes;
            
            const result = await this.dentalRecordModel.update(id, updateData);
            console.log(result.modifiedCount > 0 ? 'Actualizado' : 'No actualizado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.dentalRecordMenu();
    }

    // Actualiza el estado de pago de un registro
    async updatePaymentStatus() {
        try {
            const id = await this.ask('ID del registro: ');
            const status = await this.ask('Nuevo estado de pago (pending/paid/partial): ');
            
            const result = await this.dentalRecordModel.updatePaymentStatus(id, status);
            console.log(result.modifiedCount > 0 ? 'Estado actualizado' : 'No actualizado');
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.dentalRecordMenu();
    }

    async deleteDentalRecord() {
        try {
            const id = await this.ask('ID del registro: ');
            const confirm = await this.ask('Confirmar (s/n): ');
            
            if (confirm.toLowerCase() === 's') {
                const result = await this.dentalRecordModel.delete(id);
                console.log(result.deletedCount > 0 ? 'Eliminado' : 'No eliminado');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
        await this.dentalRecordMenu();
    }

    // Función auxiliar para hacer preguntas al usuario
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }

    // Cierra la aplicación y desconecta la base de datos
    async exit() {
        console.log('Saliendo...');
        await databaseConnection.disconnect();
        this.rl.close();
        process.exit(0);
    }
}

async function main() {
    const crud = new DentalCRUD();
    await crud.init();
}

// Manejar cierre 
process.on('SIGINT', async () => {
    console.log('\nCerrando sistema...');
    await databaseConnection.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nCerrando sistema...');
    await databaseConnection.disconnect();
    process.exit(0);
});

// Ejecutar solo si es el archivo principal
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
