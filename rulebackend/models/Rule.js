const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  type: { type: String, required: true },      // 'operator' or 'operand'
  value: { type: String },                     // The actual condition or operator (AND/OR)
  left: { type: mongoose.Schema.Types.Mixed }, // Left subtree or operand
  right: { type: mongoose.Schema.Types.Mixed } // Right subtree or operand
});

const RuleSchema = new mongoose.Schema({
  ruleString: { type: String, required: true }, // The rule in plain text
  ast: { type: NodeSchema, required: true }     // The rule's AST representation
});

module.exports = mongoose.model('Rule', RuleSchema);
