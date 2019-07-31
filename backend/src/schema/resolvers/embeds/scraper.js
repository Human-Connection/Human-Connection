import Metascraper from 'metascraper'
import fetch from 'node-fetch'

import { ApolloError } from 'apollo-server'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import mergeWith from 'lodash/mergeWith'
import findProvider from './findProvider'

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

const fetchEmbed = async url => {
  let endpointUrl = findProvider(url)
  if (!endpointUrl) return {}
  endpointUrl = new URL(endpointUrl)
  endpointUrl.searchParams.append('url', url)
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
  const resource = await metascraper({ html, url })
  return {
    sources: ['resource'],
    ...resource,
  }
}

export default async function scrape(url) {
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
