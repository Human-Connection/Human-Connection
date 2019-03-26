import { activityPub } from '../ActivityPub'
import gql from 'graphql-tag'
import { createSignature } from '../security'
import request from 'request'
const debug = require('debug')('ea:utils')

export function extractNameFromId (uri) {
  const urlObject = new URL(uri)
  const pathname = urlObject.pathname
  const splitted = pathname.split('/')

  return splitted[splitted.indexOf('users') + 1]
}

export function extractIdFromActivityId (uri) {
  const urlObject = new URL(uri)
  const pathname = urlObject.pathname
  const splitted = pathname.split('/')

  return splitted[splitted.indexOf('status') + 1]
}

export function constructIdFromName (name, fromDomain = activityPub.endpoint) {
  return `${fromDomain}/activitypub/users/${name}`
}

export function extractDomainFromUrl (url) {
  return new URL(url).host
}

export function throwErrorIfApolloErrorOccurred (result) {
  if (result.error && (result.error.message || result.error.errors)) {
    throw new Error(`${result.error.message ? result.error.message : result.error.errors[0].message}`)
  }
}

export function signAndSend (activity, fromName, targetDomain, url) {
  // fix for development: replace with http
  url = url.indexOf('localhost') > -1 ? url.replace('https', 'http') : url
  debug(`passhprase = ${process.env.PRIVATE_KEY_PASSPHRASE}`)
  return new Promise(async (resolve, reject) => {
    debug('inside signAndSend')
    // get the private key
    const result = await activityPub.dataSource.client.query({
      query: gql`
          query {
              User(slug: "${fromName}") {
                  privateKey
              }
          }
      `
    })

    if (result.error) {
      reject(result.error)
    } else {
      // add security context
      const parsedActivity = JSON.parse(activity)
      if (Array.isArray(parsedActivity['@context'])) {
        parsedActivity['@context'].push('https://w3id.org/security/v1')
      } else {
        const context = [parsedActivity['@context']]
        context.push('https://w3id.org/security/v1')
        parsedActivity['@context'] = context
      }

      // deduplicate context strings
      parsedActivity['@context'] = [...new Set(parsedActivity['@context'])]
      const privateKey = result.data.User[0].privateKey
      const date = new Date().toUTCString()

      debug(`url = ${url}`)
      request({
        url: url,
        headers: {
          'Host': targetDomain,
          'Date': date,
          'Signature': createSignature({ privateKey,
            keyId: `${activityPub.endpoint}/activitypub/users/${fromName}#main-key`,
            url,
            headers: {
              'Host': targetDomain,
              'Date': date,
              'Content-Type': 'application/activity+json'
            }
          }),
          'Content-Type': 'application/activity+json'
        },
        method: 'POST',
        body: JSON.stringify(parsedActivity)
      }, (error, response) => {
        if (error) {
          debug(`Error = ${JSON.stringify(error, null, 2)}`)
          reject(error)
        } else {
          debug('Response Headers:', JSON.stringify(response.headers, null, 2))
          debug('Response Body:', JSON.stringify(response.body, null, 2))
          resolve()
        }
      })
    }
  })
}
