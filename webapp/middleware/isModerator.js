export default ({ store, error }) => {
  if (!store.getters['auth/isModerator']) {
    return error({ statusCode: 403, message: 'error-pages.not-authorized' })
  }
}
