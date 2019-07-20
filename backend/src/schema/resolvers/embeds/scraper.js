import Metascraper from 'metascraper'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

import { ApolloError } from 'apollo-server'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import mergeWith from 'lodash/mergeWith'

const metascraper = Metascraper([
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
  require('metascraper-youtube')(),

  // require('./rules/metascraper-embed')()
])

let oEmbedProvidersFile = fs.readFileSync(path.join(__dirname, './providers.json'), 'utf8')

// some providers allow a format parameter
// we need JSON
oEmbedProvidersFile = oEmbedProvidersFile.replace('{format}', 'json')

const oEmbedProviders = JSON.parse(oEmbedProvidersFile)

const fetchEmbed = async targetUrl => {
  const url = new URL(targetUrl)
	const provider = oEmbedProviders.find(provider => {
    return provider.provider_url.includes(url.hostname)
  })
  if (!provider) return {}
  const {
    endpoints: [endpoint],
  } = provider
  const endpointUrl = new URL(endpoint.url)
  endpointUrl.searchParams.append('url', targetUrl)
  endpointUrl.searchParams.append('format', 'json')
  const response = await fetch(endpointUrl)
  const {
    type = 'link',
    html,
    author_name, // eslint-disable-line camelcase
    upload_date, // eslint-disable-line camelcase
    sources = ['oembed'],
  } = await response.json()

  return { type, html, author: author_name, date: upload_date, sources }
}

const fetchMeta = async targetUrl => {
  const response = await fetch(targetUrl)
  const html = await response.text()
  const metadata = await metascraper({ html, url: targetUrl })

  metadata.sources = ['resource']
  metadata.type = 'link'

  return metadata
}

export default async function scrape(targetUrl) {
  if (targetUrl.hostname === 'youtu.be') {
    // replace youtu.be to get proper results
    targetUrl.hostname = 'youtube.com'
  }

  const [meta, embed] = await Promise.all([fetchMeta(targetUrl), fetchEmbed(targetUrl)])

  const output = mergeWith(meta, embed, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })

  if (isEmpty(output)) {
    throw new ApolloError('Not found', 'NOT_FOUND')
  }

  return output
}
