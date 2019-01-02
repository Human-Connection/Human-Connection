import faker from 'faker'

export default function (params){
  const {
    name = faker.name.findName(),
    email = faker.internet.email(),
    password =  '1234',
    avatar = faker.internet.avatar()
  } = params

  return `
    mutation {
      u1: CreateUser(
        id: "u1",
        name: "${name}",
        password: "${password}",
        email: "${email}",
        avatar: "${avatar}",
        role: admin,
        disabled: false,
        deleted: false) {
        id
        name
        email
        avatar
        role
      }
    }
  `
}
