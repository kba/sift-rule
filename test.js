const tap = require('tap')
const {Rule, RuleSet} = require('./src')

const rule1 = new Rule({filename: {$regex: 'js$'}}, 'JS')
const shouldMatch = {filename: 'foo.js'}
const shouldNotMatch = {filename: 'foo.css'}

tap.test('rule', (t) => {
    t.equals(rule1.tail, 'JS', 'rule tail')
    t.equals(rule1.match(shouldMatch), true, 'should match')
    t.equals(rule1.match(shouldNotMatch), false, 'should not match')
    t.end()
})

tap.test('ruleset', (t) => {
    const ruleSet = new RuleSet()
    const rule2 = ruleSet.add(shouldMatch, 'foo.js')
    t.equals(ruleSet.rules[0].tail, 'foo.js', 'first rule tail')
    const rule3 = ruleSet.add(shouldNotMatch, 'foo.css')
    t.equals(ruleSet.rules.length, 2, '2 rules')
    ruleSet.add(rule1)
    t.equals(rule1.tail, 'JS', 'rule tail')
    t.deepEquals(rule1, ruleSet.rules[2], 'rule1')
    t.equals(ruleSet.size, 3, '3 rules')
    t.deepEqual(ruleSet.filter(shouldMatch), ['foo.js', 'JS'], 'filter')
    t.deepEqual(ruleSet.first(shouldMatch), 'foo.js', 'first')
    t.deepEqual(ruleSet.some(shouldMatch), true, 'some => true')
    t.deepEqual(ruleSet.every(shouldMatch), false, 'every => false')
    ruleSet.delete(rule1)
    t.equals(ruleSet.size, 2, 'removed 1 rule => 2')
    ruleSet.delete(shouldMatch, 'foo.js')
    t.equals(ruleSet.size, 1, 'removed 1 rule => 1')
    t.deepEqual(ruleSet.some(shouldMatch), false, 'some => false')
    t.deepEqual(ruleSet.every(shouldNotMatch), true, 'some => true')
    t.end()
})
