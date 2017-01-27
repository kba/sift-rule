const Rule = require('./Rule')

function _isaRule(obj) {
    return obj.constructor && obj.constructor.name === 'Rule'
}

module.exports = class RuleSet {

    constructor() {
        this._rules = []
    }

    static fromRules(rules) {
        const ret = new RuleSet()
        rules.forEach(rule => ret.add(rule))
    }

    get rules() { return this._rules }

    get size() { return this._rules.length }

    add(head, tail) {
        const rule = _isaRule(head) ? head
            : typeof head === 'string' && !tail ? Rule.fromString(head)
            : new Rule(head, tail)
        // console.log("Adding rule", rule)
        this._rules.push(rule)
        return rule
    }

    delete(head, tail) {
        const idx = _isaRule(head) ? this._rules.indexOf(head)
            : this._rules.findIndex((rule) => rule.head == head && rule.tail == tail)
        if (idx > -1) this._rules.splice(idx, 1)
    }

    every(obj) { return this._rules.every(rule => rule.match(obj)) }
    some(obj) { return this._rules.find(rule => rule.match(obj)) !== undefined }

    filter(obj) { return this._rules.filter(rule => rule.match(obj)) }
    filterApply(obj) { return this.filter(obj).map(rule => rule.tail) }

    first(obj) { return this._rules.find(rule => rule.match(obj)) }
    firstApply(obj) { const rule = this.first(obj); if (rule) return rule.tail }

}
