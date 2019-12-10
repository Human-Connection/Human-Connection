import { getDriver, getNeode } from '../../bootstrap/neo4j'
import createBadge from './badges.js'
import createUser from './users.js'
import createPost from './posts.js'
import createComment from './comments.js'
import createCategory from './categories.js'
import createTag from './tags.js'
import createSocialMedia from './socialMedia.js'
import createLocation from './locations.js'
import createEmailAddress from './emailAddresses.js'
import createDonations from './donations.js'
import createUnverifiedEmailAddresss from './unverifiedEmailAddresses.js'
import createReport from './reports.js'

const factories = {
  Badge: createBadge,
  User: createUser,
  Post: createPost,
  Comment: createComment,
  Category: createCategory,
  Tag: createTag,
  SocialMedia: createSocialMedia,
  Location: createLocation,
  EmailAddress: createEmailAddress,
  UnverifiedEmailAddress: createUnverifiedEmailAddresss,
  Donations: createDonations,
  Report: createReport,
}

export const cleanDatabase = async (options = {}) => {
  const { driver = getDriver() } = options
  const cypher = 'MATCH (n) DETACH DELETE n'
  const session = driver.session()
  try {
    return await session.run(cypher)
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
