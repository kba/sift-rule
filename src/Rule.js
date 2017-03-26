const sift = require('sift')
const siftDate = require('sift-date')
sift.use(siftDate)
const hjson = require('hjson')
const strsplit = require('strsplit')
const hjsonDsfRegex = require('hjson-dsf-regex')
const jsonPointer = require('json-pointer')
const traverse = require('traverse')

const RULE_NAME_SEP = '#=='
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
    separator: true,
    bracesSameLine: true,
    quotes: 'strings'
})

const _FILTER = Symbol('filter')
module.exports = class Rule {

    constructor(head, tail, name='') {
        if (Array.isArray(head)) {
            [head, tail, name] = head
        }
        if (typeof head === 'string') {
            var headName
            [head, headName] = head.split(RULE_NAME_SEP)
            if (headName && name === '')
                name = headName.trim()
            // XXX this is to make regexes easier, e.g. \\. instead of \\\\.
            head = head.replace('\\', '\\\\')
            if (head.indexOf(HEAD_TAIL_SEP) > -1) {
                [head, tail] = strsplit(head, HEAD_TAIL_SEP_REGEX, 2).map(_hjsonParse)
            } else {
                head = _hjsonParse(head)
            }
        }
        var containsReferences = false
        traverse(head).forEach(function(node) {
            if (this && this.key === '$ref') containsReferences = true
        })
        this.containsReferences = containsReferences
        if (!this.containsReferences) {
            this[_FILTER] = sift(head)
        } else {
            this[_FILTER] = (obj) => {
                const headDereferenced = JSON.parse(JSON.stringify(this.head))
                traverse(headDereferenced).forEach(function() {
                    if (this && this.key === '$ref') {
                        this.parent.update(jsonPointer.get(obj, this.node), true)
                    }
                })
                return sift(headDereferenced)(obj)
            }
        }
        this.head = head
        this.tail = (tail !== undefined) ? tail : true
        this.name = name ? name : ''
    }

    match(obj) { return this[_FILTER](obj) }
    apply(obj) { if (this.match(obj)) return this.tail }

    toString() {
        var ret = this.toJSON()
            .map((v) => hjsonStringify(v))
            .join(` ${HEAD_TAIL_SEP} `)
            .replace(/\n/g, '')
        if (this.name !== '') ret += ` ${RULE_NAME_SEP} ${this.name}`
        return ret
    }

    toJSON() {
        return [this.head, this.tail]
    }

}
