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

const mongoClient = new MongoClient(process.env.MONGO_DB_HOST, {
    auth: {
        username: process.env.MONGO_DB_USER,
        password: process.env.MONGO_DB_PASS
    }
});
await mongoClient.connect();

export const db = {
    mysql: mysqlPool,
    pg: pgPool,
    mongo: mongoClient.db(process.env.MONGO_DB_NAME),
    async closeAll() {
        await mysqlPool.end();
        await pgPool.end(); 
        await mongoClient.close();
    }
};