import Vue from 'vue'

import format from 'date-fns/format'
import addSeconds from 'date-fns/add_seconds'

export default ({ app }) => {
  app.$filters = Object.assign(app.$filters || {}, {
    date: (value, fmt = 'DD. MMM YYYY') => {
      if (!value) return ''
      return format(new Date(value), fmt)
    },
    dateTime: (value, fmt = 'DD. MMM YYYY HH:mm') => {
      if (!value) return ''
      return format(new Date(value), fmt)
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
    listByKey(values, key, glue, truncate) {
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
