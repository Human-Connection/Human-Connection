import camelCase from 'lodash/camelCase'
import { tokenMap } from '@@/tokens'

const getSpace = space => {
  const spaceName = camelCase(space)
  return tokenMap.spaceSize[spaceName] ? tokenMap.spaceSize[spaceName].value : 0
}

export { getSpace }
