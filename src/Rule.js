const sift = require('sift')
const hjson = require('hjson')
const strsplit = require('strsplit')
const hjsonDsfRegex = require('hjson-dsf-regex')

const RULE_SEP = '-->'
const RULE_SEP_REGEX = new RegExp("\\s*" + RULE_SEP + "\\s*")

const dsfs = [
    hjsonDsfRegex(),
    hjson.dsf.hex(),
    hjson.dsf.date(),
    hjson.dsf.math(),
]
const _hjsonParse = (val) => hjson.parse(val, {
    dsf: dsfs
})
const hjsonStringify = (val) => hjson.stringify(val, {
    dsf: dsfs,
    space: 0,
    bracesSameLine: true,
    quotes: 'strings'
})

const _FILTER = Symbol('filter')
module.exports = class Rule {

    constructor(head, tail) {
        this[_FILTER] = sift(head)
        this.head = (typeof head === 'string')
            ? _hjsonParse(head)
            : head
        this.tail = tail
    }
    match(obj) { return this[_FILTER](obj) }
    apply(obj) { if (this.match(obj)) return this.tail }

    toString() {
        return [this.head, this.tail]
            .map((v) => hjsonStringify(v))
            .join(` ${RULE_SEP} `)
            .replace(/\n/g, '')
    }

    static fromString(str) {
        const [head, tail] = strsplit(str, RULE_SEP_REGEX, 2)
            .map((v) => _hjsonParse(v))
        return new Rule(head, tail)
    }

}
