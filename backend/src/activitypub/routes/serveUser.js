import { createActor } from '../utils/actor'
const debug = require('debug')('ea:serveUser')

export async function serveUser (req, res) {
  let name = req.params.name

  if (name.startsWith('@')) {
    name = name.slice(1)
  }

  debug(`name = ${name}`)
  const publicKey = await req.app.get('ap').dataSource.getPublicKey(name)
  const actor = createActor(name, publicKey)

  debug(`actor = ${JSON.stringify(actor, null, 2)}`)
  if (req.accepts(['application/activity+json', 'application/ld+json', 'application/json'])) {
    return res.json(actor)
  } else if (req.accepts('text/html')) {
    // TODO show user's profile page instead of the actor object
    return res.json(actor)
  }
}
