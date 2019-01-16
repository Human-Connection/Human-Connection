
import find from 'lodash/find'

const helpers = {
  locales: require('../../locales'),
  getLangByName: name => {
    return find(helpers.locales, { name })
  }
}

export default helpers
