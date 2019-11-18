import gql from 'graphql-tag'

export const userFragment = lang => gql`
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
`

export const postCountsFragment = gql`
  fragment postCounts on Post {
    commentsCount
    shoutedCount
    shoutedByCurrentUser
    emotionsCount
  }
`
export const postFragment = lang => gql`
  ${userFragment(lang)}

  fragment post on Post {
    id
    title
    content
    contentExcerpt
    createdAt
    updatedAt
    disabled
    deleted
    slug
    image
    language
    author {
      ...user
    }
    tags {
      id
    }
    categories {
      id
      slug
      name
      icon
    }
    pinnedBy {
      id
      name
      role
    }
    pinnedAt
  }
`
export const commentFragment = lang => gql`
  ${userFragment(lang)}

  fragment comment on Comment {
    id
    createdAt
    updatedAt
    disabled
    deleted
    content
    contentExcerpt
    author {
      ...user
    }
  }
`
