import { createWriteStream } from 'fs'
import path from 'path'
import slug from 'slug'
import { v4 as uuid } from 'uuid'

const localFileUpload = async ({ createReadStream, uniqueFilename }) => {
  await new Promise((resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(`public${uniqueFilename}`))
      .on('finish', resolve)
      .on('error', reject),
  )
  return uniqueFilename
}

export default async function fileUpload(params, { file, url }, uploadCallback = localFileUpload) {
  const upload = params[file]
  if (upload) {
    const { createReadStream, filename } = await upload
    const { name, ext } = path.parse(filename)
    const uniqueFilename = `/uploads/${uuid()}-${slug(name)}${ext}`
    const location = await uploadCallback({ createReadStream, uniqueFilename })
    delete params[file]
    params[url] = location
  }

  return params
}
