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
    isVerified = true
  } = params

  return {
    mutation: `
      mutation(
        $id: ID!
        $name: String
        $slug: String
        $password: String!
        $email: String!
        $avatar: String
        $about: String
        $role: UserGroup
        $isVerified: Boolean
      ) {
        CreateUser(
          id: $id
          name: $name
          slug: $slug
          password: $password
          email: $email
          avatar: $avatar
          about: $about
          role: $role
          isVerified: $isVerified
        ) {
          id
          name
          slug
          email
          avatar
          role
          deleted
          disabled
          isVerified
        }
      }
    `,
    variables: { id, name, slug, password, email, avatar, about, role, isVerified },
  }
}
