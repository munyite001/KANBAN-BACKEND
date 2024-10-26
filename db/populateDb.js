#!/usr/bin/env node

require('dotenv').config();

const { Client } = require('pg');

const SQLCREATE = `
    --  TABLE FOR USERS 
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


    --  TABLE FOR BOARDS, RELATED TO USER
    CREATE TABLE IF NOT EXISTS boards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    --  TABLE FOR COLUMNS, RELATED TO BOARD
    CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        board_id INT NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    --  TABLE FOR TASKS, RELATED TO COLUMN
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        status VARCHAR(255) NOT NULL,
        column_id INT NOT NULL,
        FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
    );

    --  TABLE FOR SUBTASKS, RELATED TO TASK
    CREATE TABLE IF NOT EXISTS subtasks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        completed BOOLEAN NOT NULL,
        task_id INT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
`;

async function main() {
    console.log("Populating Database . . .")
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        await client.query(SQLCREATE);
        await client.end();
        
        console.log("Database Populated Successfully")
    } catch(err) {
        console.error(err)
    }
}

main();