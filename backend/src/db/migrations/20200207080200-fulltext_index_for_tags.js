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
    // eslint-disable-next-line no-console
    console.log(error)
    await transaction.rollback()
    // eslint-disable-next-line no-console
    console.log('rolled back')
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
  } finally {
    session.close()
  }
}
