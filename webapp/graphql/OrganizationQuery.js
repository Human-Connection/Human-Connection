import gql from 'graphql-tag'

import { userFragment, organizationFragment } from './Fragments'

export default (i18n) => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment}
    ${organizationFragment(lang)}

    query Organization($id: ID!, $lang: String) {
      Organization(id: $id, lang: $lang) {
        ...organization
      }
    }
  `
}
