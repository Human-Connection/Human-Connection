import find from 'lodash/find'
import locales from '../../webapp/locales'

export default {
  getLangByName(name) {
    return find(locales, { name })
  }
}
