const express = require('express');
const { createRule, evaluateRule } = require('../controllers/ruleController');

const router = express.Router();

// Route to create a rule
router.post('/rules', createRule);

// Route to evaluate a rule against user data
router.post('/rules/evaluate', evaluateRule);

module.exports = router;
