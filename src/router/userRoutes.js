// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Routes for user-related functionality
router.post('/insUser', userController.insUser);
router.get('/getUser', userController.getUser);
router.get('/getUserById/:userId', userController.getUserById);
router.get('/countUser', userController.countUser);
router.patch('/updateUserById/:userId', userController.updateUserById);

module.exports = router;
