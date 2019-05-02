import cloneDeep from 'lodash/cloneDeep'

/* eslint-disable */
const defaultOrderBy = (resolve, root, args, context, resolveInfo) => {
  const copy = cloneDeep(resolveInfo)
  const newestFirst = {
    kind: 'Argument',
    name: { kind: 'Name', value: 'orderBy' },
    value: { kind: 'EnumValue', value: 'createdAt_desc' }
  }
  const [fieldNode] = copy.fieldNodes
  if (fieldNode) fieldNode.arguments.push(newestFirst)
  return resolve(root, args, context, copy)
}
/* eslint-enable */

export default {
  Query: {
    // Post: defaultOrderBy
  }
}
