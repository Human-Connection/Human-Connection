// import dotenv from 'dotenv'
// import { resolve } from 'path'
import crypto from 'crypto'
import { getDriver } from '../../db/neo4j'
import CONFIG from './../../config'
const debug = require('debug')('ea:security')

// TODO Does this reference a local config? Why?
// dotenv.config({ path: resolve('src', 'activitypub', '.env') })

export const generateRsaKeyPair = async (options = {}) => {
  const { passphrase = CONFIG.PRIVATE_KEY_PASSPHRASE } = options
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase,
    },
  })
}

// signing
export const createSignature = async options => {
  const {
    privateKey,
    keyId,
    url,
    headers = {},
    algorithm = 'rsa-sha256',
    passphrase = CONFIG.PRIVATE_KEY_PASSPHRASE,
  } = options
  if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) {
    throw Error(`SIGNING: Unsupported hashing algorithm = ${algorithm}`)
  }
  const signer = crypto.createSign(algorithm)
  const signingString = constructSigningString(url, headers)
  signer.update(signingString)
  const signatureB64 = signer.sign({ key: privateKey, passphrase }, 'base64')
  const headersString = Object.keys(headers).reduce((result, key) => {
    return result + ' ' + key.toLowerCase()
  }, '')
  return `keyId="${keyId}",algorithm="${algorithm}",headers="(request-target)${headersString}",signature="${signatureB64}"`
}

// verifying
export const verifySignature = async (url, headers) => {
  const signatureHeader = headers.signature ? headers.signature : headers.Signature
  if (!signatureHeader) {
    debug('No Signature header present!')
    throw Error('No Signature header present!')
  }
  debug(`Signature Header = ${signatureHeader}`)
  const signature = extractKeyValueFromSignatureHeader(signatureHeader, 'signature')
  const algorithm = extractKeyValueFromSignatureHeader(signatureHeader, 'algorithm')
  const headersString = extractKeyValueFromSignatureHeader(signatureHeader, 'headers')
  const keyId = extractKeyValueFromSignatureHeader(signatureHeader, 'keyId')
  if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) {
    debug('Unsupported hash algorithm specified!')
    throw Error('Unsupported hash algorithm specified!')
  }
  const usedHeaders = headersString.split(' ')
  const verifyHeaders = {}
  Object.keys(headers).forEach(key => {
    if (usedHeaders.includes(key.toLowerCase())) {
      verifyHeaders[key.toLowerCase()] = headers[key]
    }
  })
  const signingString = await constructSigningString(url, verifyHeaders)
  debug(`keyId= ${keyId}`)
  await axios({
    url: keyId,
    headers: {
      Accept: 'application/json',
    },
  })
  .then((_response, body) => {
    console.log('body', body)
    debug(`body = ${body}`)
    const actor = JSON.parse(body)
    const publicKeyPem = actor.publicKey.publicKeyPem
    return httpVerify(publicKeyPem, signature, signingString, algorithm)
  })
  .catch(error => {
    console.log('error', error)
    throw Error(error)
  })
  // const { pathname } = new URL(keyId)
  // console.log('pathname', pathname)
  // const name = pathname.split('/').pop()
  // console.log('slug', name)
  // const driver = getDriver()
  // const session = driver.session()
  // try {
  //   const [user] = await session.readTransaction(async t => {
  //     const result = await t.run('MATCH (user:User {slug: $slug}) RETURN user {.*}', {
  //       slug: name,
  //     })
  //     return result.records.map(record => record.get('user'))
  //   })
  //   if (!user)
  //     return res.status(404).json({
  //       error: `No record found for "${name}".`,
  //     })
  //     debug(`user = ${user}`)
  //     const publicKeyPem = user.publicKey.publicKeyPem
  //     return httpVerify(publicKeyPem, signature, signingString, algorithm)
  // } catch (error) {
  //   debug(error)
  //   return res.status(500).json({
  //     error: 'Something went terribly wrong. Please contact support@human-connection.org',
  //   })
  // } finally {
  //   session.close()
  // }
}

// private: signing
const constructSigningString = (url, headers) => {
  const urlObj = new URL(url)
  const signingString = `(request-target): post ${urlObj.pathname}${
    urlObj.search !== '' ? urlObj.search : ''
  }`
  return Object.keys(headers).reduce((result, key) => {
    return result + `\n${key.toLowerCase()}: ${headers[key]}`
  }, signingString)
}

// private: verifying
const httpVerify = (pubKey, signature, signingString, algorithm) => {
  console.log('im at httpverify')
  if (!SUPPORTED_HASH_ALGORITHMS.includes(algorithm)) {
    throw Error(`SIGNING: Unsupported hashing algorithm = ${algorithm}`)
  }
  const verifier = crypto.createVerify(algorithm)
  verifier.update(signingString)
  return verifier.verify(pubKey, signature, 'base64')
}

// private: verifying
// This function can be used to extract the signature,headers,algorithm etc. out of the Signature Header.
// Just pass what you want as key
const extractKeyValueFromSignatureHeader = (signatureHeader, key) => {
  const keyString = signatureHeader.split(',').filter(el => {
    return !!el.startsWith(key)
  })[0]
  console.log('keyString', keyString)
  let firstEqualIndex = keyString.search('=')
  // When headers are requested add 17 to the index to remove "(request-target) " from the string
  if (key === 'headers') {
    firstEqualIndex += 17
  }
  return keyString.substring(firstEqualIndex + 2, keyString.length - 1)
}

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
  'whirlpool',
]
