import camelCase from 'lodash/camelCase'
import raw from './generated/tokens.raw.json'

const { tokens, tokenMap } = Object.keys(raw.props).reduce(
  ({ tokens, tokenMap }, key) => {
    const token = raw.props[key]
    const name = camelCase(key)
    const category = camelCase(token.category)
    if (!tokenMap[category]) {
      tokenMap[category] = {}
    }

    token.scss = `$${key.replace(/_/g, '-')}`

    tokens[name] = token.value
    tokenMap[category][name] = token
    return { tokens, tokenMap }
  },
  { tokens: {}, tokenMap: {} }
)

export { tokens, tokenMap }
