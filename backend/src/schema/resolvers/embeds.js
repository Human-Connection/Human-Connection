import scrape from './embeds/scraper.js'

export default {
  Query: {
    embed: async (object, {url} , context, resolveInfo) => {
      return await scrape(url)
    }
  }
}
