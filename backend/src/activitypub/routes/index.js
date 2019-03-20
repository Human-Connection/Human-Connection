import user from './user'
import inbox from './inbox'
import webFinger from './webFinger'
import express from 'express'
import cors from 'cors'
import verify from './verify'

const router = express.Router()

router.use('/.well-known/webFinger',
  cors(),
  express.urlencoded({ extended: true }),
  webFinger
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
  verify,
  inbox
)

export default router
