const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleWare = require('../middleware/auth');

router.get('/getAlluser',authMiddleWare, userController.getAllUsersExceptMe);
router.get('/send-message',authMiddleWare, userController.sendMessage);

module.exports = router;