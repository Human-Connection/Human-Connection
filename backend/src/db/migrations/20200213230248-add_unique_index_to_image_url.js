import { getDriver } from '../../db/neo4j'

export const description = `
  We introduced a new node label 'Image' and we need a primary key for it. Best
  would probably be the 'url' property which should be unique and would also
  prevent us from overwriting existing images.
`

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()

  try {
    // Implement your migration here.
    await transaction.run(`
      CREATE CONSTRAINT ON ( image:Image ) ASSERT image.url IS UNIQUE
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
    DROP CONSTRAINT ON ( image:Image ) ASSERT image.url IS UNIQUE
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
