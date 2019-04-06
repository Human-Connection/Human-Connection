import { createActor } from '../utils/actor'
import gql from 'graphql-tag'

export async function serveUser (req, res, next) {
  let name = req.params.name

  if (name.startsWith('@')) {
    name = name.slice(1)
  }

  const result = await req.app.get('ap').dataSource.client.query({
    query: gql`
        query {
            User(slug: "${name}") {
                publicKey
            }
        }
    `
  })

  if (result.data && Array.isArray(result.data.User) && result.data.User.length > 0) {
    const publicKey = result.data.User[0].publicKey
    const actor = createActor(name, publicKey)

    if (req.accepts(['application/activity+json', 'application/ld+json', 'application/json'])) {
      return res.json(actor)
    } else if (req.accepts('text/html')) {
      // TODO show user's profile page instead of the actor object
      return res.json(actor)
    }
  } else {
    next()
  }
}
