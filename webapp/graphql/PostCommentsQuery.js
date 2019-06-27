import gql from 'graphql-tag'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql(`
    query Post($slug: String!) {
      Post(slug: $slug) {
        comments(orderBy: createdAt_asc) {
          id
          contentExcerpt
          createdAt
          disabled
          deleted
          author {
            id
            slug
            name
            avatar
            disabled
            deleted
            shoutedCount
            contributionsCount
            commentsCount
            followedByCount
            followedByCurrentUser
            location {
              name: name${lang}
            }
            badges {
              id
              key
              icon
            }
          }
        }
      }
    }
  `)
}
