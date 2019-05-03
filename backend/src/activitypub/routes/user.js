import verify from './verify'
import express from 'express'
import { sendCollection } from '../utils/collection'
import { activityPub } from '../ActivityPub'
import { createActor } from '../utils/actor'

const router = express.Router()
const debug = require('debug')('ea:user')

router.get('/:name', async function (req, res, next) {
  debug('inside user.js -> serveUser')
  let name = req.params.name
  const exists = await req.app.get('ap').userExists(name)
  if (name.startsWith('@')) {
    name = name.slice(1)
  } else if (name.indexOf('.') > -1 || !exists) {
    // do not serve user from another instance
    res.status(404).end()
  }

  debug(`name = ${name}`)
  const publicKey = await req.app.get('ap').getPublicKey(name)
  const actor = createActor(name, publicKey)

  debug(`actor = ${JSON.stringify(actor, null, 2)}`)
  if (req.accepts(['application/activity+json', 'application/ld+json', 'application/json'])) {
    return res.json(actor)
  } else if (req.accepts('text/html')) {
    // TODO show user's profile page instead of the actor object
    return res.json(actor)
  }
})

router.get('/:name/following', async (req, res) => {
  debug('inside user.js -> serveFollowingCollection')
  const name = req.params.name
  if (!name) {
    res.status(400).send('Bad request! Please specify a name.')
  } else {
    const collectionName = req.query.page ? 'followingPage' : 'following'
    await sendCollection(collectionName, req, res)
  }
})

router.get('/:name/followers', async (req, res) => {
  debug('inside user.js -> serveFollowersCollection')
  const name = req.params.name
  if (!name) {
    return res.status(400).send('Bad request! Please specify a name.')
  } else {
    const collectionName = req.query.page ? 'followersPage' : 'followers'
    await sendCollection(collectionName, req, res)
  }
})

router.get('/:name/outbox', async (req, res) => {
  debug('inside user.js -> serveOutboxCollection')
  const name = req.params.name
  if (!name) {
    return res.status(400).send('Bad request! Please specify a name.')
  } else {
    const collectionName = req.query.page ? 'outboxPage' : 'outbox'
    await sendCollection(collectionName, req, res)
  }
})

router.post('/:name/inbox', verify, async function (req, res) {
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`actorId = ${req.body.actor}`)

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
