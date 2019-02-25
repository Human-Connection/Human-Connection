import dotenv from 'dotenv'
import { resolve } from 'path'
import crypto from 'crypto'
import { activityPub } from '../ActivityPub'
import gql from 'graphql-tag'
import request from 'request'
const debug = require('debug')('ea:security')

dotenv.config({ path: resolve('src', 'activitypub', '.env') })

export function generateRsaKeyPair () {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: process.env.PRIVATE_KEY_PASSPHRASE
    }
  })
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
          'Signature': createSignature(privateKey, `http://${activityPub.domain}/activitypub/users/${fromName}#main-key`, url,
            {
              'Host': targetDomain,
              'Date': date,
              'Content-Type': 'application/activity+json'
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

export function verify (url, headers) {
  return new Promise((resolve, reject) => {
    const signatureHeader = headers['signature'] ? headers['signature'] : headers['Signature']
    if (!signatureHeader) {
      debug('No Signature header present!')
      resolve(false)
    }
    debug(`Signature Header = ${signatureHeader}`)
    const signature = extractKeyValueFromSignatureHeader(signatureHeader, 'signature')
    const algorithm = extractKeyValueFromSignatureHeader(signatureHeader, 'algorithm')
    const headersString = extractKeyValueFromSignatureHeader(signatureHeader, 'headers')
    const keyId = extractKeyValueFromSignatureHeader(signatureHeader, 'keyId')

    if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) {
      debug('Unsupported hash algorithm specified!')
      resolve(false)
    }

    const usedHeaders = headersString.split(' ')
    const verifyHeaders = {}
    Object.keys(headers).forEach((key) => {
      if (usedHeaders.includes(key.toLowerCase())) {
        verifyHeaders[key.toLowerCase()] = headers[key]
      }
    })
    const signingString = constructSigningString(url, verifyHeaders)
    debug(`keyId= ${keyId}`)
    request({
      url: keyId,
      headers: {
        'Accept': 'application/json'
      }
    }, (err, response, body) => {
      if (err) reject(err)
      debug(`body = ${body}`)
      const actor = JSON.parse(body)
      const publicKeyPem = actor.publicKey.publicKeyPem
      resolve(httpVerify(publicKeyPem, signature, signingString, algorithm))
    })
  })
}

// specify the public key owner object
/* const testPublicKeyOwner = {
    "@context": jsig.SECURITY_CONTEXT_URL,
    '@id': 'https://example.com/i/alice',
    publicKey: [testPublicKey]
} */

/* const publicKey = {
    '@context': jsig.SECURITY_CONTEXT_URL,
    type: 'RsaVerificationKey2018',
    id: `https://${ActivityPub.domain}/users/${fromName}#main-key`,
    controller: `https://${ActivityPub.domain}/users/${fromName}`,
    publicKeyPem
} */

// Obtained from invoking crypto.getHashes()
export const SUPPORTED_HASH_ALGORITHMS = [
  'rsa-md4',
  'rsa-md5',
  'rsa-mdC2',
  'rsa-ripemd160',
  'rsa-sha1',
  'rsa-sha1-2',
  'rsa-sha224',
  'rsa-sha256',
  'rsa-sha384',
  'rsa-sha512',
  'blake2b512',
  'blake2s256',
  'md4',
  'md4WithRSAEncryption',
  'md5',
  'md5-sha1',
  'md5WithRSAEncryption',
  'mdc2',
  'mdc2WithRSA',
  'ripemd',
  'ripemd160',
  'ripemd160WithRSA',
  'rmd160',
  'sha1',
  'sha1WithRSAEncryption',
  'sha224',
  'sha224WithRSAEncryption',
  'sha256',
  'sha256WithRSAEncryption',
  'sha384',
  'sha384WithRSAEncryption',
  'sha512',
  'sha512WithRSAEncryption',
  'ssl3-md5',
  'ssl3-sha1',
  'whirlpool']

// signing
function createSignature (privKey, keyId, url, headers = {}, algorithm = 'rsa-sha256') {
  if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) { return throw Error(`SIGNING: Unsupported hashing algorithm = ${algorithm}`) }
  const signer = crypto.createSign(algorithm)
  const signingString = constructSigningString(url, headers)
  signer.update(signingString)
  const signatureB64 = signer.sign({ key: privKey, passphrase: process.env.PRIVATE_KEY_PASSPHRASE }, 'base64')
  const headersString = Object.keys(headers).reduce((result, key) => { return result + ' ' + key.toLowerCase() }, '')
  return `keyId="${keyId}",algorithm="${algorithm}",headers="(request-target)${headersString}",signature="${signatureB64}"`
}

// signing
function constructSigningString (url, headers) {
  const urlObj = new URL(url)
  let signingString = `(request-target): post ${urlObj.pathname}${urlObj.search !== '' ? urlObj.search : ''}`
  return Object.keys(headers).reduce((result, key) => {
    return result + `\n${key.toLowerCase()}: ${headers[key]}`
  }, signingString)
}

// verifying
function httpVerify (pubKey, signature, signingString, algorithm) {
  if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) { throw Error(`SIGNING: Unsupported hashing algorithm = ${algorithm}`) }
  const verifier = crypto.createVerify(algorithm)
  verifier.update(signingString)
  return verifier.verify(pubKey, signature, 'base64')
}

// verifying
// This function can be used to extract the signature,headers,algorithm etc. out of the Signature Header.
// Just pass what you want as key
function extractKeyValueFromSignatureHeader (signatureHeader, key) {
  const keyString = signatureHeader.split(',').filter((el) => {
    return !!el.startsWith(key)
  })[0]

  let firstEqualIndex = keyString.search('=')
  // When headers are requested add 17 to the index to remove "(request-target) " from the string
  if (key === 'headers') { firstEqualIndex += 17 }
  return keyString.substring(firstEqualIndex + 2, keyString.length - 1)
}
