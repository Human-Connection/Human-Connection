import gql from 'graphql-tag'

const fragments = gql`
  fragment post on Post {
    id
    createdAt
    disabled
    deleted
    title
    contentExcerpt
    slug
    author {
      id
      slug
      name
      disabled
      deleted
      avatar
    }
  }

  fragment comment on Comment {
    id
    createdAt
    disabled
    deleted
    contentExcerpt
    author {
      id
      slug
      name
      disabled
      deleted
      avatar
    }
    post {
      id
      createdAt
      disabled
      deleted
      title
      contentExcerpt
      slug
      author {
        id
        slug
        name
        disabled
        deleted
        avatar
      }
    }
  }
`

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    query User($id: ID!) {
      User(id: $id) {
        id
        slug
        name
        avatar
        about
        disabled
        deleted
        locationName
        location {
          name: name${lang}
        }
        createdAt
        badges {
          id
          icon
        }
        badgesCount
        shoutedCount
        commentedCount
        contributionsCount
        followingCount
        following(first: 7) {
          id
          slug
          name
          avatar
          disabled
          deleted
          followedByCount
          followedByCurrentUser
          contributionsCount
          commentedCount
          badges {
            id
            icon
          }
          location {
            name: name${lang}
          }
        }
        followedByCount
        followedByCurrentUser
        isBlocked
        followedBy(first: 7)  {
          id
          slug
          name
          disabled
          deleted
          avatar
          followedByCount
          followedByCurrentUser
          contributionsCount
          commentedCount
          badges {
            id
            icon
          }
          location {
            name: name${lang}
          }
        }
        socialMedia {
          id
          url
        }
      }
    }
  `
}

export const notificationQuery = () => {
  return gql`
    ${fragments}
    query {
      notifications(read: false, orderBy: createdAt_desc) {
        read
        reason
        createdAt
        from {
          __typename
          ...post
          ...comment
        }
      }
    }
  `
}

export const markAsReadMutation = () => {
  return gql`
    ${fragments}
    mutation($id: ID!) {
      markAsRead(id: $id) {
        read
        reason
        createdAt
        from {
          __typename
          ...post
          ...comment
        }
      }
    }
  `
}
