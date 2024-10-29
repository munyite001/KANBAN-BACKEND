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


//  User Login
exports.user_login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    //  Check if a user with that email exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!user.rows[0]) {
        res.status(401).json({message: "User with that Email Not Found"})
    }

    //  Check if the password is correct
    const match = bcrypt.compareSync(password, user.rows[0].passwordhash);

    if (!match) {
        res.status(402).json({message: "Invalid Password"})
    }

    //  Otherwise if all is good
    const token = jwt.sign({id: user.rows[0].id}, process.env.JWT_SECRET, {expiresIn: '1d'});

    res.json({
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        token
    });
});


//  Get User Details by deciphering the token
exports.get_user = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({message: "Not Authorized"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

        res.json(user.rows[0]);
    } catch(err) {
        res.status(401).json({message: "Invalid or Expired Token"});
    }
});