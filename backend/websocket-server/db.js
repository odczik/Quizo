const { Kysely, SqliteDialect, MysqlDialect } = require('kysely');
const Database = require('better-sqlite3');
const path = require('path');

// --- 1. CONFIGURATION ---
// Set this to 'sqlite' for now. Change to 'mysql' later.
const DB_CLIENT = 'sqlite';

let dialect;

if (DB_CLIENT === 'sqlite') {
    // SQLite Dialect Setup
    dialect = new SqliteDialect({
        database: new Database(
            path.resolve(__dirname, '../web-server/database/database.sqlite')
        ),
    });
} else if (DB_CLIENT === 'mysql') {
    // MySQL Dialect Setup (Remember to run `npm install mysql2` first)
    const { createPool } = require('mysql2');
    dialect = new MysqlDialect({
        pool: createPool({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'your_password',
            database: 'quizo_db',
        })
    });
}

// --- 2. INITIALIZE KYSELY ---
/** @type {import('kysely').Kysely<import('./types').Database>} */
const db = new Kysely({
    dialect,
});

module.exports = db;