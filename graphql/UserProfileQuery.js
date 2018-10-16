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
      badgesCount
      shoutedCount
      commentsCount
      followingCount
      following {
        id
        name
        slug
        avatar
        followedByCount
        contributionsCount
        commentsCount
      }
      followedByCount
      contributionsCount
      contributions {
        Post {
          id
          slug
          title
          contentExcerpt
          shoutedCount
          commentsCount
          image
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
  }
`)
