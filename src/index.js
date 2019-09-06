/**
 * @module groq-js
 */

const {parse} = require('./parser')
const {evaluate} = require('./evaluator')

exports.parse = parse;
exports.evaluate = evaluate;