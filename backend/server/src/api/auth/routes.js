const express = require('express');
const { register, login, googleAuth, getMe } = require('./controller');
const { authenticateJWT } = require('../../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth); // Implement with passport.js
router.get('/me', authenticateJWT, getMe);

module.exports = router; 