import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), 'config', '.env') });

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