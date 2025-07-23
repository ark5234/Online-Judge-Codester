const express = require('express');
const { submit, getUserSubmissions, getProblemSubmissions } = require('./controller');
const { authenticateJWT } = require('../../middleware/auth');
const router = express.Router();

router.post('/submit', authenticateJWT, submit);
router.get('/user/:id', authenticateJWT, getUserSubmissions);
router.get('/problem/:id', authenticateJWT, getProblemSubmissions);

module.exports = router; 