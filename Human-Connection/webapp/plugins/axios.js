export default ({ $axios, app }) => {
  $axios.onRequest(config => {
    /* eslint-disable-next-line no-console */
    console.log(Object.keys(app))
    // add current ui language
    config.headers['Accept-Language'] = app.$i18n.locale()
  })
}
