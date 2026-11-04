import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ищем .env на уровень выше папки server (в корне проекта)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** @type {import('knex').Knex.Config} */
const config = {
  mysql: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_DB_HOST,
      user: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASS,
      database: process.env.MYSQL_DB_NAME,
    },
    migrations: {
      directory: './migrations/mysql',
      // загружаем именно .js — этого достаточно при "type": "module"
      loadExtensions: ['.js'],
      // кастомный шаблон для генерации ESM-миграций
      stub: './migrations/mysql/migration.stub',
    },
  },
  postgres: {
    client: 'pg',
    connection: {
      host: process.env.PG_DB_HOST,
      user: process.env.PG_DB_USER,
      password: process.env.PG_DB_PASS,
      database: process.env.PG_DB_NAME,
    },
    migrations: {
      directory: './migrations/postgres',
      loadExtensions: ['.js'],
      stub: './migrations/postgres/migration.stub',
    },
  },
};

export default config;