import { activityPub } from '../ActivityPub'
import { createSignature } from '../security'
import request from 'request'
const debug = require('debug')('ea:utils')

export function extractNameFromId (uri) {
  return getPathSegmentFromUriAfter(uri, 'users')
}

export function extractIdFromActivityId (uri) {
  return getPathSegmentFromUriAfter(uri, 'status');
}

function getPathSegmentFromUriAfter (uri, pathSegment) {
  const { pathname } = new URL(uri)
  const splitted = pathname.split('/')

  return splitted[splitted.indexOf(pathSegment) + 1]
}

export function constructIdFromName (name, fromHost = activityPub.endpoint) {
  return `${fromHost}/api/users/${name}`
}

export function extractHostFromUrl (url) {
  return new URL(url).host
}

export function throwErrorIfApolloErrorOccurred (result) {
  if (result.error && (result.error.message || result.error.errors)) {
    throw new Error(`${result.error.message ? result.error.message : result.error.errors[0].message}`)
  }
}

export function signAndSend (activity, fromName, toHost, url) {
  // fix for development: replace with http
  url = url.indexOf('localhost') > -1 ? url.replace('https', 'http') : url
  debug(`passhprase = ${process.env.PRIVATE_KEY_PASSPHRASE}`)
  return new Promise(async (resolve, reject) => {
    debug('inside signAndSend')
    const privateKey = await activityPub.dataSource.getEncryptedPrivateKey(fromName)

    if (result.records.length === 0) {
      reject('No user found!')
    } else {
      const date = new Date().toUTCString()
      const signature = createSignature({ privateKey,
        keyId: `${activityPub.endpoint}/api/users/${fromName}#main-key`,
        url,
        headers: {
          'Host': toHost,
          'Date': date,
          'Content-Type': 'application/activity+json'
        }
      })

      request({
        url: url,
        headers: {
          'Host': toHost,
          'Date': date,
          'Signature': signature,
          'Content-Type': 'application/activity+json'
        },
        method: 'POST',
        body: typeof activity === 'string' ? activity : JSON.stringify(activity)
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
