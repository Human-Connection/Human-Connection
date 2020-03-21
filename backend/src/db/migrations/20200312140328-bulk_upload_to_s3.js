import { getDriver } from '../../db/neo4j'
import { createReadStream } from 'fs'
import path from 'path'
import { S3 } from 'aws-sdk'
import mime from 'mime-types'
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
    AWS_ENDPOINT: endpoint,
    AWS_REGION: region,
    AWS_BUCKET: Bucket,
    S3_CONFIGURED,
  } = s3Configs

  if (!S3_CONFIGURED) {
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
            const s3Location = `original${pathname}`
            const mimeType = mime.lookup(fileLocation)

            const params = {
              Bucket,
              Key: s3Location,
              ACL: 'public-read',
              ContentType: mimeType,
              Body: createReadStream(fileLocation),
            }

            const data = await s3.upload(params).promise()
            const { Location: spacesUrl } = data

            const updatedRecord = await transaction.run(
              'MATCH (image:Image {url: $url}) SET image.url = $spacesUrl RETURN image.url as url',
              { url, spacesUrl },
            )
            const [updatedUrl] = updatedRecord.records.map(record => record.get('url'))
            // eslint-disable-next-line no-console
            // https://image-upload.fra1.digitaloceanspaces.com/original/uploads/05b6cb85-deec-45f2-8e34-44111dceb743-avatar.png
            return updatedUrl
          }
        })
        .map(p => p()),
    )
    // eslint-disable-next-line no-console
    console.log('this is locations', locations)
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
