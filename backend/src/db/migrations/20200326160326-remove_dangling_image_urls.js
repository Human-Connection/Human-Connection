import { getDriver } from '../../db/neo4j'
import { existsSync } from 'fs'

export const description = `
  In this review:
  https://github.com/Human-Connection/Human-Connection/pull/3262#discussion_r398634249
  I brought up that we may have image nodes with danling urls (urls that don't
  point to local file on disk). I would prefer to remove those urls to avoid
  unnecessary 404 errors.
`

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()

  try {
    // Implement your migration here.
    const { records } = await transaction.run(`
      MATCH(image:Image)
      WHERE image.url STARTS WITH '/'
      RETURN image.url as url
    `)
    const urls = records.map((record) => record.get('url'))
    const danglingUrls = urls.filter((url) => {
      const fileLocation = `public${url}`
      return !existsSync(fileLocation)
    })
    await transaction.run(
      `
      MATCH(image:Image)
      WHERE image.url IN $danglingUrls
      DETACH DELETE image
    `,
      { danglingUrls },
    )
    await transaction.commit()
    if (danglingUrls.length) {
      // eslint-disable-next-line no-console
      console.log(`
      Removed ${danglingUrls.length} dangling urls.\n
      ===============================================
      ${danglingUrls.join('\n')}
    `)
    }
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

export async function down() {
  throw new Error('Irreversible migration')
}
