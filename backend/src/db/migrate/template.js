import { getDriver } from '../../db/neo4j'

export const description = ''

export function up(next) {
  const driver = getDriver()
  const session = driver.session()
  try {
    // Implement your migration here.
    next()
  } catch (err) {
    next(err)
  } finally {
    session.close()
    driver.close()
  }
}

export function down(next) {
  const driver = getDriver()
  const session = driver.session()
  try {
    // Rollback your migration here.
    next()
  } catch (err) {
    next(err)
  } finally {
    session.close()
    driver.close()
  }
}
