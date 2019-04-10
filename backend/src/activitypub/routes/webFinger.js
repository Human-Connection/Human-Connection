import express from 'express'
import { createWebFinger } from '../utils/actor'

const router = express.Router()

router.get('/', async function (req, res) {
  const resource = req.query.resource
  if (!resource || !resource.includes('acct:')) {
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.')
  } else {
    const nameAndDomain = resource.replace('acct:', '')
    const name = nameAndDomain.split('@')[0]

    const exists = await req.app.get('ap').dataSource.userExists(name)

    if (!exists) {
      return res.status(404).json({error: `No record found for ${nameAndDomain}.`})
    }

    const webFingerRecord = createWebFinger(name)
    return res.contentType('application/jrd+json').json(webFingerRecord)
  }
})

export default router
