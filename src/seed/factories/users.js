import faker from 'faker'

export default function create (params) {
  const {
    id = `u${faker.random.number()}`,
    name = faker.name.findName(),
    email = faker.internet.email(),
    password = '1234',
    role = 'user',
    avatar = faker.internet.avatar(),
    badgeIds = [],
    blacklistedUserIds = [],
    followedUserIds = [],
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

  const followedUserRelations = followedUserIds.map((followedUserId) => {
    return `
      ${id}_follow_${followedUserId}: AddUserFollowing(
        from: { id: "${id}" },
        to: { id: "${followedUserId}" }
      ) { from { id } }
      `
  });

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
    ${followedUserRelations.join('\n')}
    }
  `
}

export function relate(type, params) {
  switch(type){
    case 'friends':
      const { from, to } = params
      return `
        mutation {
          ${from}_friends_${to}: AddUserFriends(
            from: { id: "${from}" },
            to: { id: "${to}" }
          ) { from { id } }
        }
      `
  }
}
