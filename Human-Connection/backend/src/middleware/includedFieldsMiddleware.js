import cloneDeep from 'lodash/cloneDeep'

const _includeFieldsRecursively = (selectionSet, includedFields) => {
  if (!selectionSet) return
  includedFields.forEach((includedField) => {
    selectionSet.selections.unshift({
      kind: 'Field',
      name: { kind: 'Name', value: includedField }
    })
  })
  selectionSet.selections.forEach((selection) => {
    _includeFieldsRecursively(selection.selectionSet, includedFields)
  })
}

const includeFieldsRecursively = (includedFields) => {
  return (resolve, root, args, context, resolveInfo) => {
    const copy = cloneDeep(resolveInfo)
    copy.fieldNodes.forEach((fieldNode) => {
      _includeFieldsRecursively(fieldNode.selectionSet, includedFields)
    })
    return resolve(root, args, context, copy)
  }
}

export default {
  Query: includeFieldsRecursively(['id', 'createdAt', 'disabled', 'deleted']),
  Mutation: includeFieldsRecursively(['id', 'createdAt', 'disabled', 'deleted'])
}
