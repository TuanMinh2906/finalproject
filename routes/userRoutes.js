const express = require('express');
const router = express.Router();
const userAction = require('../action/user/userAction');
const login = require('../action/user/login');

// User routes
router.get('/', userAction.getAllUsers); // Get all users
router.post('/', userAction.createUser); // Create a new user
router.get('/:id', userAction.getUserbyID); // Get user by ID
router.put('/:id', userAction.userUpdate); // Update user profile
router.delete('/:id', userAction.deleteUser); // Delete user

// User login route
router.post('/login', login); // User login

module.exports = router;