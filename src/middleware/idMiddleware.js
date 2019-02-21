import cloneDeep from 'lodash/cloneDeep'

const includeId = async (resolve, root, args, context, resolveInfo) => {
  // Keeping the graphql resolveInfo untouched ensures that we don't add the
  // following attributes to the result set returned to the graphQL client.
  // We only want to pass these attributes to our resolver for internal
  // purposes e.g. authorization.
  const copy = cloneDeep(resolveInfo)

  copy.fieldNodes[0].selectionSet.selections.unshift({
    kind: 'Field',
    name: { kind: 'Name', value: 'id' }
  })
  return resolve(root, args, context, copy)
}

export default {
  Query: (resolve, root, args, context, info) => {
    return includeId(resolve, root, args, context, info)
  },
  Mutation: (resolve, root, args, context, info) => {
    return includeId(resolve, root, args, context, info)
  }
}
