import unionBy from 'lodash/unionBy'

export default function UpdateQuery(component, { $state, pageKey }) {
  if (!pageKey) throw new Error('No key given for the graphql query { data } object')
  return (previousResult, { fetchMoreResult }) => {
    const oldData = (previousResult && previousResult[pageKey]) || []
    const newData = (fetchMoreResult && fetchMoreResult[pageKey]) || []
    if (newData.length < component.pageSize) {
      component.hasMore = false
      $state.complete()
    }
    const result = {}
    result[pageKey] = unionBy(oldData, newData, (item) => item.id)
    $state.loaded()
    return result
  }
}
