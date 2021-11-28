const tap = require('tap-only')
const {Rule, RuleSet} = require('.')

const rule1 = new Rule({filename: {$regex: 'js$'}}, 'JS')
const shouldMatch = {filename: 'foo.js'}
const shouldNotMatch = {filename: 'foo.css'}

tap('Rules with references', t => {
    const refRule1 = new Rule([{bar:{$ref:'/foo'}}, 'yes', '$ref rule'])
    t.equals(refRule1.match({foo: 42, bar: 42}), true, 'reference resolved')
    var refRule2 = new Rule({"post.user": {$ref: '/user/id'}}, true)
    t.equals(refRule2.match({post: {title: 'title', user: 'john'}, user: {id: 'john'}}), true)
    t.equals(refRule2.match({post: {title: 'title', user: 'john'}, user: {id: 'mike'}}), false)
    t.end()
})

tap('Rule', (t) => {
    t.test('new(String, String)', (t) => {
        const rule1Copy = new Rule('{filename: {$regex: "js$"}}', 'JS')
        t.deepEqual(rule1Copy, rule1, 'new(String, String)')
        t.end()
    })
    t.test('new([String, String])', (t) => {
        const rule1Copy = new Rule(['{filename: {$regex: "js$"}}', 'JS'])
        t.deepEqual(rule1Copy, rule1, 'new ([String, String])')
        t.end()
    })
    t.test('new(Object, String)', (t) => {
        const rule1Copy = new Rule({filename: {$regex: "js$"}}, 'JS')
        t.deepEqual(rule1Copy, rule1, 'new ([Object, String])')
        t.end()
    })
    t.test('new([Object, String])', (t) => {
        const rule1Copy = new Rule([{filename: {$regex: "js$"}}, 'JS'])
        t.deepEqual(rule1Copy, rule1, 'new ([Object, String])')
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
            t.deepEquals(new Rule(variants[i]), rule1, `fromString: '${variants[i]}'`)
        }
        t.end()
    })
    t.test('match/apply', (t) => {
        t.equals(rule1.match(shouldMatch), true, `rule1 should match ${JSON.stringify(shouldMatch)}`)
        t.equals(rule1.match(shouldNotMatch), false, `rule1 should not match`)
        t.equals(new Rule({}, 'yay').match(42), true, '{} should match 42')
        t.equals(new Rule({}, 'yay').apply(42), 'yay', '{} applied to 42 should return yay')
        t.equals(new Rule({$older:'1 day'}, 42).apply(new Date('2000-01-01')), 42, '$older query')
        t.end()
    })

    t.test('named rules', t => {
        t.test('name in toString/fromString', (t) => {
            const namedRule1 = new Rule('42 --> false #== matchall rule')
            t.equals(namedRule1.name, 'matchall rule', 'name was set')
            t.equals(namedRule1.head, 42, 'head parsed')
            const namedRule2 = new Rule('42 #== matchall rule', 23)
            t.equals(namedRule2.name, 'matchall rule', 'name was set')
            t.equals(namedRule2.head, 42, 'head parsed')
            t.equals(namedRule2.tail, 23, 'tail parsed')
            t.equals(namedRule2.toString(), '42 --> 23 #== matchall rule', 'toString with name')
            t.end()
        })
        t.end()
    })

    t.end()
})

tap('Ruleset', (t) => {
    const ruleSet = new RuleSet()
    let rule2, rule3
    t.test('RuleSets can be constructed with different arguments', t => {
        t.test('w/o arguments', t => {
            const ruleSet = new RuleSet()
            t.equals(ruleSet.name, 'untitled', 'default name')
            t.equals(ruleSet.rules.length, 0, 'empty rules')
            t.end()
        })
        t.test('array argument', t => {
            const ruleSet = new RuleSet(['true --> false'])
            t.equals(ruleSet.name, 'untitled', 'default name')
            t.equals(ruleSet.rules.length, 1, 'rule stored')
            t.end()
        })
        t.test('object argument', t => {
            const ruleSet = new RuleSet({name: 'foo rules', rules: ['true --> false']})
            t.equals(ruleSet.name, 'foo rules', 'name picked up')
            t.equals(ruleSet.rules.length, 1, 'rule stored')
            t.end()
        })
        t.test('various falsey arguments', t => {
            const values = [
                undefined,
                null,
                false,
                0,
            ]
            values.forEach(val => {
                t.test(String(val), t => {
                    const ruleSet = new RuleSet(val)
                    t.equals(ruleSet.name, 'untitled', 'default name')
                    t.equals(ruleSet.rules.length, 0, 'empty rules')
                    t.end()
                })
            })
            t.end()
        })
        t.end()
    })
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
    t.test('toString / toJSON / new(String)', (t) => {
        t.deepEquals(ruleSet.toJSON(), [rule2, rule3, rule1].map(r=>r.toJSON()))
        t.deepEquals(ruleSet.toString(), [rule2, rule3, rule1].map(r=>r.toString()).join(';\n'))
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
    t.test("Merging ruleSets", (t) => {
        const rs1 = new RuleSet(['foo'])
        const rs2 = new RuleSet(['bar'])
        rs1.addAll(rs2)
        t.equals(rs1.size, 2, 'after addAll, size is 2')
        // console.log(rs1.toString())
        rs1.deleteAll(rs2)
        t.equals(rs1.size, 1, 'after deleteAll, size is 1')
        rs1.clear()
        t.equals(rs1.size, 0, 'after clear, size is 0')
        t.end()
    })
    t.end()
})
