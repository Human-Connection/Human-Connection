import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    read = false
  } = params

  return {
    mutation: `
      mutation($id: ID, $read: Boolean) {
        CreateNotification(id: $id, read: $read) {
          id
          read
        }
      }
    `,
    variables: { id, read }
  }
}
