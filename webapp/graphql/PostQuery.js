import gql from 'graphql-tag'
import {
  userFragment,
  postFragment,
  commentFragment,
  postCountsFragment,
  userCountsFragment,
  locationAndBadgesFragment,
  tagsCategoriesAndPinnedFragment,
} from './Fragments'

export default (i18n) => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment}
    ${userCountsFragment}
    ${locationAndBadgesFragment(lang)}
    ${postFragment}
    ${postCountsFragment}
    ${tagsCategoriesAndPinnedFragment}
    ${commentFragment}

    query Post($id: ID!) {
      Post(id: $id) {
        ...post
        ...postCounts
        ...tagsCategoriesAndPinned
        author {
          ...user
          ...userCounts
          ...locationAndBadges
          blocked
        }
        comments(orderBy: createdAt_asc) {
          ...comment
          author {
            ...user
            ...userCounts
            ...locationAndBadges
          }
        }
      }
    }
  `
}

export const filterPosts = (i18n) => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment}
    ${userCountsFragment}
    ${locationAndBadgesFragment(lang)}
    ${postFragment}
    ${postCountsFragment}
    ${tagsCategoriesAndPinnedFragment}

    query Post($filter: _PostFilter, $first: Int, $offset: Int, $orderBy: [_PostOrdering]) {
      Post(filter: $filter, first: $first, offset: $offset, orderBy: $orderBy) {
        ...post
        ...postCounts
        ...tagsCategoriesAndPinned
        author {
          ...user
          ...userCounts
          ...locationAndBadges
        }
      }
    }
  `
}

export const profilePagePosts = (i18n) => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment}
    ${userCountsFragment}
    ${locationAndBadgesFragment(lang)}
    ${postFragment}
    ${postCountsFragment}
    ${tagsCategoriesAndPinnedFragment}

    query profilePagePosts(
      $filter: _PostFilter
      $first: Int
      $offset: Int
      $orderBy: [_PostOrdering]
    ) {
      profilePagePosts(filter: $filter, first: $first, offset: $offset, orderBy: $orderBy) {
        ...post
        ...postCounts
        ...tagsCategoriesAndPinned
        author {
          ...user
          ...userCounts
          ...locationAndBadges
        }
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

export const relatedContributions = (i18n) => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment}
    ${userCountsFragment}
    ${locationAndBadgesFragment(lang)}
    ${postFragment}
    ${postCountsFragment}
    ${tagsCategoriesAndPinnedFragment}

    query Post($slug: String!) {
      Post(slug: $slug) {
        ...post
        ...postCounts
        ...tagsCategoriesAndPinned
        author {
          ...user
          ...userCounts
          ...locationAndBadges
        }
        relatedContributions(first: 2) {
          ...post
          ...postCounts
          ...tagsCategoriesAndPinned
          author {
            ...user
            ...userCounts
            ...locationAndBadges
          }
        }
      }
    }
  `
}
