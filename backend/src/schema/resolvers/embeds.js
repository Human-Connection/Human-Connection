import scraper from './embeds/scraper.js'

export default {
  Query: {
    embed: async (object, {url} , context, resolveInfo) => {
      return await scraper.fetch(url)
    }
  }
}
