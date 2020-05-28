import cheerio from 'cheerio'

export default (content) => {
  if (!content) return []
  const $ = cheerio.load(content)
  const userIds = $('a.mention[data-mention-id]')
    .map((_, el) => {
      return $(el).attr('data-mention-id')
    })
    .get()
  return userIds
    .map((id) => id.trim())
    .filter((id) => !!id)
    .filter((id, index, allIds) => allIds.indexOf(id) === index)
}
