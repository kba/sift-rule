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

  /*
   * #### `Rule.new()`
   * 
   * ```js
   * new Rule(stringRule)
   * new Rule(head[, tail][, name])
   * ```
   * 
   * Constructor takes either a rule in [String notation](#string-notation) or `head`, `tail` (optional) and name (optional)
   * 
   */
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
                        try {
                            var val = jsonPointer.get(obj, this.node)
                            this.parent.update(val, true)
                        } catch (err) {
                            this.parent.update(NaN, true)
                        }
                    }
                })
                if (this.DEBUG) console.log(headDereferenced)
                return sift(headDereferenced)(obj)
            }
        }
        this.head = head
        this.tail = (tail !== undefined) ? tail : true
        this.name = name ? name : ''
    }

    get DEBUG() {
        try {
            return process.env.SIFT_RULE_DEBUG === 'true'
        } catch (err) { try {
            return window.SIFT_RULE_DEBUG
        } catch (err) { } }
    }


    /*
     * #### `Rule.match()`
     * 
     * ```js
     * rule.match(value)
     * ```
     * 
     * Return `true` if the `head` matches `val`, `false` otherwise.
     * 
     */
    match(obj) { return this[_FILTER](obj) }

    /*
     * #### `Rule.apply()`
     * 
     * ```js
     * rule.match(value)
     * ```
     * 
     * Return the `tail` if the `head` matches `val`, `undefined` otherwise.
     * 
     */
    apply(obj) { if (this.match(obj)) return this.tail }

    toString() {
        let ret = this.toJSON()
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
