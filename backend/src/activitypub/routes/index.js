import user from './user'
import inbox from './inbox'
import express from 'express'
import cors from 'cors'
import verify from './verify'

export default function () {
  const router = express.Router()
  router.use(
    '/activitypub/users',
    cors(),
    express.json({
      type: ['application/activity+json', 'application/ld+json', 'application/json'],
    }),
    express.urlencoded({ extended: true }),
    user,
  )
  router.use(
    '/activitypub/inbox',
    cors(),
    express.json({
      type: ['application/activity+json', 'application/ld+json', 'application/json'],
    }),
    express.urlencoded({ extended: true }),
    verify,
    inbox,
  )
  return router
}
