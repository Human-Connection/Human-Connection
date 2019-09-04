import cheerio from 'cheerio'
import { exec, build } from 'xregexp/xregexp-all.js'
// formats of a Hashtag:
//   https://en.wikipedia.org/w/index.php?title=Hashtag&oldid=905141980#Style
// here:
//    0. Search for whole string.
//    1. Hashtag has only all unicode characters and '0-9'.
//    2. If it starts with a digit '0-9' than a unicode character has to follow.
const regX = build('^/search/hashtag/((\\pL+[\\pL0-9]*)|([0-9]+\\pL+[\\pL0-9]*))$')

export default function(content) {
  if (!content) return []
  const $ = cheerio.load(content)
  // We can not search for class '.hashtag', because the classes are removed at the 'xss' middleware.
  //   But we have to know, which Hashtags are removed from the content as well, so we search for the 'a' html-tag.
  const urls = $('a')
    .map((_, el) => {
      return $(el).attr('href')
    })
    .get()
  const hashtags = []
  urls.forEach(url => {
    const match = exec(url, regX)
    if (match != null) {
      hashtags.push(match[1])
    }
  })
  return hashtags
}
