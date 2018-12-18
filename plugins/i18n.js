import Vue from 'vue'
import Vuex from 'vuex'
import vuexI18n from 'vuex-i18n/dist/vuex-i18n.umd.js'
import { debounce, isEmpty } from 'lodash'

/**
 * TODO: Refactor and simplify browser detection
 * and implement the user preference logic
 */
export default ({ app, req, cookie, store }) => {
  const debug = app.$env.NODE_ENV !== 'production'
  const key = 'locale'

  const changeHandler = debounce((mutation, store) => {
    if (process.server) return

    const currentLocale = app.$cookies.get(mutation.payload.locale)
    const isDifferent = mutation.payload.locale !== currentLocale
    if (isDifferent) {
      app.$cookies.set(key, mutation.payload.locale)
    }

    const user = store.getters['auth/user']
    const token = store.getters['auth/token']
    // persist language if it differs from last value
    if (isDifferent && user && user._id && token) {
      // TODO: SAVE LOCALE
      // store.dispatch('usersettings/patch', {
      //   uiLanguage: mutation.payload.locale
      // }, { root: true })
    }
  }, 500)

  const i18nStore = new Vuex.Store({
    strict: debug
  })

  Vue.use(vuexI18n.plugin, i18nStore, {
    onTranslationNotFound: function(locale, key) {
      console.warn(`vuex-i18n :: Key '${key}' not found for locale '${locale}'`)
    }
  })

  // register the fallback locales
  Vue.i18n.add('en', require('~/locales/en.json'))

  let userLocale = 'en'
  const localeCookie = app.$cookies.get(key)
  /* const userSettings = store.getters['auth/userSettings']
  if (userSettings && userSettings.uiLanguage) {
    // try to get saved user preference
    userLocale = userSettings.uiLanguage
  } else */
  if (!isEmpty(localeCookie)) {
    userLocale = localeCookie
  } else {
    userLocale = process.browser
      ? navigator.language || navigator.userLanguage
      : req.locale
    if (userLocale && !isEmpty(userLocale.language)) {
      userLocale = userLocale.language.substr(0, 2)
    }
  }

  const availableLocales = ['de', 'en']
  const locale = availableLocales.indexOf(userLocale) >= 0 ? userLocale : 'en'

  if (locale !== 'en') {
    Vue.i18n.add(locale, require(`~/locales/${locale}.json`))
  }

  // Set the start locale to use
  Vue.i18n.set(locale)
  Vue.i18n.fallback('en')

  if (process.client) {
    i18nStore.subscribe((mutation, s) => {
      if (mutation.type === 'i18n/SET_LOCALE') {
        changeHandler(mutation, store)
      }
    })
  }

  app.$i18n = Vue.i18n

  return i18nStore
}
