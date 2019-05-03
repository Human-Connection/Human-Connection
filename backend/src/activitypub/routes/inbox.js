import express from 'express'
import { activityPub } from '../ActivityPub'

const debug = require('debug')('ea:inbox')

const router = express.Router()

router.post('/', async function (req, res, next) {
  debug(`Content-Type = ${req.get('Content-Type')}`)
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`Request headers = ${JSON.stringify(req.headers, null, 2)}`)
  switch (req.body.type) {
  case 'Create':
    await attachCatchToPromise(activityPub.handleCreateActivity(req.body), res)
    break
  case 'Undo':
    await attachCatchToPromise(activityPub.handleUndoActivity(req.body), res)
    break
  case 'Follow':
    await attachCatchToPromise(activityPub.handleFollowActivity(req.body), res)
    break
  case 'Delete':
    await attachCatchToPromise(activityPub.handleDeleteActivity(req.body), res)
    break
  /* eslint-disable */
  case 'Update':
    await attachCatchToPromise(activityPub.handleUpdateActivity(req.body), res)
    break
  case 'Accept':
    await attachCatchToPromise(activityPub.handleAcceptActivity(req.body), res)
  case 'Reject':
    // Do nothing
    break
  case 'Add':
    break
  case 'Remove':
    break
  case 'Like':
    await attachCatchToPromise(activityPub.handleLikeActivity(req.body), res)
    break
  case 'Dislike':
    await attachCatchToPromise(activityPub.handleDislikeActivity(req.body), res)
    break
  case 'Announce':
    debug('else!!')
    debug(JSON.stringify(req.body, null, 2))
  }
  /* eslint-enable */
  res.status(200).end()
})

function attachCatchToPromise (promise, res) {
  return promise.catch(() => {
    res.status(500).end()
  })
}

export default router
