export default ({ $axios, app }) => {
  $axios.onRequest(config => {
    console.log(Object.keys(app))
    // add current ui language
    config.headers['Accept-Language'] = app.$i18n.locale()
  })
}
