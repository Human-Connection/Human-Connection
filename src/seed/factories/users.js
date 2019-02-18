import faker from 'faker'

export default function (params) {
  const {
    id = `u${faker.random.number()}`,
    name = faker.name.findName(),
    email = faker.internet.email(),
    password = '1234',
    role = 'user',
    avatar = faker.internet.avatar(),
    badgeIds = [],
    blacklistedUserIds = [],
    disabled = false,
    deleted = false
  } = params

  const badgeRelations = badgeIds.map((badgeId) => {
    return `
    ${id}_${badgeId}: AddUserBadges(
      from: {id: "${badgeId}"},
      to:   {id: "${id}"}
    ) { from { id } }
    `
  })

  const blacklistedUserRelations = blacklistedUserIds.map((blacklistedUserId) => {
    return `
      ${id}_blacklist_${blacklistedUserId}: AddUserBlacklisted(
        from: { id: "${id}" },
        to:   { id: "${blacklistedUserId}" }
      ) { from { id } }
      `
  })

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
    ${badgeRelations.join('\n')}
    ${blacklistedUserRelations.join('\n')}
    }
  `
}
