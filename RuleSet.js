const Rule = require('./Rule')

const RULE_SEP = ';\n'

function _isaRule(obj) { return obj.constructor === Rule }
function _isaRuleSet(obj) { return obj.constructor === RuleSet }
function ifArray(x) { return Array.isArray(x) && x }

class RuleSet {

    /*
     * #### `RuleSet.new()`
     * 
     * ```js
     * new RuleSet{[rule1, rule2...]}
     * new RuleSet({name: 'ruleset1', rules: [rule1, rule2...]})
     * ```
     * 
     * Create a new Ruleset.
     */
    constructor(origRules) {
        const rules = origRules || []
        this.name = rules.name || 'untitled'
        this.rules = []
        this.addAll(ifArray(rules.rules) || rules)
    }

    /*
     * #### Managing rules
     */

    /*
     * 
     * #### `RuleSet.size`
     * 
     * Return the number of rules in the RuleSet.
     */
    get size() { return this.rules.length }

    /*
     * #### `RuleSet.add()`
     * 
     * ```js
     * ruleset.add(rule)
     * ruleset.add(ruleString)
     * ruleset.add(head, tail, name)
     * ```
     * 
     * Adds a single rule to the RuleSet. If rule is not an instance of a `Rule`, passes arguments to the [`Rule.new`](#rule-new).
     * 
     * Returns the rule.
     * 
     */
    add(head, tail, name) {
        const rule = _isaRule(head) ? head : new Rule(head, tail, name)
        // console.log("Adding rule", rule)
        this.rules.push(rule)
        return rule
    }

    /*
     * #### `RuleSet.addAll()`
     * 
     * ```js
     * ruleset.addAll(otherRuleset)
     * ruleset.addAll(arrayOfRules)
     * ```
     * 
     */
    addAll(rules=[]) {
        if (rules.constructor === RuleSet) {
            rules.rules.forEach(rule => this.add(rule))
            return
        } else if (typeof rules === 'string') {
            rules = rules.split(RULE_SEP)
        }
        rules.map(rule => new Rule(rule)).forEach(rule => this.add(rule))
    }

    /*
     * #### `RuleSet.delete()`
     * 
     */
    delete(head, tail) {
        const asString = _isaRule(head) ? head.toString()
            : new Rule(head, tail).toString()
        const idx = this.rules.findIndex((rule) => rule.toString() === asString)
        // console.log(this.rules, asString, idx)
        if (idx > -1) this.rules.splice(idx, 1)
    }

    /*
     * #### `RuleSet.deleteAll()`
     * 
     */
    deleteAll(rules=[]) {
        if (rules.constructor === RuleSet) rules = rules.rules
        else if (typeof rules === 'string') rules = rules.split(RULE_SEP)
        rules.forEach(rule => this.delete(rule))
    }

    /*
     * #### `RuleSet.clear()`
     * 
     * Delete all rules in this RuleSet.
     * 
     */
    clear() {
        this.rules = []
    }

    /*
     * #### Processing rules
     */

    /*
     * #### `RuleSet.every()`
     * 
     * ```js
     * ruleset.every(value)
     * ```
     * 
     * Return `true` if the `head` of every rule matches `value`, `false` otherwise.
     */
    every(obj) { return this.rules.every(rule => rule.match(obj)) }

    /*
     * #### `RuleSet.some()`
     * 
     * ```js
     * ruleset.some(value)
     * ```
     * 
     * Return `true` if the `head` of any rule matches `value`, `false` if none match.
     */
    some(obj) { return this.rules.find(rule => rule.match(obj)) !== undefined }

    /*
     * #### `RuleSet.filter()`
     * 
     * ```js
     * ruleset.filter(value)
     * ```
     * 
     * Return the rules whose `head` matches `value`.
     */
    filter(obj) { return this.rules.filter(rule => rule.match(obj)) }

    /*
     * #### `RuleSet.filterApply()`
     * 
     * ```js
     * ruleset.filter(value)
     * ```
     * 
     * Return the `tail` of any rule whose `head` matches `value`.
     */
    filterApply(obj) { return this.filter(obj).map(rule => rule.tail) }

    /*
     * #### `RuleSet.first()`
     * 
     * ```js
     * ruleset.first(value)
     * ```
     * 
     * Return the first rule whose `head` matches `value`.
     */
    first(obj) { return this.rules.find(rule => rule.match(obj)) }

    /*
     * #### `RuleSet.firstApply()`
     * 
     * ```js
     * ruleset.firstApply(value)
     * ```
     * 
     * Return the `tail` of the first rule whose `head` matches `value`.
     */
    firstApply(obj) { const rule = this.first(obj); if (rule) return rule.tail }

    /*
     * #### `RuleSet.toString()`
     */
    toString() {
        return this.rules.map(rule => rule.toString()).join(RULE_SEP)
    }

    toJSON() {
        return this.rules.map(rule => rule.toJSON())
    }

}
module.exports = RuleSet
