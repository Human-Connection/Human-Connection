import Vue from 'vue'

import { enUS, de, nl, fr, es } from 'date-fns/locale'
import format from 'date-fns/format'
import formatRelative from 'date-fns/formatRelative'
import addSeconds from 'date-fns/addSeconds'
import accounting from 'accounting'

export default ({ app }) => {
  const locales = {
    en: enUS,
    de: de,
    nl: nl,
    fr: fr,
    es: es,
    pt: es,
    pl: de
  }
  const getLocalizedFormat = () => {
    let locale = app.$i18n.locale()
    locale = locales[locale] ? locale : 'en'
    return locales[locale]
  }
  app.$filters = Object.assign(app.$filters || {}, {
    date: (value, fmt = 'dd. MMM yyyy') => {
      if (!value) return ''
      return format(new Date(value), fmt, {
        locale: getLocalizedFormat()
      })
    },
    dateTime: (value, fmt = 'dd. MMM yyyy HH:mm') => {
      if (!value) return ''
      return format(new Date(value), fmt, {
        locale: getLocalizedFormat()
      })
    },
    relativeDateTime: value => {
      if (!value) return ''
      return formatRelative(new Date(value), new Date(), {
        locale: getLocalizedFormat()
      })
    },
    number: (
      value,
      precision = 2,
      thousands = '.',
      decimals = ',',
      fallback = null
    ) => {
      if (isNaN(value) && fallback) {
        return fallback
      }
      return accounting.formatNumber(value || 0, precision, thousands, decimals)
    },
    // format seconds or milliseconds to durations HH:mm:ss
    duration: (value, unit = 's') => {
      if (unit === 'ms') {
        value = value / 1000
      }
      return value
        ? format(addSeconds(new Date('2000-01-01 00:00'), value), 'HH:mm:ss')
        : '00:00:00'
    },
    truncate: (value = '', length = -1) => {
      if (!value || typeof value !== 'string' || value.length <= 0) {
        return ''
      }
      if (length <= 0) {
        return value
      }
      let output = value.substring(0, length)
      if (output.length < value.length) {
        output += '…'
      }
      return output
    },
    list: (value, glue = ', ', truncate = 0) => {
      if (!Array.isArray(value) || !value.length) {
        return ''
      }
      if (truncate > 0) {
        value = value.map(item => {
          return app.$filters.truncate(item, truncate)
        })
      }
      return value.join(glue)
    },
    listByKey: (values, key, glue, truncate) => {
      return app.$filters.list(values.map(item => item[key]), glue, truncate)
    },
    camelCase: (value = '') => {
      return value
        .replace(/(?:^\w|[A-Za-z]|\b\w)/g, (letter, index) => {
          return index === 0 ? letter.toUpperCase() : letter.toLowerCase()
        })
        .replace(/\s+/g, '')
    }
  })

  // add all methods as filters on each vue component
  Object.keys(app.$filters).forEach(key => {
    Vue.filter(key, app.$filters[key])
  })

  Vue.prototype.$filters = app.$filters

  return app
}
