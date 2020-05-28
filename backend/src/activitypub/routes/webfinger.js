import express from 'express'
import CONFIG from '../../config/'
import cors from 'cors'

const debug = require('debug')('ea:webfinger')
const regex = /acct:([a-z0-9_-]*)@([a-z0-9_-]*)/

const createWebFinger = (name) => {
  const { host } = new URL(CONFIG.CLIENT_URI)
  return {
    subject: `acct:${name}@${host}`,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: `${CONFIG.CLIENT_URI}/activitypub/users/${name}`,
      },
    ],
  }
}

export async function handler(req, res) {
  const { resource = '' } = req.query
  // eslint-disable-next-line no-unused-vars
  const [_, name, domain] = resource.match(regex) || []
  if (!(name && domain))
    return res.status(400).json({
      error: 'Query parameter "?resource=acct:<USER>@<DOMAIN>" is missing.',
    })

  const session = req.app.get('driver').session()
  try {
    const [slug] = await session.readTransaction(async (t) => {
      const result = await t.run('MATCH (u:User {slug: $slug}) RETURN u.slug AS slug', {
        slug: name,
      })
      return result.records.map((record) => record.get('slug'))
    })
    if (!slug)
      return res.status(404).json({
        error: `No record found for "${name}@${domain}".`,
      })
    const webFinger = createWebFinger(name)
    return res.contentType('application/jrd+json').json(webFinger)
  } catch (error) {
    debug(error)
    return res.status(500).json({
      error: 'Something went terribly wrong. Please contact support@human-connection.org',
    })
  } finally {
    session.close()
  }
}

export default function () {
  const router = express.Router()
  router.use('/webfinger', cors(), express.urlencoded({ extended: true }), handler)
  return router
}
