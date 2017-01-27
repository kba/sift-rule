const sift = require('sift')
const hjson = require('hjson')
const strsplit = require('strsplit')
const hjsonDsfRegex = require('hjson-dsf-regex')

const _FILTER = Symbol('filter')

const dsfs = [
    hjsonDsfRegex(),
    hjson.dsf.hex(),
    hjson.dsf.date(),
    hjson.dsf.math(),
]
const _HJSON_PARSE = (val) => hjson.parse(val, {
    dsf: dsfs
})
const _HJSON_STRINGIFY = (val) => hjson.stringify(val, {
    dsf: dsfs,
    space: 0,
    bracesSameLine: true,
    quotes: 'strings'
})

module.exports = class Rule {

    constructor(head, tail) {
        this[_FILTER] = sift(head)
        this.head = (typeof head === 'string')
            ? _HJSON_PARSE(head)
            : head
        this.tail = tail
    }
    match(obj) { return this[_FILTER](obj) }
    apply(obj) { if (this.match(obj)) return this.tail }

    toString() {
        return [this.head, this.tail]
            .map((v) => _HJSON_STRINGIFY(v))
            .join(' ==> ').replace(/\n/g, '')
    }

    static fromString(str) {
        const [head, tail] = strsplit(str, /\s*==>\s*/, 2)
            .map((v) => _HJSON_PARSE(v))
        return new Rule(head, tail)
    }

}
