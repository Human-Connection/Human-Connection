import { getDriver } from '../../db/neo4j'

export const description =
  'This migration adds a fulltext index for the tags in order to search for Hasthags.'

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()

  try {
    await transaction.run(`
      CALL db.index.fulltext.createNodeIndex("tag_fulltext_search",["Tag"],["id"])
    `)
    await transaction.commit()
    next()
  } catch (error) {
    const { message } = error
    if (message.includes('There already exists an index')) {
      // all fine
      // eslint-disable-next-line no-console
      console.log(message)
      next()
    } else {
      await transaction.rollback()
      // eslint-disable-next-line no-console
      console.log('rolled back')
      throw new Error(error)
    }
  } finally {
    session.close()
  }
}

export async function down(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()

  try {
    // Implement your migration here.
    await transaction.run(`
      CALL db.index.fulltext.drop("tag_fulltext_search")
    `)
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
