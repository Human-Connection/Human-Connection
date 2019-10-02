import gql from 'graphql-tag'

export const AddEmailAddressMutation = gql`
  mutation($email: String!) {
    AddEmailAddress(email: $email) {
      email
      createdAt
    }
  }
`

export const VerifyEmailAddressMutation = gql`
  mutation($email: String!, $nonce: String!) {
    VerifyEmailAddress(email: $email, nonce: $nonce) {
      email
      verifiedAt
      createdAt
    }
  }
`
