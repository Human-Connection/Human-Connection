export function queryString(str) {
  const normalizedString = normalizeWhitespace(str)
    const escapedString = escapeSpecialCharacters(normalizedString)
    return `
${matchWholeText(escapedString)}
${matchEachWordExactly(escapedString)}
${matchSomeWordsExactly(escapedString)}
${matchBeginningOfWords(escapedString)}
`
}

const matchWholeText = (str, boost = 8) => {
    return `"${str}"^${boost}`
}

const matchEachWordExactly = (str, boost = 4) => {
    if (str.includes(' ')) {
	let tmp = str.split(' ').map((s, i) => i === 0 ? `"${s}"` : `AND "${s}"`).join(' ')
	return `(${tmp})^${boost}`
    } else {
	return ''
    }
}

const matchSomeWordsExactly = (str, boost = 2) => {
    if (str.includes(' ')) {
	return str.split(' ').map(s => `"${s}"^${boost}`).join(' ')
    } else {
	return ''
    }    
}

const matchBeginningOfWords = str => {
    return normalizeWhitespace(str.split(' ').map(s => {
	if (s.length > 3) {
	    // at least 4 letters. So AND, OR and NOT are never used unquoted
	    return s + '*'
	} else {
	    return ''
	}
    }).join(' '))
}

export function normalizeWhitespace(str) {
    return str.replace(/\s+/g, ' ').trim()
}

export function escapeSpecialCharacters(str) {
  return str.replace(/(["[\]&|\\{}+!()^~*?:/-])/g, '\\$1')
}
