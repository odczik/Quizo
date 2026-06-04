import { Kysely, SqliteDialect, MysqlDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import type { Database as DatabaseType } from './types/db_types';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, envFile) });

const DB_CLIENT = process.env.DB_CLIENT;

let dialect: any;

if (DB_CLIENT === 'sqlite') {
    dialect = new SqliteDialect({
        database: new Database(
            path.resolve(__dirname, '../web-server/database/database.sqlite')
        ),
    });
} else if (DB_CLIENT === 'mysql') {
    const { createPool } = require('mysql2');
    dialect = new MysqlDialect({
        pool: createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        })
    });
}

const db = new Kysely<DatabaseType>({
    dialect,
});

export default db;