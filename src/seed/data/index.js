import gql from 'graphql-tag'
import asyncForEach from '../../helpers/asyncForEach'

const seed = {
  Badge: require('./badges.js').default,
  Category: require('./categories.js').default,
  Tags: require('./tags.js').default,

  User: require('./users.js').default,
  UserBadges: require('./users-badges.js').default,
  UserBlacklist: require('./users-blacklist.js').default,
  UserFollows: require('./users-follows.js').default,
  UserFriends: require('./users-friends.js').default,

  Organization: require('./organizations.js').default,
  Post: require('./posts.js').default,
  Comment: require('./comments.js').default,
  UserShouts: require('./users-shouts.js').default
}

let data = {}

export default async function (client) {
  // iterate through seeds
  await asyncForEach(Object.keys(seed), async key => {
    const mutations = seed[key]
    try {
      const res = await client
        .mutate({
          mutation: gql(mutations(data))
        })
      data[key] = Object.assign(data[key] || {}, res.data)
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.error(err)
      process.exit(1)
    }
  })
  /* eslint-disable-next-line no-console */
  console.log('Seeded Data...')
}
