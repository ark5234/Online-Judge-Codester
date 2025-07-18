const express = require('express');
const router = express.Router();
const { register, login, googleOAuth } = require('./controller');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleOAuth); // Placeholder for Google OAuth

module.exports = router; 