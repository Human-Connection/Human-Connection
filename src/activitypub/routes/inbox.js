import express from 'express'
import { verify } from '../security'
const debug = require('debug')('ea:inbox')

const router = express.Router()

// Shared Inbox endpoint (federated Server)
// For now its only able to handle Note Activities!!
router.post('/', async function (req, res, next) {
  debug(`Content-Type = ${req.get('Content-Type')}`)
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`Request headers = ${JSON.stringify(req.headers, null, 2)}`)
  debug(`verify = ${await verify(`${req.protocol}://${req.hostname}:${req.port}${req.originalUrl}`, req.headers)}`)
  switch (req.body.type) {
  case 'Create':
    await await req.app.get('activityPub').handleCreateActivity(req.body).catch(next)
    break
  case 'Undo':
    await await req.app.get('activityPub').handleUndoActivity(req.body).catch(next)
    break
  case 'Follow':
    debug('handleFollow')
    await req.app.get('activityPub').handleFollowActivity(req.body)
    debug('handledFollow')
    break
  case 'Delete':
    await await req.app.get('activityPub').handleDeleteActivity(req.body).catch(next)
    break
    /* eslint-disable */
  case 'Update':

  case 'Accept':

  case 'Reject':

  case 'Add':

  case 'Remove':

  case 'Like':

  case 'Announce':
    debug('else!!')
    debug(JSON.stringify(req.body, null, 2))
  }
  /* eslint-enable */
  res.status(200).end()
})

export default router
