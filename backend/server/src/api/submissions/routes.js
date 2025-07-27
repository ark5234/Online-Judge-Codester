const express = require('express');
const { submit, getUserSubmissions, getProblemSubmissions } = require('./controller');
const router = express.Router();

router.post('/', submit); // Changed from /submit to match frontend
router.get('/user/:id', getUserSubmissions);
router.get('/problem/:id', getProblemSubmissions);

module.exports = router; 