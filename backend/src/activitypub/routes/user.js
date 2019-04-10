import { serveUser } from './serveUser'
import verify from './verify'

import express from 'express'
import { sendCollection } from '../utils/collection'
import { activityPub } from '../ActivityPub'

const router = express.Router()
const debug = require('debug')('ea:user')

router.get('/:name', async function (req, res, next) {
  debug('inside user.js -> serveUser')
  await serveUser(req, res, next)
})

router.get('/:name/following', (req, res) => {
  debug('inside user.js -> serveFollowingCollection')
  const name = req.params.name
  if (!name) {
    res.status(400).send('Bad request! Please specify a name.')
  } else {
    const collectionName = req.query.page ? 'followingPage' : 'following'
    sendCollection(collectionName, req, res)
  }
})

router.get('/:name/followers', (req, res) => {
  debug('inside user.js -> serveFollowersCollection')
  const name = req.params.name
  if (!name) {
    return res.status(400).send('Bad request! Please specify a name.')
  } else {
    const collectionName = req.query.page ? 'followersPage' : 'followers'
    sendCollection(collectionName, req, res)
  }
})

router.get('/:name/outbox', (req, res) => {
  debug('inside user.js -> serveOutboxCollection')
  const name = req.params.name
  if (!name) {
    return res.status(400).send('Bad request! Please specify a name.')
  } else {
    const collectionName = req.query.page ? 'outboxPage' : 'outbox'
    sendCollection(collectionName, req, res)
  }
})

router.post('/:name/inbox', verify, async function (req, res, next) {
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`actorId = ${req.body.actor}`)
  // const result = await saveActorId(req.body.actor)
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
