import { s3Configs } from '../../../config'
import { createWriteStream } from 'fs'
import path from 'path'
import slug from 'slug'
import { S3 } from 'aws-sdk'

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_ENDPOINT: endpoint,
  AWS_REGION: region,
  AWS_BUCKET: Bucket,
} = s3Configs

const localFileUpload = async ({ createReadStream, fileLocation }) => {
  await new Promise((resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(`public${fileLocation}`))
      .on('finish', resolve)
      .on('error', reject),
  )
  return fileLocation
}

const s3Upload = async ({ createReadStream, fileLocation, mimetype }) => {
  const s3 = new S3({ region, endpoint })
  const params = {
    Bucket,
    Key: fileLocation,
    ACL: 'public-read',
    ContentType: mimetype,
    Body: createReadStream(),
  }
  const data = await s3.upload(params).promise()
  const { Location } = data
  return Location
}

export default async function fileUpload(params, { file, url }, uploadCallback) {
  if (!uploadCallback) {
    uploadCallback = AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ? s3Upload : localFileUpload
  }
  const upload = params[file]
  if (upload) {
    const { createReadStream, filename, mimetype } = await upload
    const { name } = path.parse(filename)
    const fileLocation = `/uploads/${Date.now()}-${slug(name)}`
    const location = await uploadCallback({ createReadStream, fileLocation, mimetype })
    delete params[file]
    params[url] = location
  }

  return params
}
