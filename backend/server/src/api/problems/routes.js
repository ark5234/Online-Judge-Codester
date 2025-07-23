const express = require('express');
const { listProblems, getProblem, createProblem, updateProblem, deleteProblem } = require('./controller');
const { authenticateJWT, authorizeRoles } = require('../../middleware/auth');
const router = express.Router();

router.get('/', listProblems);
router.get('/:id', getProblem);
router.post('/', authenticateJWT, authorizeRoles('admin'), createProblem);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), updateProblem);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteProblem);

module.exports = router; 