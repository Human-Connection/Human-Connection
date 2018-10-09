// Get jsdocs meta from component with
// @url: https://github.com/vue-styleguidist/vue-docgen-api
const parseSource = require('vue-docgen-api').parseSource

module.exports = function(source) {
  const callback = this.async()
  const content = JSON.stringify(source)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
    .replace(/\\n/g, '\n')
  const component = parseSource(content, this.resourcePath)
  callback(null, `module.exports = ${JSON.stringify(component)}`)
}
