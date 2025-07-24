const express = require('express');
const router = express.Router();
const { googleLogin } = require('./controller');

router.post('/google-login', googleLogin);

module.exports = router; 