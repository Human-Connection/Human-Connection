import faker from 'faker'

export default function create (params) {
  const {
    id = `u${faker.random.number()}`,
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
      ${id}: CreateUser(
        id: "${id}",
        name: "${name}",
        password: "${password}",
        email: "${email}",
        avatar: "${avatar}",
        role: ${role},
        disabled: ${disabled},
        deleted: ${deleted}) {
        id
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
