import { debounce } from 'lodash'
import { checkSlugAvailableQuery } from '~/graphql/User.js'

export default function UniqueSlugForm({ translate, apollo, currentUser }) {
  return {
    formSchema: {
      slug: [
        {
          asyncValidator(rule, value, callback) {
            debounce(() => {
              const variables = { slug: value }
              apollo.query({ query: checkSlugAvailableQuery, variables }).then(response => {
                const {
                  data: { User },
                } = response
                const existingSlug = User && User[0] && User[0].slug
                const available = !existingSlug || existingSlug === currentUser.slug
                if (!available) {
                  callback(new Error(translate('settings.validation.slug.alreadyTaken')))
                } else {
                  callback()
                }
              })
            }, 500)()
          },
        },
      ],
    },
  }
}
