const sift = require('sift')
const hjson = require('hjson')
const strsplit = require('strsplit')
const hjsonDsfRegex = require('hjson-dsf-regex')

const _FILTER = Symbol('filter')
const _HJSON_PARSE_OPTIONS = Symbol('hjsonParseOptions')
const _HJSON_STRINGIFY_OPTIONS = Symbol('hjsonStringifyOptions')

module.exports = class Rule {

    constructor(head, tail) {
        this[_FILTER] = sift(head)
        this[_HJSON_PARSE_OPTIONS] = {
            dsf: [hjsonDsfRegex()],
        }
        this[_HJSON_STRINGIFY_OPTIONS] = {
            dsf: [hjsonDsfRegex()],
            space: 0,
            bracesSameLine: true,
            quotes: 'strings'
        }
        this.head = head
        this.tail = tail
    }
    match(obj) { return this[_FILTER](obj) }
    apply(obj) { if (this.match(obj)) return this.tail }

    toString() {
        return [this.head, this.tail].map((v) => {
            return hjson.stringify(v, this[_HJSON_STRINGIFY_OPTIONS])
        }).join(' ==> ').replace(/\n/g, '');
    }
    static fromString(str) {
        const [head, tail] = strsplit(str, /\s*==>\s*/, 2)
            .map((v) => hjson.parse(v, this[_HJSON_PARSE_OPTIONS])
)
        return new Rule(head, tail)
    }

}
