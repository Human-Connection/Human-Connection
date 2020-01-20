import { getDriver, getNeode } from '../../bootstrap/neo4j'

const factories = {
  Badge: require('./badges.js').default,
  User: require('./users.js').default,
  Post: require('./posts.js').default,
  Comment: require('./comments.js').default,
  Category: require('./categories.js').default,
  Tag: require('./tags.js').default,
  SocialMedia: require('./socialMedia.js').default,
  Location: require('./locations.js').default,
  EmailAddress: require('./emailAddresses.js').default,
  UnverifiedEmailAddress: require('./unverifiedEmailAddresses.js').default,
  Donations: require('./donations.js').default,
  Report: require('./reports.js').default,
}

export const cleanDatabase = async (options = {}) => {
  const { driver = getDriver() } = options
  const session = driver.session()
  try {
    await session.writeTransaction(transaction => {
      return transaction.run(
        `
          MATCH (everything)
          DETACH DELETE everything
        `,
      )
    })
  } finally {
    session.close()
  }
}

export default function Factory(options = {}) {
  const { neo4jDriver = getDriver(), neodeInstance = getNeode() } = options

  const result = {
    neo4jDriver,
    factories,
    lastResponse: null,
    neodeInstance,
    async create(node, args = {}) {
      const { factory } = this.factories[node](args)
      this.lastResponse = await factory({
        args,
        neodeInstance,
        factoryInstance: this,
      })
      return this.lastResponse
    },

    async cleanDatabase() {
      this.lastResponse = await cleanDatabase({
        driver: this.neo4jDriver,
      })
      return this
    },
  }
  result.create.bind(result)
  result.cleanDatabase.bind(result)
  return result
}
