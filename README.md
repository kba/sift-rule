# sift-rule
Define rules using [sift](https://github.com/crcn/sift.js) (=~ MongoDB) queries

[![Build Status](https://travis-ci.org/kba/sift-rule.svg?branch=master)](https://travis-ci.org/kba/sift-rule)

<!-- BEGIN-MARKDOWN-TOC -->
* [Terminology](#terminology)
* [Example](#example)
* [String notation](#string-notation)
* [Debugging](#debugging)
* [Extensions](#extensions)
	* [References](#references)
* [API](#api)
	* [Rule](#rule)
		* [`Rule.new()`](#rulenew)
		* [`Rule.match()`](#rulematch)
		* [`Rule.apply()`](#ruleapply)
	* [RuleSet](#ruleset)
		* [`RuleSet.new()`](#rulesetnew)
		* [Managing rules](#managing-rules)
		* [`RuleSet.size`](#rulesetsize)
		* [`RuleSet.add()`](#rulesetadd)
		* [`RuleSet.addAll()`](#rulesetaddall)
		* [`RuleSet.delete()`](#rulesetdelete)
		* [`RuleSet.deleteAll()`](#rulesetdeleteall)
		* [`RuleSet.clear()`](#rulesetclear)
		* [Processing rules](#processing-rules)
		* [`RuleSet.every()`](#rulesetevery)
		* [`RuleSet.some()`](#rulesetsome)
		* [`RuleSet.filter()`](#rulesetfilter)
		* [`RuleSet.filterApply()`](#rulesetfilterapply)
		* [`RuleSet.first()`](#rulesetfirst)
		* [`RuleSet.firstApply()`](#rulesetfirstapply)
		* [`RuleSet.toString()`](#rulesettostring)

<!-- END-MARKDOWN-TOC -->

## Terminology

* Rules have a `head` and a `tail`.
* Rules are applied to values. If the value matches the `head`, the `tail` is implied.
* Rules can have an optional name.
* Rulesets are list of rules.
* Rules are applied to values. Depending on the logic (which method is used, see [RuleSet API](#ruleset-api) below):
  * Return all matching rules
  * Return all an array of the `tail` of all matching rules
  * Return whether ever rule in the set matched
  * Return whether some rules in the set matched

## Example

```js
const {RuleSet} = require('sift-rule')
colorRules = new RuleSet()
colorRules.add({filename: {$regex: '\.js$'}}, 'red')
colorRules.add({filename: {$regex: '^foo'}}, 'green')

colorRules.filterApply({filename: 'foo.js'})
// => ['red', 'green']
colorRules.filterApply({filename: 'foo.css'})
// => ['green']
```

## String notation

* `head` and `tail` are separated by `-->`
* Rule and rule name are separated by `#==`
* `head` and `tail` are parsed as [HJSON](https://hjson.org/), JSON with some extensions:
  * Object keys can be unquoted
  * Escaped backslashes are doubled, to make it easier to write regexes
  * Unquoted values of the form `YYYY-MM-DD` are parsed as `Date`
  * Unquoted values of the form `0x...`  are parsed as hexadecimal numbers

`{topic: "Universe"}  -->  42  #== answer to everything` parses as

```js
{
  head: { topic: "Universe" },
  tail: 42,
  name: 'answer to everything',
}
```

## Debugging

To get debug output:

* Set `process.env.SIFT_RULE_DEBUG='true'` in Node.js
* Set `window.SIFT_RULE_DEBUG='true'` in the browser

NOTE: `'true'` must be the string `true` not the boolean value `true`.

## Extensions

### References

You can add clauses to a rule head that reference data in the object to sift
using an object with a single `$ref` key and a JSON Pointer as the value.

For example, to define a rule that users may only edit their own posts:

```js
var rule = new Rule({"post.user": {$ref: '/user/id'}}, true)

rule.apply({post: {title: 'title', user: 'john'}, user: {id: 'john'}})
// => true
rule.apply({post: {title: 'title', user: 'john'}, user: {id: 'mike'}}) // true
// => false
```

**NOTE:** references to non-existing values are set to `NaN` (not-a-number)
because `NaN !== NaN` so this clause will always fail.

## API

### Rule

<!-- BEGIN-RENDER ./Rule.js -->
#### `Rule.new()`

```js
new Rule(stringRule)
new Rule(head[, tail][, name])
```

Constructor takes either a rule in [String notation](#string-notation) or `head`, `tail` (optional) and name (optional)

#### `Rule.match()`

```js
rule.match(value)
```

Return `true` if the `head` matches `val`, `false` otherwise.

#### `Rule.apply()`

```js
rule.match(value)
```

Return the `tail` if the `head` matches `val`, `undefined` otherwise.

<!-- END-RENDER -->

### RuleSet

<!-- BEGIN-RENDER ./RuleSet.js -->
#### `RuleSet.new()`

```js
new RuleSet{[rule1, rule2...]}
new RuleSet({name: 'ruleset1', rules: [rule1, rule2...]})
```

Create a new Ruleset.
#### Managing rules

#### `RuleSet.size`

Return the number of rules in the RuleSet.
#### `RuleSet.add()`

```js
ruleset.add(rule)
ruleset.add(ruleString)
ruleset.add(head, tail, name)
```

Adds a single rule to the RuleSet. If rule is not an instance of a `Rule`, passes arguments to the [`Rule.new`](#rule-new).

Returns the rule.

#### `RuleSet.addAll()`

```js
ruleset.addAll(otherRuleset)
ruleset.addAll(arrayOfRules)
```

#### `RuleSet.delete()`

#### `RuleSet.deleteAll()`

#### `RuleSet.clear()`

Delete all rules in this RuleSet.

#### Processing rules
#### `RuleSet.every()`

```js
ruleset.every(value)
```

Return `true` if the `head` of every rule matches `value`, `false` otherwise.
#### `RuleSet.some()`

```js
ruleset.some(value)
```

Return `true` if the `head` of any rule matches `value`, `false` if none match.
#### `RuleSet.filter()`

```js
ruleset.filter(value)
```

Return the rules whose `head` matches `value`.
#### `RuleSet.filterApply()`

```js
ruleset.filter(value)
```

Return the `tail` of any rule whose `head` matches `value`.
#### `RuleSet.first()`

```js
ruleset.first(value)
```

Return the first rule whose `head` matches `value`.
#### `RuleSet.firstApply()`

```js
ruleset.firstApply(value)
```

Return the `tail` of the first rule whose `head` matches `value`.
#### `RuleSet.toString()`

<!-- END-RENDER -->







