import faker from 'faker'

export default function (params) {
  const {
    id = `cat${faker.random.number()}`,
    key,
    type = 'crowdfunding',
    status = 'permanent',
    icon
  } = params

  return `
    mutation {
      ${id}: CreateBadge(
      id: "${id}",
      key: "${key}",
      type: ${type},
      status: ${status},
      icon: "${icon}") { id }
    }
  `
}
