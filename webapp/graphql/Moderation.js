import gql from 'graphql-tag'

export const reportListQuery = () => {
  return gql`
    query {
      Report(first: 20, orderBy: createdAt_desc) {
        id
        createdAt
        reasonCategory
        description
        type
        submitter {
          id
          slug
          name
          disabled
          deleted
        }
        user {
          id
          slug
          name
          disabled
          deleted
          disabledBy {
            id
            slug
            name
            disabled
            deleted
          }
        }
        comment {
          id
          contentExcerpt
          author {
            id
            slug
            name
            disabled
            deleted
          }
          post {
            id
            slug
            title
            disabled
            deleted
          }
          disabledBy {
            id
            slug
            name
            disabled
            deleted
          }
        }
        post {
          id
          slug
          title
          disabled
          deleted
          author {
            id
            slug
            name
            disabled
            deleted
          }
          disabledBy {
            id
            slug
            name
            disabled
            deleted
          }
        }
      }
    }
  `
}

export const reportMutation = () => {
  return gql`
    mutation($id: ID!, $reasonCategory: String!, $description: String!) {
      report(id: $id, reasonCategory: $reasonCategory, description: $description) {
        id
      }
    }
  `
}
