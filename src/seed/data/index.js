import gql from 'graphql-tag'
import helper from '../seed-helpers'

const seed = {
  Badges: require('./badges.js').default,
  User: require('./users.js').default,
  UserBadges: require('./users-badges.js').default
};

let data = {}

export default async function (client) {
  // iterate through seeds
  await helper.asyncForEach(Object.keys(seed), async key => {
    const mutations = seed[key]
    try {
      const res = await client
        .mutate({
          mutation: gql(mutations(data))
        })
      data[key] = Object.assign(data[key] || {}, res.data)
    } catch (err) {
      console.error(err)
    }
  })
  console.log('Seeded Data', data)
}
