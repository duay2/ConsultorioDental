const { MongoClient } = require('mongodb');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    /**
     * Conecta a la base de datos MongoDB
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
            const dbName = process.env.DATABASE_NAME || 'consultorio_dental';
            
            this.client = new MongoClient(uri);
            await this.client.connect();
            this.db = this.client.db(dbName);
            this.isConnected = true;
            
            console.log(`Conectado a MongoDB: ${dbName}`);
            
            // Crear índices para optimizar consultas
            await this.createIndexes();
            
        } catch (error) {
            console.error('Error conectando a MongoDB:', error);
            throw error;
        }
    }

    /**
     * Desconecta de la base de datos
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            if (this.client) {
                await this.client.close();
                this.isConnected = false;
                console.log('Desconectado de MongoDB');
            }
        } catch (error) {
            console.error('Error desconectando de MongoDB:', error);
            throw error;
        }
    }

    /**
     * Obtiene la instancia de la base de datos
     * @returns {Db}
     */
    getDatabase() {
        if (!this.isConnected) {
            throw new Error('No hay conexión activa a la base de datos');
        }
        return this.db;
    }

    /**
     * Obtiene una colección específica
     * @param {string} collectionName 
     * @returns {Collection}
     */
    getCollection(collectionName) {
        return this.getDatabase().collection(collectionName);
    }

    /**
     * Crea índices para optimizar las consultas más frecuentes
     * @returns {Promise<void>}
     */
    async createIndexes() {
        try {
            const db = this.getDatabase();
            
            // Índices para patients
            await db.collection('patients').createIndex({ email: 1 }, { unique: true });
            await db.collection('patients').createIndex({ phone: 1 });
            await db.collection('patients').createIndex({ 'orthodontics.status': 1 });
            
            // Índices para appointments
            await db.collection('appointments').createIndex({ appointment_date: 1, appointment_time: 1 });
            await db.collection('appointments').createIndex({ 'patient_info._id': 1 });
            await db.collection('appointments').createIndex({ 'doctor_info._id': 1 });
            await db.collection('appointments').createIndex({ status: 1 });
            
            // Índices para inventory
            await db.collection('inventory').createIndex({ name: 1 });
            await db.collection('inventory').createIndex({ category: 1 });
            await db.collection('inventory').createIndex({ current_stock: 1 });
            
            // Índices para users
            await db.collection('users').createIndex({ email: 1 }, { unique: true });
            await db.collection('users').createIndex({ role: 1 });
            
            // Índices para dentalrecords
            await db.collection('dentalrecords').createIndex({ patient_id: 1 });
            await db.collection('dentalrecords').createIndex({ created_at: -1 });
            
            console.log('Índices creados exitosamente');
        } catch (error) {
            console.error('Error creando índices:', error);
            throw error;
        }
    }

    /**
     * Verifica el estado de la conexión
     * @returns {boolean}
     */
    isConnectionActive() {
        return this.isConnected;
    }
}

// Instancia singleton para uso global
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection;
