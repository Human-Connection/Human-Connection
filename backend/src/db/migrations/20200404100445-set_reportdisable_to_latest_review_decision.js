import { getDriver } from '../../db/neo4j'

export const description = ''

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()

  try {
    const { records } = await transaction.run(`
      MATCH (report:Report)
      WHERE NOT exists(report.disable)
      AND report.closed = TRUE
      RETURN report.id as reportId;
    `)
    const reportIds = await records.map((record) => record.get('reportId'))
    const updatedReports = await Promise.all(
      reportIds
        .map((reportId) => {
          return async () => {
            const updatedReportsTransactionPromise = await transaction.run(
              `MATCH (report:Report {id: $reportId})<-[reviews:REVIEWED]-(:User)
             WITH report, reviews, reviews.updatedAt as sortedReviews
             ORDER BY sortedReviews DESC LIMIT 1
             SET report.disable = reviews.disable
             RETURN report {.*}, reviews {.*}
            `,
              { reportId },
            )
            const [updatedReport] = updatedReportsTransactionPromise.records.map((record) => ({
              report: record.get('report'),
              review: record.get('reviews'),
            }))
            return updatedReport
          }
        })
        .map((p) => p()),
    )
    // eslint-disable-next-line no-console
    console.log('updatedReports', updatedReports)
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
  throw new Error('Irreversible migration')
}
