import express from 'express'
import cors from 'cors'
import { verifySignature } from '../security'

const debug = require('debug')('ea:verify')

export async function handler(req, res, next) {
  console.log('im here')
  debug(`actorId = ${req.body.actor}`)
  console.log('req', req)
  const { headers, body, protocol, hostname, app, originalUrl } = req
  console.log('headers', headers)
  try {
    await verifySignature(`${protocol}://${hostname}:4000${originalUrl}`, headers)
    debug('verify = true')
    next()
  } catch (error) {
    debug('verify = false')
    throw Error('Signature validation failed!', error)
  }
}

export default function() {
  const router = express.Router()
  router.use('/', cors(), express.urlencoded({ extended: true }), handler)
  return router
}
