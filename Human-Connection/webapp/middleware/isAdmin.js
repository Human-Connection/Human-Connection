export default ({ store, error }) => {
  if (!store.getters['auth/isAdmin']) {
    return error({ statusCode: 403 })
  }
}
