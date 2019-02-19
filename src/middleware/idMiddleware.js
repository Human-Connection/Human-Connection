import find from 'lodash/find'

const includeId = async (resolve, root, args, context, info) => {
  let isIdPresent
  let removeIdFromResult
  isIdPresent = find(info.fieldNodes[0].selectionSet.selections, item => item.name.value === 'id')
  if (!isIdPresent) {
    // add id to request as the user did not ask but we need it
    info.fieldNodes[0].selectionSet.selections.unshift({
      kind: 'Field',
      name: { kind: 'Name', value: 'id' }
    })
    removeIdFromResult = true
  }

  const result = await resolve(root, args, context, info)

  if (!isIdPresent && removeIdFromResult) {
    // remove id if the user did not ask for it
    info.fieldNodes[0].selectionSet.selections.shift()
  }
  return result
}

export default {
  Query: (resolve, root, args, context, info) => {
    return includeId(resolve, root, args, context, info)
  },
  Mutation: (resolve, root, args, context, info) => {
    return includeId(resolve, root, args, context, info)
  }
}
