import Metascraper from 'metascraper'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

import { ApolloError } from 'apollo-server'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import mergeWith from 'lodash/mergeWith'

const error = require('debug')('embed:error')

const metascraper = Metascraper([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-lang-detector')(),
  require('metascraper-logo')(),
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

const fetchEmbed = async url => {
  const provider = oEmbedProviders.find(provider => {
    return provider.provider_url.includes(url.hostname)
  })
  if (!provider) return {}
  const {
    endpoints: [endpoint],
  } = provider
  const endpointUrl = new URL(endpoint.url)
  endpointUrl.searchParams.append('url', url.href)
  endpointUrl.searchParams.append('format', 'json')
  let json
  try {
    const response = await fetch(endpointUrl)
    json = await response.json()
  } catch (err) {
    error(`Error fetching embed data: ${err.message}`)
    return {}
  }

  return {
    type: json.type,
    html: json.html,
    author: json.author_name,
    date: json.upload_date,
    sources: ['oembed'],
  }
}

const fetchResource = async url => {
  const response = await fetch(url)
  const html = await response.text()
  const resource = await metascraper({ html, url: url.href })
  return {
    sources: ['resource'],
    ...resource,
  }
}

export default async function scrape(url) {
  url = new URL(url)
  if (url.hostname === 'youtu.be') {
    // replace youtu.be to get proper results
    url.hostname = 'youtube.com'
  }

  const [meta, embed] = await Promise.all([fetchResource(url), fetchEmbed(url)])
  const output = mergeWith(meta, embed, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })

  if (isEmpty(output)) {
    throw new ApolloError('Not found', 'NOT_FOUND')
  }

  return {
    type: 'link',
    ...output,
  }
}
