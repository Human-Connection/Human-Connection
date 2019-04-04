import faker from 'faker'
import uuid from 'uuid/v4'

export default function create(params) {
  const {
    id = uuid(),
    name = faker.name.findName(),
    slug = '',
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
        slug: "${slug}",
        password: "${password}",
        email: "${email}",
        avatar: "${avatar}",
        about: "${about}",
        role: ${role},
        disabled: ${disabled},
        deleted: ${deleted}
      ) {
        id
        name
        slug
        email
        avatar
        role
        deleted
        disabled
      }
    }
  `
}
