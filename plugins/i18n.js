import Vue from 'vue'
import Vuex from 'vuex'
import vuexI18n from 'vuex-i18n/dist/vuex-i18n.umd.js'
import { debounce, isEmpty, find } from 'lodash'

/**
 * TODO: Refactor and simplify browser detection
 * and implement the user preference logic
 */
export default ({ app, req, cookie, store }) => {
  const debug = app.$env.NODE_ENV !== 'production'
  const key = 'locale'

  const changeHandler = async mutation => {
    if (process.server) return

    const newLocale = mutation.payload.locale
    const currentLocale = await app.$cookies.get(key)
    const isDifferent = newLocale !== currentLocale

    if (!isDifferent) {
      return
    }

    app.$cookies.set(key, newLocale)
    if (!app.$i18n.localeExists(newLocale)) {
      import(`~/locales/${newLocale}.json`).then(res => {
        app.$i18n.add(newLocale, res.default)
      })
    }

    const user = store.getters['auth/user']
    const token = store.getters['auth/token']
    // persist language if it differs from last value
    if (user && user._id && token) {
      // TODO: SAVE LOCALE
      // store.dispatch('usersettings/patch', {
      //   uiLanguage: newLocale
      // }, { root: true })
    }
  }

  // const i18nStore = new Vuex.Store({
  //   strict: debug
  // })

  Vue.use(vuexI18n.plugin, store, {
    onTranslationNotFound: function(locale, key) {
      if (debug) {
        console.warn(
          `vuex-i18n :: Key '${key}' not found for locale '${locale}'`
        )
      }
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

  const availableLocales = process.env.locales.filter(lang => !!lang.enabled)
  const locale = find(availableLocales, ['code', userLocale])
    ? userLocale
    : 'en'

  if (locale !== 'en') {
    Vue.i18n.add(locale, require(`~/locales/${locale}.json`))
  }

  // Set the start locale to use
  Vue.i18n.set(locale)
  Vue.i18n.fallback('en')

  if (process.browser) {
    store.subscribe(mutation => {
      if (mutation.type === 'i18n/SET_LOCALE') {
        changeHandler(mutation)
      }
    })
  }

  app.$i18n = Vue.i18n

  return store
}
