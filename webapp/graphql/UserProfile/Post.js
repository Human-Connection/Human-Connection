import gql from 'graphql-tag'

export default (i18n) => {
  const lang = i18n.locale().toUpperCase()
  return gql(`
    query Post($filter: _PostFilter, $first: Int, $offset: Int) {
      Post(filter: $filter, first: $first, offset: $offset, orderBy: createdAt_desc) {
        id
        slug
        title
        contentExcerpt
        shoutedCount
        commentsCount
        deleted
        image
        createdAt
        disabled
        deleted
        categories {
          id
          name
          icon
        }
        author {
          id
          slug
          avatar
          name
          disabled
          deleted
          location {
            name: name${lang}
          }
        }
      }
    }
  `)
}
