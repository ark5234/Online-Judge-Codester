const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../../middleware/auth');

router.get('/', isAuth, isAdmin, (req, res) => {
  res.json({ message: 'Admin panel endpoint' });
});

module.exports = router; 