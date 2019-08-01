export default (error, context) => {
  /* eslint-disable-next-line no-console */

  // TODO: I added this code without ever reaching it!
  // See: https://github.com/nuxt-community/apollo-module/pull/218#issuecomment-506939244
  // Maybe this `errorHandler` callback is never being called?

  console.log(
    '%cError',
    'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
    error.message,
  )
  context.error({ statusCode: 304, message: 'Server error' })
}
