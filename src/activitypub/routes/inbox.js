import express from 'express'
import { verifySignature } from '../security'
import { activityPub } from '../ActivityPub'

const debug = require('debug')('ea:inbox')

const router = express.Router()

// Shared Inbox endpoint (federated Server)
// For now its only able to handle Note Activities!!
router.post('/', async function (req, res, next) {
  debug(`Content-Type = ${req.get('Content-Type')}`)
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`Request headers = ${JSON.stringify(req.headers, null, 2)}`)
  // TODO stop if signature validation fails
  debug(`verify = ${await verifySignature(`${req.protocol}://${req.hostname}:${req.port}${req.originalUrl}`, req.headers)}`)
  switch (req.body.type) {
  case 'Create':
    if (req.body.send) {
      await activityPub.sendActivity(req.body).catch(next)
      break
    }
    await activityPub.handleCreateActivity(req.body).catch(next)
    break
  case 'Undo':
    await activityPub.handleUndoActivity(req.body).catch(next)
    break
  case 'Follow':
    debug('handleFollow')
    await activityPub.handleFollowActivity(req.body)
    debug('handledFollow')
    break
  case 'Delete':
    await activityPub.handleDeleteActivity(req.body).catch(next)
    break
    /* eslint-disable */
  case 'Update':

  case 'Accept':
    await activityPub.handleAcceptActivity(req.body).catch(next)
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
