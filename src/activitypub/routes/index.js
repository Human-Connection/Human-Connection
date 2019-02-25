import user from './user'
import inbox from './inbox'
import webfinger from './webfinger'
import express from 'express'
import cors from 'cors'

const router = express.Router()

router.use('/.well-known/webfinger',
  cors(),
  express.urlencoded({ extended: true }),
  webfinger
)
router.use('/activitypub/users',
  cors(),
  express.json({ type: ['application/activity+json', 'application/ld+json', 'application/json'] }),
  express.urlencoded({ extended: true }),
  user
)
router.use('/activitypub/inbox',
  cors(),
  express.json({ type: ['application/activity+json', 'application/ld+json', 'application/json'] }),
  express.urlencoded({ extended: true }),
  inbox
)

export default router
