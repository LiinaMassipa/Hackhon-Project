/*Exporting a mysql2/promise connection pool enables Developer 2 
to perform asynchronous database queries using await pool.query(...) directly inside backend API routes.
*/

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

module.exports = pool;