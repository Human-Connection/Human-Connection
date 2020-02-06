import gql from 'graphql-tag'
import { userFragment, postFragment, commentFragment } from '../Fragments'

export default gql`
  ${userFragment}
  ${postFragment}
  ${commentFragment}
  query {
    filedReports {
      reasonDescription
      reasonCategory
      resource {
        __typename
        ... on Post {
          ...post
        }
        ... on Comment {
          ...comment
        }
        ... on User {
          ...user
        }
      }
    }
  }
`
