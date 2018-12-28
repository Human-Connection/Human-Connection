const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-lang-detector')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  // require('metascraper-clearbit-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-audio')(),
  require('metascraper-soundcloud')(),
  require('metascraper-video')(),
  require('metascraper-youtube')()

  // require('./rules/metascraper-embed')()
])
const { ApolloError } = require('apollo-server')

const got = require('got')
const request = require('request-promise-native')
const find = require('lodash/find')
const isEmpty = require('lodash/isEmpty')
const each = require('lodash/each')
const urlParser = require('url')

// quick in memory cache
let cache = {}

let oEmbedProviders = []
const getEmbedProviders = async () => {
  let providers = await request('https://oembed.com/providers.json')
  providers = JSON.parse(providers)
  oEmbedProviders = providers
  return providers
}
getEmbedProviders()

const removeEmptyAttrs = obj => {
  let output = {}
  each(obj, (o, k) => {
    if (!isEmpty(o)) {
      output[k] = o
    }
  })
  return output
}

const scraper = {
  async fetch(targetUrl) {

    if (targetUrl.indexOf('//youtu.be/')) {
      // replace youtu.be to get proper results
      targetUrl = targetUrl.replace('//youtu.be/', '//youtube.com/')
    }

    let meta = {}
    let embed = {}

    // only get data from requested services
    await Promise.all([
      new Promise(async (resolve, reject) => {
        try {
          meta = await scraper.fetchMeta(targetUrl)
          resolve()
        } catch(err) {
          resolve()
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          embed = await scraper.fetchEmbed(targetUrl)
          console.log(embed)
          resolve()
        } catch(err) {
          console.error(err)
          resolve()
        }
      })
    ])

    const output = {
      ...(removeEmptyAttrs(meta)),
      ...(removeEmptyAttrs(embed))
    }

    if (isEmpty(output)) {
      throw new ApolloError('Not found', 404)
    }

    return output
  },
  async fetchEmbed(targetUrl) {
    const url = urlParser.parse(targetUrl)
    const embedMeta = find(oEmbedProviders, provider => {
      return provider.provider_url.indexOf(url.hostname) >= 0
    })
    console.log('embedMeta', embedMeta)
    if (!embedMeta) {
      return {}
    }
    const embedUrl = embedMeta.endpoints[0].url.replace('{format}', 'json')

    let data
    try {
      data = await request(`${embedUrl}?url=${targetUrl}`)
      data = JSON.parse(data)
    } catch (err) {
      data = await request(`${embedUrl}?url=${targetUrl}&format=json`)
      data = JSON.parse(data)
    }
    if (data) {
      let output = {
        type: data.type,
        embed: data.html,
        author: data.author_name,
        date: data.upload_date ? new Date(data.upload_date).toISOString() : null
      }

      return output
    }
    return {}
  },
  async fetchMeta(targetUrl) {

    // const parsedURL = urlParser.parse(targetUrl)
    // console.log(parsedURL)

    // get from cache
    if (cache[targetUrl]) {
      return cache[targetUrl]
    }

    const { body: html, url } = await got(targetUrl)
    const metadata = await metascraper({ html, url })

    // write to cache
    cache[targetUrl] = metadata

    return metadata
  }
}

module.exports = scraper
