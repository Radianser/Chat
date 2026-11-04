import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ищем .env на уровень выше папки server (в корне проекта)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  mongodb: {
    url: process.env.MONGO_DB_HOST,
    databaseName: process.env.MONGO_DB_NAME,
    options: {
      auth: {
        username: process.env.MONGO_DB_USER,
        password: process.env.MONGO_DB_PASS,
      },
    },
  },
  migrationsDir: './migrations/mongo',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  moduleSystem: 'esm',
};

export default config;