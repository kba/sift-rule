const sift = require('sift')
const siftDate = require('sift-date')
sift.use(siftDate)
const hjson = require('hjson')
const strsplit = require('strsplit')
const hjsonDsfRegex = require('hjson-dsf-regex')

const HEAD_TAIL_SEP = '-->'
const HEAD_TAIL_SEP_REGEX = new RegExp("\\s*" + HEAD_TAIL_SEP + "\\s*")

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
        if (Array.isArray(head)) {
            [head, tail] = head
        }
        if (typeof head === 'string') {
            if (head.indexOf(HEAD_TAIL_SEP) > -1) {
                [head, tail] = strsplit(head, HEAD_TAIL_SEP_REGEX, 2).map(_hjsonParse)
            } else {
                head = _hjsonParse(head)
            }
        }
        this[_FILTER] = sift(head)
        this.head = head
        this.tail = tail
    }

    match(obj) { return this[_FILTER](obj) }
    apply(obj) { if (this.match(obj)) return this.tail }

    toString() {
        return this.toJSON()
            .map((v) => hjsonStringify(v))
            .join(` ${HEAD_TAIL_SEP} `)
            .replace(/\n/g, '')
    }

    toJSON() {
        return [this.head, this.tail]
    }

}
