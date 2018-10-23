import gql from 'graphql-tag'

export default gql(`
  query User($slug: String!) {
    User(slug: $slug) {
      id
      name
      avatar
      friendsCount
      friends {
        id
        name
        slug
        avatar
      }
      badges {
        id
        key
        icon
      }
      badgesCount
      shoutedCount
      commentsCount
      followingCount
      following(first: 7) {
        id
        name
        slug
        avatar
        followedByCount
        contributionsCount
        commentsCount
        badges {
          id
          key
          icon
        }
      }
      followedByCount
      followedBy(first: 7)  {
        id
        name
        slug
        avatar
        followedByCount
        contributionsCount
        commentsCount
        badges {
          id
          key
          icon
        }
      }
      contributionsCount
      contributions(first: 6) {
        id
        slug
        title
        contentExcerpt
        shoutedCount
        commentsCount
        image
        createdAt
        author {
          User {
            id
            avatar
            name
          }
        }
      }
    }
  }
`)
