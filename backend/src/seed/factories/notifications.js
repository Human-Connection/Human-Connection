import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    read = false
  } = params

  return `
    mutation {
      CreateNotification(
        id: "${id}",
        read: ${read},
      ) { id, read }
    }
  `
}
