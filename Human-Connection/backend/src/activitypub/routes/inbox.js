import express from 'express'
import { activityPub } from '../ActivityPub'

const debug = require('debug')('ea:inbox')

const router = express.Router()

// Shared Inbox endpoint (federated Server)
// For now its only able to handle Note Activities!!
router.post('/', async function(req, res, next) {
  debug(`Content-Type = ${req.get('Content-Type')}`)
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`Request headers = ${JSON.stringify(req.headers, null, 2)}`)
  switch (req.body.type) {
    case 'Create':
      await activityPub.handleCreateActivity(req.body).catch(next)
      break
    case 'Undo':
      await activityPub.handleUndoActivity(req.body).catch(next)
      break
    case 'Follow':
      await activityPub.handleFollowActivity(req.body).catch(next)
      break
    case 'Delete':
      await activityPub.handleDeleteActivity(req.body).catch(next)
      break
    /* eslint-disable */
  case 'Update':
    await activityPub.handleUpdateActivity(req.body).catch(next)
    break
  case 'Accept':
    await activityPub.handleAcceptActivity(req.body).catch(next)
  case 'Reject':
    // Do nothing
    break
  case 'Add':
    break
  case 'Remove':
    break
  case 'Like':
    await activityPub.handleLikeActivity(req.body).catch(next)
    break
  case 'Dislike':
    await activityPub.handleDislikeActivity(req.body).catch(next)
    break
  case 'Announce':
    debug('else!!')
    debug(JSON.stringify(req.body, null, 2))
  }
  /* eslint-enable */
  res.status(200).end()
})

export default router
