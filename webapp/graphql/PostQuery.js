import gql from 'graphql-tag'
import { postFragment, commentFragment, postCountsFragment } from './Fragments'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${postFragment(lang)}
    ${postCountsFragment}
    ${commentFragment(lang)}

    query Post($id: ID!) {
      Post(id: $id) {
        ...post
        ...postCounts
        comments(orderBy: createdAt_asc) {
          ...comment
        }
      }
    }
  `
}

export const filterPosts = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${postFragment(lang)}
    ${postCountsFragment}

    query Post($filter: _PostFilter, $first: Int, $offset: Int, $orderBy: [_PostOrdering]) {
      Post(filter: $filter, first: $first, offset: $offset, orderBy: $orderBy) {
        ...post
        ...postCounts
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
    ${postFragment(lang)}
    ${postCountsFragment}

    query Post($slug: String!) {
      Post(slug: $slug) {
        ...post
        ...postCounts
        relatedContributions(first: 2) {
          ...post
          ...postCounts
        }
      }
    }
  `
}
