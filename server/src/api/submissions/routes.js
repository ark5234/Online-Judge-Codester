const express = require('express');
const router = express.Router();
const { submitSolution, getSubmissions } = require('./controller');
const { isAuth } = require('../../middleware/auth');

router.post('/submit', isAuth, submitSolution);
router.get('/user/:userId', isAuth, getSubmissions);

module.exports = router; 