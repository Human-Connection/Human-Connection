import scrape from './embeds/scraper.js'
import { undefinedToNull } from '../helpers'

export default {
  Query: {
    embed: async (object, { url }, context, resolveInfo) => {
      return scrape(url)
    },
  },
  Embed: {
    ...undefinedToNull([
      'type',
      'title',
      'author',
      'publisher',
      'date',
      'description',
      'url',
      'image',
      'audio',
      'video',
      'lang',
      'html',
    ]),
    sources: async (parent, params, context, resolveInfo) => {
      return typeof parent.sources === 'undefined' ? [] : parent.sources
    },
  },
}
