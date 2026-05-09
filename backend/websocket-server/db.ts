import { Kysely, SqliteDialect, MysqlDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import type { Database as DatabaseType } from './types';

// --- 1. CONFIGURATION ---
// Set this to 'sqlite' for now. Change to 'mysql' later.
const DB_CLIENT = 'sqlite';

let dialect: any;

if (DB_CLIENT === 'sqlite') {
    // SQLite Dialect Setup
    dialect = new SqliteDialect({
        database: new Database(
            path.resolve(__dirname, '../web-server/database/database.sqlite')
        ),
    });
} else if (DB_CLIENT === 'mysql') {
    // MySQL Dialect Setup (Remember to run `npm install mysql2` first)
    // const { createPool } = require('mysql2');
    // dialect = new MysqlDialect({
    //     pool: createPool({
    //         host: '127.0.0.1',
    //         port: 3306,
    //         user: 'root',
    //         password: 'your_password',
    //         database: 'quizo_db',
    //     })
    // });
}

// --- 2. INITIALIZE KYSELY ---
const db = new Kysely<DatabaseType>({
    dialect,
});

export default db;