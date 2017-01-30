const Rule = require('./Rule')

const RULE_SEP = ';\n'

function _isaRule(obj) { return obj.constructor === Rule }
function _isaRuleSet(obj) { return obj.constructor === RuleSet }

class RuleSet {

    constructor(rules=[]) {
        this.rules = []
        this.addAll(rules)
    }

    get size() { return this.rules.length }

    add(head, tail) {
        const rule = _isaRule(head) ? head : new Rule(head, tail)
        // console.log("Adding rule", rule)
        this.rules.push(rule)
        return rule
    }

    addAll(rules=[]) {
        if (rules.constructor === RuleSet) {
            rules.rules.forEach(rule => this.add(rule))
            return
        } else if (typeof rules === 'string') {
            rules = rules.split(RULE_SEP)
        }
        rules.map(rule => new Rule(rule)).forEach(rule => this.add(rule))
    }

    delete(head, tail) {
        const asString = _isaRule(head) ? head.toString()
            : new Rule(head, tail).toString()
        const idx = this.rules.findIndex((rule) => rule.toString() === asString)
        // console.log(this.rules, asString, idx)
        if (idx > -1) this.rules.splice(idx, 1)
    }

    deleteAll(rules=[]) {
        if (rules.constructor === RuleSet) rules = rules.rules
        else if (typeof rules === 'string') rules = rules.split(RULE_SEP)
        rules.forEach(rule => this.delete(rule))
    }

    every(obj) { return this.rules.every(rule => rule.match(obj)) }
    some(obj) { return this.rules.find(rule => rule.match(obj)) !== undefined }

    filter(obj) { return this.rules.filter(rule => rule.match(obj)) }
    filterApply(obj) { return this.filter(obj).map(rule => rule.tail) }

    first(obj) { return this.rules.find(rule => rule.match(obj)) }
    firstApply(obj) { const rule = this.first(obj); if (rule) return rule.tail }

    toString() {
        return this.rules.map(rule => rule.toString()).join(RULE_SEP)
    }

    toJSON() {
        return this.rules.map(rule => rule.toJSON())
    }

}
module.exports = RuleSet
