import cheerio from 'cheerio'
// formats of a Hashtag:
//   https://en.wikipedia.org/w/index.php?title=Hashtag&oldid=905141980#Style
// here:
//    0. Search for whole string.
//    1. Hashtag has only 'a-z', 'A-Z', and '0-9'.
//    2. If it starts with a digit '0-9' than 'a-z', or 'A-Z' has to follow.
const ID_REGEX = /^\/search\/hashtag\/(([a-zA-Z]+[a-zA-Z0-9]*)|([0-9]+[a-zA-Z]+[a-zA-Z0-9]*))$/g

export default function(content) {
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
