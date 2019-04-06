import { verifySignature } from '../security'

export default async (req, res, next) => {
  // TODO stop if signature validation fails
  if (await verifySignature(`${req.protocol}://${req.hostname}:${req.app.get('port')}${req.originalUrl}`, req.headers)) {
    next()
  } else {
    next()
  }
}
