import faker from 'faker'
import uuid from 'uuid/v4'

export default function create (params) {
  const {
    id = uuid(),
    name = faker.name.findName(),
    email = faker.internet.email(),
    password = '1234',
    role = 'user',
    avatar = faker.internet.avatar(),
    disabled = false,
    deleted = false
  } = params

  return `
    mutation {
      CreateUser(
        id: "${id}",
        name: "${name}",
        password: "${password}",
        email: "${email}",
        avatar: "${avatar}",
        role: ${role},
        disabled: ${disabled},
        deleted: ${deleted}
      ) {
        name
        email
        avatar
        role
      }
    }
  `
}

export function relate (type, params) {
  const { from, to } = params
  return `
    mutation {
      ${from}_${type}_${to}: AddUser${type}(
        from: { id: "${from}" },
        to: { id: "${to}" }
      ) { from { id } }
    }
  `
}
