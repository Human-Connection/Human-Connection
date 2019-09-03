import gql from 'graphql-tag'

const fragments = lang => gql`
fragment user on User {
  id
  slug
  name
  avatar
  disabled
  deleted
  shoutedCount
  contributionsCount
  commentedCount
  followedByCount
  followedByCurrentUser
  location {
    name: name${lang}
  }
  badges {
    id
    icon
  }
}

fragment post on Post {
  id
  title
  content
  contentExcerpt
  createdAt
  disabled
  deleted
  slug
  image
  commentsCount
  shoutedCount
  shoutedByCurrentUser
  emotionsCount
  author {
    ...user
  }
  tags {
    id
  }
  categories {
    id
    name
    icon
  }
}
`

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${fragments(lang)}
    query Post($id: ID!) {
      Post(id: $id) {
        ...post
        comments(orderBy: createdAt_asc) {
          id
          contentExcerpt
          content
          createdAt
          disabled
          deleted
          author {
            ...user
          }
        }
      }
    }
  `
}

export const filterPosts = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${fragments(lang)}
    query Post($filter: _PostFilter, $first: Int, $offset: Int, $orderBy: [_PostOrdering]) {
      Post(filter: $filter, first: $first, offset: $offset, orderBy: $orderBy) {
        ...post
      }
    }
  `
}

export const PostsEmotionsByCurrentUser = () => {
  return gql`
    query PostsEmotionsByCurrentUser($postId: ID!) {
      PostsEmotionsByCurrentUser(postId: $postId)
    }
  `
}

export const relatedContributions = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${fragments(lang)}
    query Post($slug: String!) {
      Post(slug: $slug) {
        ...post
        relatedContributions(first: 2) {
          ...post
        }
      }
    }
  `
}
