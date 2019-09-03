/**WORKAROUND for https://github.com/Akryum/vue-apollo/issues/492
 *
 * So the problem is that `update` gets called twice for fetch policy
 * `cache-and-network`. It seems that the first call is the cached result
 * whereas the second call is the updated result.
 *
 * Most of the time, we want to fetch more items and append it to the
 * existing ones. That will lead to duplicate items on the first two calls.
 * If we try to de-duplicate the new items and then append, we run into:
 * https://github.com/Human-Connection/Human-Connection/issues/1394
 *
 * So this function helps to distinguish between a cache update and a new
 * result, e.g. after increasing `offset`. For a cache update you would
 * replace the list and for a new result you would append.
 *
 * TODO: replace this as soon as https://github.com/Akryum/vue-apollo/issues/492
 * is resolved.
 */
export default function isCacheUpdate(items, newItems) {
  const firstDuplicate = newItems.find((newItem) => items.find(item => item.id === newItem.id))
  return firstDuplicate !== undefined
}
