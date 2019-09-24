import gql from 'graphql-tag'

export const AddEmailAddressMutation = gql`
  mutation($email: String!) {
    AddEmailAddress(email: $email) {
      email
      createdAt
    }
  }
`
