const asyncHandler = require('express-async-handler');
const db = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.user_registration = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    //  Check if a user with that username already exists
    const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows[0]) {
        res.status(401).json({ message: 'Username already exists' });
    }

    //  Check if a user with that email already exists
    const userEmail = await db.query('SELECT * FROM users WHERE EMAIL = $1', [email]);

    if (userEmail.rows[0]) {
        res.status(402).json({ message: 'Email already exists' });
    }

    //  Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    //  Create the user
    const newUser = await db.query('INSERT INTO users (username, email, passwordhash) VALUES($1, $2, $3)', [username, email, hashedPassword]);

    res.status(201).json({ message: 'User created successfully' });
})