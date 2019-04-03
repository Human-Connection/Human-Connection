import { createActor } from '../utils/actor'
const gql = require('graphql-tag')
const debug = require('debug')('ea:serveUser')

export async function serveUser (req, res, next) {
  let name = req.params.name

  if (name.startsWith('@')) {
    name = name.slice(1)
  }

  debug(`name = ${name}`)
  const result = await req.app.get('ap').dataSource.client.query({
    query: gql`
        query {
            User(slug: "${name}") {
                publicKey
            }
        }
    `
  }).catch(reason => { debug(`serveUser User fetch error: ${reason}`) })

  if (result.data && Array.isArray(result.data.User) && result.data.User.length > 0) {
    const publicKey = result.data.User[0].publicKey
    const actor = createActor(name, publicKey)
    debug(`actor = ${JSON.stringify(actor, null, 2)}`)
    debug(`accepts json = ${req.accepts(['application/activity+json', 'application/ld+json', 'application/json'])}`)
    if (req.accepts(['application/activity+json', 'application/ld+json', 'application/json'])) {
      return res.json(actor)
    } else if (req.accepts('text/html')) {
      // TODO show user's profile page instead of the actor object
      /* const outbox = JSON.parse(result.outbox)
      const posts = outbox.orderedItems.filter((el) => { return el.object.type === 'Note'})
      const actor = result.actor
      debug(posts) */
      // res.render('user', { user: actor, posts: JSON.stringify(posts)})
      return res.json(actor)
    }
  } else {
    debug(`error getting publicKey for actor ${name}`)
    next()
  }
}
