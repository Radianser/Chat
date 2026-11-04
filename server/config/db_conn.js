import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import pg from 'pg';

const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASS,
    database: process.env.MYSQL_DB_NAME,
    port: process.env.MYSQL_DB_PORT,
});

const pgPool = new pg.Pool({
    host: process.env.PG_DB_HOST,
    user: process.env.PG_DB_USER,
    password: process.env.PG_DB_PASS,
    database: process.env.PG_DB_NAME,
    port: process.env.PG_DB_PORT,
});

const mongoClient = new MongoClient(process.env.MONGO_DB_HOST);

export const initDatabases = async () => {
    console.log('⏳ Инициализация баз данных...');
    
    try {
        // 1. Проверяем MySQL
        await mysqlPool.query('SELECT 1');
        console.log('✅ MySQL подключен');

        // 2. Проверяем PostgreSQL
        await pgPool.query('SELECT 1');
        console.log('✅ PostgreSQL подключен');

        // 3. Подключаем MongoDB
        await mongoClient.connect();
        console.log('✅ MongoDB подключена');
        
        console.log('🚀 Все базы данных готовы к работе!');
    } catch (error) {
        console.error('❌ Ошибка инициализации баз данных:', error.message);
        process.exit(1); // Останавливаем сервер, если нет связи с БД
    }
};

export const db = {
    mysql: mysqlPool,
    pg: pgPool,
    get mongo() {
        return mongoClient.db(process.env.MONGO_DB_NAME);
    },
    async closeAll() {
        await mysqlPool.end();
        await pgPool.end(); 
        await mongoClient.close();
    }
};