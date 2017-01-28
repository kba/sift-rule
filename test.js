const tap = require('tap-only')
const {Rule, RuleSet} = require('./src')

const rule1 = new Rule({filename: {$regex: 'js$'}}, 'JS')
const shouldMatch = {filename: 'foo.js'}
const shouldNotMatch = {filename: 'foo.css'}


tap('Rule', (t) => {
    t.test('head as string', (t) => {
        const rule1Copy = new Rule('{filename: {$regex: "js$"}}', 'JS')
        t.deepEqual(rule1Copy, rule1, 'head as string works')
        t.end()
    })
    t.test('dsf/datetime', (t) => {
        const rule = new Rule('2014-01-01', 42)
        t.equals(rule.head.toISOString(), new Date('2014-01-01').toISOString(), 'date parsed correctly')
        t.end()
    })
    t.test('dsf/hex', (t) => {
        const rule = new Rule('0xDECAF', 42)
        t.equals(rule.head, 0xDECAF, 'hex parsed correctly')
        t.end()
    })
    t.test('dsf/regex', (t) => {
        const rule = new Rule('/a{1}/', 42)
        t.deepEquals(rule.head, /a{1}/, 'regex parsed correctly')
        t.end()
    })
    t.test('toString / fromString', (t) => {
        const rule1Str = '{"filename":{"$regex":"js$"}} --> "JS"'
        const variants = [
            '{filename: {$regex: "js$"}} --> "JS"',
            'filename: {$regex:"js$"} --> JS',
            'filename:{$regex:"js$"} --> JS',
            `{"filename":{"$regex":"js$"}} --> JS`,
        ]
        t.equals(rule1.tail, 'JS', 'rule tail')
        t.equals(rule1.toString(), variants[0], `toString: '${variants[0]}'`)
        for (let i = 1; i < variants.length; i++) {
            t.deepEquals(Rule.fromString(variants[i]), rule1, `fromString: '${variants[i]}'`)
        }
        t.end()
    })
    t.test('match/apply', (t) => {
        t.equals(rule1.match(shouldMatch), true, `rule1 should match ${JSON.stringify(shouldMatch)}`)
        t.equals(rule1.match(shouldNotMatch), false, `rule1 should not match`)
        t.equals(new Rule({}, 'yay').match(42), true, '{} should match 42')
        t.equals(new Rule({}, 'yay').apply(42), 'yay', '{} applied to 42 should return yay')
        t.end()
    })
    t.end()
})

tap('Ruleset', (t) => {
    const ruleSet = new RuleSet()
    let rule2, rule3
    t.test('Rules can be added', (t) => {
        rule2 = ruleSet.add(shouldMatch, 'foo.js')
        t.equals(ruleSet.rules[0].tail, 'foo.js', 'as head/tail tuple')
        rule3 = ruleSet.add(shouldNotMatch, 'foo.css')
        t.equals(ruleSet.rules.length, 2, 'as head/tail tuple again')
        ruleSet.add(rule1)
        t.equals(rule1.tail, 'JS', 'as a Rule instance')
        t.deepEquals(rule1, ruleSet.rules[2], 'same Rule instance')
        t.equals(ruleSet.size, 3, 'for 3 rules')
        t.end()
    })
    t.test('Rules can be matched/applied', (t) => {
        t.deepEqual(ruleSet.filter(shouldMatch), [rule2, rule1], 'filter')
        t.deepEqual(ruleSet.filterApply(shouldMatch), ['foo.js', 'JS'], 'filter')
        t.deepEqual(ruleSet.first(shouldMatch), rule2, 'first')
        t.deepEqual(ruleSet.firstApply(shouldMatch), 'foo.js', 'first')
        t.deepEqual(ruleSet.some(shouldMatch), true, 'some --> true')
        t.deepEqual(ruleSet.every(shouldMatch), false, 'every --> false')
        t.end()
    })
    t.test('delete', (t) => {
        ruleSet.delete(rule1)
        t.equals(ruleSet.size, 2, 'removed 1 rule --> 2')
        ruleSet.delete(shouldMatch, 'foo.js')
        t.equals(ruleSet.size, 1, 'removed 1 rule --> 1')
        t.deepEqual(ruleSet.some(shouldMatch), false, 'some --> false')
        t.deepEqual(ruleSet.every(shouldNotMatch), true, 'some --> true')
        t.end()
    })
    t.end()
})
