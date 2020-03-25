import { getDriver } from '../../db/neo4j'

export const description =
  'We should not maintain obsolete attributes for users who have been deleted.'

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()
  const updateDeletedUserAttributes = await transaction.run(`
    MATCH (user:User)
    WHERE user.deleted = TRUE
    SET user.createdAt = 'UNAVAILABLE'
    SET user.updatedAt = 'UNAVAILABLE'
    SET user.lastActiveAt = 'UNAVAILABLE'
    SET user.termsAndConditionsAgreedVersion = 'UNAVAILABLE'
    SET user.avatar = null
    SET user.coverImg = null
    RETURN user {.*};
  `)
  try {
    // Implement your migration here.
    const users = await updateDeletedUserAttributes.records.map((record) => record.get('user'))
    // eslint-disable-next-line no-console
    console.log(users)
    await transaction.commit()
    next()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
    await transaction.rollback()
    // eslint-disable-next-line no-console
    console.log('rolled back')
    throw new Error(error)
  } finally {
    session.close()
  }
}

export async function down(next) {
  // eslint-disable-next-line no-console
  console.log('Irreversible migration')
  next()
}
