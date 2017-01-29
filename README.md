# sift-rule
Define rules using MongoDB/sift queries

<!-- BEGIN-MARKDOWN-TOC -->
* [Example](#example)
* [API](#api)
	* [Rule](#rule)

<!-- END-MARKDOWN-TOC -->

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

## API

### Rule

### RuleSet
