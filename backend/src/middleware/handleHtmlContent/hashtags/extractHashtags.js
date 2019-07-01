import cheerio from 'cheerio'
const ID_REGEX = /\/search\/hashtag\/([\w\-.!~*'"(),]+)/g

export default function (content) {
  if (!content) return []
  const $ = cheerio.load(content)
  // We can not search for class '.hashtag', because the classes are removed at the 'xss' middleware.
  //   But we have to know, which Hashtags are removed from the content es well, so we search for the 'a' html-tag.
  const urls = $('a')
    .map((_, el) => {
      return $(el).attr('href')
    })
    .get()
  const hashtags = []
  urls.forEach(url => {
    let match
    while ((match = ID_REGEX.exec(url)) != null) {
      hashtags.push(match[1])
    }
  })
  return hashtags
}