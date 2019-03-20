import { verifySignature } from '../security'
const debug = require('debug')('ea:verify')

export default async (req, res, next) => {
  debug(`actorId = ${req.body.actor}`)
  // TODO stop if signature validation fails
  if (await verifySignature(`${req.protocol}://${req.hostname}:${req.app.get('port')}${req.originalUrl}`, req.headers)) {
    debug('verify = true')
    next()
  } else {
    // throw Error('Signature validation failed!')
    debug('verify = false')
    next()
  }
}
