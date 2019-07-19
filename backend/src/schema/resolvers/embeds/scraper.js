import Metascraper from 'metascraper'
import * as nodeFetch from 'node-fetch'

import { ApolloError } from 'apollo-server'
import parseUrl from 'url'
import request from 'request-promise-native'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import each from 'lodash/each'
import isArray from 'lodash/isArray'
import mergeWith from 'lodash/mergeWith'
import urlParser from 'url'


const metascraper = Metascraper ([
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

    if (cache[targetUrl]) {
      return cache[targetUrl]
    }

    const url = parseUrl.parse(targetUrl, true)

    let meta = {}
    let embed = {}

    // only get data from requested services
    await Promise.all([
      new Promise(async (resolve, reject) => {
        try {
          meta = await scraper.fetchMeta(targetUrl)
          resolve()
        } catch(err) {
          if (process.env.DEBUG) {
            console.error(`ERROR at fetchMeta | ${err.message}`)
          }
          resolve()
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          embed = await scraper.fetchEmbed(targetUrl)
          resolve()
        } catch(err) {
          if (process.env.DEBUG) {
            console.error(`ERROR at fetchEmbed | ${err.message}`)
          }
          resolve()
        }
      })
    ])

    const output = mergeWith(
      meta,
      embed,
      (objValue, srcValue) => {
        if (isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      }
    )

    if (isEmpty(output)) {
      throw new ApolloError('Not found', 'NOT_FOUND')
    }

    // fix youtube start parameter
    const YouTubeStartParam = url.query.t || url.query.start
    if (output.publisher === 'YouTube' && YouTubeStartParam) {
      output.embed = output.embed.replace('?feature=oembed', `?feature=oembed&start=${YouTubeStartParam}`)
      output.url += `&start=${YouTubeStartParam}`
    }

    // write to cache
    cache[targetUrl] = output

    return output
  },
  async fetchEmbed(targetUrl) {
    const url = urlParser.parse(targetUrl)
    const embedMeta = find(oEmbedProviders, provider => {
      return provider.provider_url.indexOf(url.hostname) >= 0
    })
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
        type: data.type || 'link',
        embed: data.html,
        author: data.author_name,
        date: data.upload_date ? new Date(data.upload_date).toISOString() : null
      }

      output.sources = ['oembed']

      return output
    }
    return {}
  },
  async fetchMeta(targetUrl) {

    const response = await nodeFetch(targetUrl)
    const html = await response.text()
    const metadata = await metascraper({ html, url: targetUrl })

    metadata.sources = ['resource']
    metadata.type = 'link'

    return metadata
  }
}

module.exports = scraper
