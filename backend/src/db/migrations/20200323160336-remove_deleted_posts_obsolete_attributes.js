import { getDriver } from '../../db/neo4j'

export const description =
  'We should not maintain obsolete attributes for posts which have been deleted.'

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()
  const updateDeletedPostsAttributes = await transaction.run(`
    MATCH (post:Post)
    WHERE post.deleted = TRUE
    SET post.language = 'UNAVAILABLE'
    SET post.createdAt = 'UNAVAILABLE'
    SET post.updatedAt = 'UNAVAILABLE'
    SET post.content = 'UNAVAILABLE'
    SET post.title = 'UNAVAILABLE'
    SET post.visibility = 'UNAVAILABLE'
    SET post.contentExcerpt = 'UNAVAILABLE'
    SET post.image = null
    RETURN post {.*};
  `)
  try {
    // Implement your migration here.
    const posts = await updateDeletedPostsAttributes.records.map((record) => record.get('post'))
    // eslint-disable-next-line no-console
    console.log(posts)
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
