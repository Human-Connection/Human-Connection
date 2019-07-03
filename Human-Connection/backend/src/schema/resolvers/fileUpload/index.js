import { createWriteStream } from 'fs'
import path from 'path'
import slug from 'slug'

const storeUpload = ({ createReadStream, fileLocation }) =>
  new Promise((resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(`public${fileLocation}`))
      .on('finish', resolve)
      .on('error', reject),
  )

export default async function fileUpload(params, { file, url }, uploadCallback = storeUpload) {
  const upload = params[file]
  if (upload) {
    const { createReadStream, filename } = await upload
    const { name } = path.parse(filename)
    const fileLocation = `/uploads/${Date.now()}-${slug(name)}`
    await uploadCallback({ createReadStream, fileLocation })
    delete params[file]

    params[url] = fileLocation
  }

  return params
}
