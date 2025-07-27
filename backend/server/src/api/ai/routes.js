const express = require('express');
const { review } = require('./controller');
const router = express.Router();

router.post('/review', review);

module.exports = router; 