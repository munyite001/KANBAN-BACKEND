const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const boardController = require('../controllers/board.controller')

//  User Registration
router.post('/users/register', userController.user_registration);

//  User Login
router.post('/users/login', userController.user_login);

//  Get User Details by deciphering the token
router.get("/user", userController.get_user);

//  Create a new board
router.post('/boards/create', boardController.createBoard);

//  Get all boards for a user
router.get('/boards/:userId', boardController.getBoardsLegacy);

module.exports = router;