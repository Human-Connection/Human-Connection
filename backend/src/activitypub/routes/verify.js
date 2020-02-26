import express from 'express'
import cors from 'cors'
import { verifySignature, createSignature, generateRsaKeyPair } from '../security'
import { getNeode } from '../../db/neo4j'
import { extractNameFromId } from '../utils'
const neode = getNeode()

const debug = require('debug')('ea:verify')

export async function handler(req, res, next) {
  debug(`actorId = ${req.body.actor}`)
  const { headers, body, protocol, hostname, app, originalUrl } = req
  console.log('headers', headers)
  // console.log('app', app, 'port', app.get('port'))
  // const slug = extractNameFromId(body.actor)
  // const user = await neode.cypher('MATCH (user:User {slug: $slug}) RETURN user {.*};', { slug })
  // if (user && user.records && user.records.length && headers.signature) {
    try {
      await verifySignature(`${protocol}://${hostname}:4000${originalUrl}`, headers)
      debug('verify = true')
      next()
    } catch (error) {
      debug('verify = false')
      throw Error('Signature validation failed!', error)
    // }
  // } else {
  //   try {
  //     const rsaKeyPair = await generateRsaKeyPair()
  //     const signature = await createSignature({
  //       privateKey: rsaKeyPair.privateKey,
  //       keyId: `https://human-connection.social/activitypub/users/${slug}#main-key`,
  //       url: body.object.attributedTo,
  //       headers,
  //     })
  //     if (signature) res.sendStatus(200)
  //   } catch (error) {
  //     throw Error('Create signature failed!', error)
  //   }
  }
}

export default function() {
  const router = express.Router()
  router.use('/', cors(), express.urlencoded({ extended: true }), handler)
  return router
}
