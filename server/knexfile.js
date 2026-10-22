import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

/** @type {import('knex').Knex.Config} */
const config = {
  development: {
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
};

export default config;