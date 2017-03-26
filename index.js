[
    './Rule',
    './RuleSet',
].forEach(mod => module.exports[mod.substr(2)] = require(mod))
