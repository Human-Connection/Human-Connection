import faker from 'faker'

export default function (params) {
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
      CreateUser(
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
