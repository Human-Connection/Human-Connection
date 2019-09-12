import gql from 'graphql-tag'
export const SignupVerificationMutation = gql`
  mutation(
    $nonce: String!
    $name: String!
    $email: String!
    $password: String!
    $about: String
    $termsAndConditionsAgreedVersion: String!
  ) {
    SignupVerification(
      nonce: $nonce
      email: $email
      name: $name
      password: $password
      about: $about
      termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
    ) {
      id
      name
      slug
    }
  }
`
