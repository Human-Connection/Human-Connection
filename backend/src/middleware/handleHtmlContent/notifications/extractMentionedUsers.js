import cheerio from 'cheerio'

export default function(content) {
  if (!content) return []
  const $ = cheerio.load(content)
  let userIds = $('a.mention[data-mention-id]')
    .map((_, el) => {
      return $(el).attr('data-mention-id')
    })
    .get()
  userIds = userIds.map(id => id.trim()).filter(id => !!id)
  return userIds
}
