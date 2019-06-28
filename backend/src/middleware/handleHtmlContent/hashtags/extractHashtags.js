import cheerio from 'cheerio'
const ID_REGEX = /\/search\/hashtag\/([\w\-.!~*'"(),]+)/g

export default function (content) {
  if (!content) return []
  const $ = cheerio.load(content)
  const urls = $('.hashtag')
    .map((_, el) => {
      return $(el).attr('href')
    })
    .get()
  const hashtags = []
  urls.forEach(url => {
    console.log('url: ', url)
    let match
    while ((match = ID_REGEX.exec(url)) != null) {
      hashtags.push(match[1])
    }
  })
  return hashtags
}