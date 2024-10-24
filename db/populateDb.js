#!/usr/bin/env node

require('dotenv').config();


const { Pool } = require('pg');


const db_user = process.env.DB_USERNAME;
const db_port = process.env.DB_PORT;
const db_host = process.env.DB_HOST;
const db_database = process.env.DB_NAME;
const db_password = process.env.DB_PASSWORD;

module.exports = new Pool({
    connectionString: `postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_database}`
})

