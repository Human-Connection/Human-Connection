import { sendCollection } from '../utils'
import express from 'express'
import { serveUser } from '../utils/serveUser'
import { verify } from '../security'

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

router.post('/:name/inbox', async function (req, res, next) {
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`actorId = ${req.body.actor}`)
  debug(`verify = ${await verify(`${req.protocol}://${req.hostname}:${req.port}${req.originalUrl}`, req.headers)}`)
  // const result = await saveActorId(req.body.actor)
  switch (req.body.type) {
  case 'Create':
    await req.app.get('ap').handleCreateActivity(req.body).catch(next)
    break
  case 'Undo':
    await req.app.get('ap').handleUndoActivity(req.body).catch(next)
    break
  case 'Follow':
    debug('handleFollow')
    await req.app.get('ap').handleFollowActivity(req.body).catch(next)
    debug('handledFollow')
    break
  case 'Delete':
    req.app.get('ap').handleDeleteActivity(req.body).catch(next)
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
