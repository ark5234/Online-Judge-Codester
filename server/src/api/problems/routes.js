const express = require('express');
const router = express.Router();
const { getProblems, getProblem, createProblem, updateProblem, deleteProblem } = require('./controller');
const { isAdmin, isAuth } = require('../../middleware/auth');

router.get('/', getProblems);
router.get('/:id', getProblem);
router.post('/', isAuth, isAdmin, createProblem);
router.put('/:id', isAuth, isAdmin, updateProblem);
router.delete('/:id', isAuth, isAdmin, deleteProblem);

module.exports = router; 