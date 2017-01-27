const sift = require('sift')

module.exports = class Rule {

    constructor(head, tail) {
        this._filter = sift(head)
        this.head = head
        this.tail = tail
    }
    match(obj) { return this._filter(obj) }

}
