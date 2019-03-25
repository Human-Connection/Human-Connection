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
    about = faker.lorem.paragraph(),
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
        about: "${about}",
        role: ${role},
        disabled: ${disabled},
        deleted: ${deleted},
        socialMedia: []
      ) {
        id
        name
        email
        avatar
        role
        deleted
        disabled
        socialMedia
      }
    }
  `
}
