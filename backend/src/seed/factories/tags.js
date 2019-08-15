import uuid from 'uuid/v4'

export default function(params) {
  const { id = uuid(), name = '#human-connection' } = params

  return {
    mutation: `
      mutation($id: ID!) {
        CreateTag(id: $id) {
          id
        }
      }
    `,
    variables: { id, name },
  }
}
