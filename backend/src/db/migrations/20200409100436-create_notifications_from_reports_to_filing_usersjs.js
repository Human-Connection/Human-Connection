import { getDriver } from '../../db/neo4j'

export const description =
  'Create notifications for all old filed reports to all of their submitters.'

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()
  const updateDeletedUserAttributes = await transaction.run(`
    MATCH (submitter:User)-[filed:FILED]->(report:Report)
    WHERE NOT (submitter)<-[:NOTIFIED]-(report)
    CREATE (submitter)<-[notification:NOTIFIED]-(report)
    SET notification.createdAt = filed.createdAt,
      notification.updatedAt = notification.createdAt,
      notification.read = FALSE,
      notification.reason = 'filed_report_on_resource'
    RETURN notification {.*};
  `)

  try {
    // Implement your migration here.
    const notifications = await updateDeletedUserAttributes.records.map((record) =>
      record.get('notification'),
    )
    // eslint-disable-next-line no-console
    console.log(notifications)
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
