import cheerio from 'cheerio'
const ID_REGEX = /\/profile\/([\w\-.!~*'"(),]+)/g

export default function (content) {
  if (!content) return []
  const $ = cheerio.load(content)
  const urls = $('.mention').map((_, el) => {
    return $(el).attr('href')
  }).get()
  const ids = []
  urls.forEach((url) => {
    let match
    while ((match = ID_REGEX.exec(url)) != null) {
      ids.push(match[1])
    }
  })
  return ids
}
