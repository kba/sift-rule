const Rule = require('./Rule')

const RULE_SEP = ';\n'

function _isaRule(obj) {
    return obj.constructor === Rule
}

module.exports = class RuleSet {

    constructor(rules=[]) {
        this.rules = []
        this.addAll(rules)
    }

    get size() { return this.rules.length }

    add(head, tail) {
        const rule = _isaRule(head) ? head : new Rule(head, tail)
        console.log("Adding rule", rule)
        this.rules.push(rule)
        return rule
    }

    addAll(rules=[]) {
        if (typeof rules === 'string')
            rules = rules.split(RULE_SEP)
        rules.map(rule => new Rule(rule))
            .forEach(rule => this.add(rule))
    }

    delete(head, tail) {
        const idx = _isaRule(head) ? this.rules.indexOf(head)
            : this.rules.findIndex((rule) => rule.head == head && rule.tail == tail)
        if (idx > -1) this.rules.splice(idx, 1)
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
