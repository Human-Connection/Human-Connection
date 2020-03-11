export default function queryString(str) {
  // match the whole text exactly
  const normalizedString = normalizeWhitespace(str)
  const escapedString = escapeSpecialCharacters(normalizedString)
  let result = quoteString(escapedString) + '^8'
  // match each word exactly
  if (escapedString.includes(' ')) {
    result += ' OR ('
    escapedString.split(' ').forEach((s, i) => {
      result += i === 0 ? quoteString(s) : ' AND ' + quoteString(s)
    })
    result += ')^4'
  }
  // match at least one word exactly
  if (escapedString.includes(' ')) {
    escapedString.split(' ').forEach(s => {
      result += ' OR ' + quoteString(s) + '^2'
    })
  }
  // start globbing ...
  escapedString.split(' ').forEach(s => {
    if (s.length > 3) {
      // at least 4 letters. So AND, OR and NOT are never used unquoted
      result += ' OR ' + s + '*'
    }
  })
  // now we could become fuzzy using ~
  return result
}

const normalizeWhitespace = str => {
  return str.replace(/\s+/g, ' ')
}

const escapeSpecialCharacters = str => {
  return str.replace(/(["[\]&|\\{}+!()^~*?:/-])/g, '\\$1')
}

const quoteString = str => {
  return '"' + str + '"'
}
