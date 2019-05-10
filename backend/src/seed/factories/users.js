import faker from 'faker'
import uuid from 'uuid/v4'

export default function create (params) {
  const {
    id = uuid(),
    actorId,
    name = faker.name.findName(),
    slug = '',
    email = faker.internet.email(),
    password = '1234',
    role = 'user',
    avatar = faker.internet.avatar(),
    about = faker.lorem.paragraph()
  } = params

  return {
    mutation: `
      mutation(
        $id: ID!
        $actorId: String
        $name: String
        $slug: String
        $password: String!
        $email: String!
        $avatar: String
        $about: String
        $role: UserGroupEnum
      ) {
        CreateUser(
          id: $id
          actorId: $actorId
          name: $name
          slug: $slug
          password: $password
          email: $email
          avatar: $avatar
          about: $about
          role: $role
        ) {
          id
          actorId
          name
          slug
          email
          avatar
          role
          deleted
          disabled
        }
      }
    `,
    variables: { id, name, slug, password, email, avatar, about, role, actorId }
  }
}
