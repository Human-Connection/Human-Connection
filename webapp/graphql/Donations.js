import gql from 'graphql-tag'

export const DonationsQuery = () => gql`
  query {
    Donations {
      goal
      progress
    }
  }
`

export const UpdateDonations = () => {
  return gql`
    mutation($goal: Int, $progress: Int) {
      UpdateDonations(goal: $goal, progress: $progress) {
        id
        goal
        progress
        updatedAt
      }
    }
  `
}
