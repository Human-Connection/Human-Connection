import { getDriver } from '../../db/neo4j'
import { createReadStream } from 'fs'
import path from 'path'
import { S3 } from 'aws-sdk'
import { s3Configs } from '../../config'

export const description = `
Upload all image files to a S3 compatible object storage in order to reduce
load on our backend.
`

export async function up(next) {
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()

  const {
    AWS_ACCESS_KEY_ID: accessKeyId,
    AWS_SECRET_ACCESS_KEY: secretAccessKey,
    AWS_ENDPOINT: endpoint,
    AWS_REGION: region,
    AWS_BUCKET: Bucket,
  } = s3Configs

  if (!(accessKeyId || secretAccessKey)) {
    // eslint-disable-next-line no-console
    console.log('No S3 given, cannot upload image files')
    return
  }

  const s3 = new S3({ region, endpoint })

  try {
    // Implement your migration here.
    const { records } = await transaction.run('MATCH (image:Image) RETURN image.url as url')
    let urls = records.map(r => r.get('url'))
    urls = urls.filter(url => url.startsWith('/uploads'))
    const locations = await Promise.all(
      urls
        .map(url => {
          return async () => {
            const { pathname } = new URL(url, 'http://example.org')
            const fileLocation = path.join(__dirname, `../../../public/${pathname}`)
            const s3Location = `/original/${pathname}`

            const params = {
              Bucket,
              Key: s3Location,
              ACL: 'public-read',
              // TODO: check the actual mime type
              ContentType: 'image/jpg',
              Body: createReadStream(fileLocation),
            }
            const data = await s3.upload(params).promise()
            const { Location } = data
            return Location
          }
        })
        .map(p => p()),
    )
    // TODO: update the urls in the database
    // eslint-disable-next-line no-console
    console.log(locations)
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
  const driver = getDriver()
  const session = driver.session()
  const transaction = session.beginTransaction()

  try {
    // Implement your migration here.
    await transaction.run(``)
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
