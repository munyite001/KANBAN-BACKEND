const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

//  User Registration
router.post('/users/register', userController.user_registration);





module.exports = router;