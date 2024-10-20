const Rule = require('../models/Rule');

// Create a simple Node structure for the AST
class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type; // 'operator' or 'operand'
        this.left = left;
        this.right = right;
        this.value = value; // Operand or operator
    }
}

// Helper function to parse rule strings (simplified)
// const parseRuleString = (ruleString) => {
//     // In real-world scenarios, you'd use a parser like PEG.js or similar.
//     // This is a simplified hardcoded AST creation as an example:
//     if (ruleString === 'age > 30 AND salary > 50000') {
//         return new Node('operator', 
//             new Node('operand', null, null, 'age > 30'), 
//             new Node('operand', null, null, 'salary > 50000'), 
//             'AND'
//         );
//     }
//     return null; // Error handling for unsupported rules
// };

const parseRuleString = (ruleString) => {
    const operators = ['AND', 'OR'];
    
    // Split by operators while keeping them in the result
    const regex = new RegExp(`\\s*(${operators.join('|')})\\s*`, 'g');
    const parts = ruleString.split(regex);

    // Create nodes for operands and operators
    const stack = [];
    
    parts.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart) {
            // Check if it's an operator
            if (operators.includes(trimmedPart)) {
                const right = stack.pop();
                const left = stack.pop();
                const operatorNode = new Node('operator', left, right, trimmedPart);
                stack.push(operatorNode);
            } else {
                // It's an operand
                const operandNode = new Node('operand', null, null, trimmedPart);
                stack.push(operandNode);
            }
        }
    });
 
    // Return the root of the AST, which should be the only node in the stack
    return stack.length === 1 ? stack[0] : null; // Handle errors as needed
};

// Example usage
// const ast = parseRuleString('age > 30 AND salary > 50000');
// console.log(JSON.stringify(ast, null, 2));

// Function to create a rule (POST /api/rules)
const createRule = async (req, res) => {
    const { rule } = req.body;

    if (!rule) {
        return res.status(400).json({ error: 'Rule string is required' });
    }

    const ast = parseRuleString(rule);
    if (!ast) {
        return res.status(400).json({ error: 'Invalid rule format' });
    }

    const newRule = new Rule({ ruleString: rule, ast });
    await newRule.save();

    res.json({ message: 'Rule created successfully', ast });
};

// Helper function to evaluate an AST against user data
const evaluateAST = (node, data) => {
    if (node.type === 'operand') {
        const [key, operator, value] = node.value.split(' ');
        switch (operator) {
            case '>': return data[key] > parseInt(value);
            case '<': return data[key] < parseInt(value);
            case '=': return data[key] == value;
            default: return false;
        }
    } else if (node.type === 'operator') {
        if (node.value === 'AND') {
            return evaluateAST(node.left, data) && evaluateAST(node.right, data);
        } else if (node.value === 'OR') {
            return evaluateAST(node.left, data) || evaluateAST(node.right, data);
        }
    }
    return false;
};

// Function to evaluate a rule against provided user data (POST /api/rules/evaluate)
// const evaluateRule = async (req, res) => {
//     const { data } = req.body;

//     // Hardcoded AST for example, in a real case, you would fetch the AST from the database
//     const ast = new Node('operator', 
//         new Node('operand', null, null, 'age > 30'), 
//         new Node('operand', null, null, 'salary > 50000'), 
//         'AND'
//     );

//     const result = evaluateAST(ast, data);
//     res.json({ result });
// };

// Function to evaluate a rule against provided user data (POST /api/rules/evaluate)
const evaluateRule = async (req, res) => {
    const { ruleId, data } = req.body; // Expecting ruleId to identify the rule

    if (!ruleId || !data) {
        return res.status(400).json({ error: 'Rule ID and data are required' });
    }

    try {
        // Fetch the rule from the database using the ruleId
        const rule = await Rule.findById(ruleId);
        
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        // Use the stored AST from the rule
        const ast = rule.ast;

        // Evaluate the AST against the provided data
        const result = evaluateAST(ast, data);
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while evaluating the rule' });
    }
};


module.exports = { createRule, evaluateRule };
