import Vue from 'vue'
import format from 'date-fns/format'
import accounting from 'accounting'
import trunc from 'trunc-html'
import { getDateFnsLocale } from '~/locales'

export default ({ app = {} }) => {
  app.$filters = Object.assign(app.$filters || {}, {
    date: (value, fmt = 'dd. MMM yyyy') => {
      if (!value) return ''
      return format(new Date(value), fmt, {
        locale: getDateFnsLocale(app),
      })
    },
    dateTime: (value, fmt = 'dd. MMM yyyy HH:mm') => {
      if (!value) return ''
      return format(new Date(value), fmt, {
        locale: getDateFnsLocale(app),
      })
    },
    number: (value, precision = 2, thousands = '.', decimals = ',', fallback = null) => {
      if (isNaN(value) && fallback) {
        return fallback
      }
      return accounting.formatNumber(value || 0, precision, thousands, decimals)
    },
    truncate: (value = '', length = -1) => {
      if (!value || typeof value !== 'string' || value.length <= 0) {
        return ''
      }
      if (length <= 0) {
        return value
      }
      let output = trunc(value, length).html
      if (output.length < value.length) {
        output += ' …'
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
    },
    removeLinks: content => {
      if (!content) return ''
      // remove all links from excerpt to prevent issues with the surrounding link
      let excerpt = content.replace(/<a.*>(.+)<\/a>/gim, '$1')
      // do not display content that is only linebreaks
      if (excerpt.replace(/<br>/gim, '').trim() === '') {
        excerpt = ''
      }

      return excerpt
    },
    removeHtml: (content, replaceLinebreaks = true) => {
      if (!content) return ''
      let contentExcerpt = content
      if (replaceLinebreaks) {
        // replace linebreaks with spaces first
        contentExcerpt = contentExcerpt.replace(/<br>/gim, ' ').trim()
      }
      // remove the rest of the HTML
      contentExcerpt = contentExcerpt.replace(/<(?:.|\n)*?>/gm, '').trim()

      return contentExcerpt
    },
    proxyApiUrl: url => {
      if (!url) return url
      return url.startsWith('/') ? url.replace('/', '/api/') : url
    },
  })

  // add all methods as filters on each vue component
  Object.keys(app.$filters).forEach(key => {
    Vue.filter(key, app.$filters[key])
  })

  Vue.prototype.$filters = app.$filters

  return app
}
