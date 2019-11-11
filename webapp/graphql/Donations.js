import gql from 'graphql-tag'

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
