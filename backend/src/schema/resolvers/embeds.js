import scrape from './embeds/scraper.js'
import { undefinedToNullResolver } from './helpers/Resolver'

export default {
  Query: {
    embed: async (object, { url }, context, resolveInfo) => {
      return scrape(url)
    },
  },
  Embed: {
    ...undefinedToNullResolver([
      'type',
      'title',
      'description',
      'author',
      'publisher',
      'url',
      'date',
      'image',
      'audio',
      'video',
      'lang',
      'logo',
      'sources',
    ]),
    sources: async (parent, params, context, resolveInfo) => {
      return typeof parent.sources === 'undefined' ? [] : parent.sources
    },
  },
}
