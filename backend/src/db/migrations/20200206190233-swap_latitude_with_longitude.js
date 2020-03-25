import { getDriver } from '../../db/neo4j'

export const description = `
This migration swaps the value stored in Location.lat with the value
of Location.lng. This is necessary as the values of lat and lng were
stored incorrectly. For example Hamburg, Germany, was stored with the
values lat=10.0 and lng=53.55, which is close to the horn of Africa,
but it is lat=53.55 and lng=10.0
`

const swap = async function (next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()
  try {
    // Implement your migration here.
    await transaction.run(`
        MATCH (l:Location) WHERE NOT(l.lat IS NULL)
        WITH l.lng AS longitude, l.lat AS latitude, l AS location
        SET location.lat = longitude, location.lng = latitude
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

export async function up(next) {
  swap(next)
}

export async function down(next) {
  swap(next)
}
