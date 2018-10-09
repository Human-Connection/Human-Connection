module.exports = function(source, map) {
  this.callback(
    null,
    `export default function () {}`,
    map
  )
}
