import { generateRsaKeyPair } from '../activitypub/security'
import { activityPub } from '../activitypub/ActivityPub'
import as from 'activitystrea.ms'

const debug = require('debug')('backend:schema')

const initialize = async (resolve, root, args, context, info) => {
  const { host } = activityPub
  const { slug } = args
  const keys = generateRsaKeyPair()
  const actorId = `${host}/activitypub/users/${slug}`
  args = { ...args, keys, actorId }
  return resolve(root, args, context, info)
}

export default {
  Mutation: {
    CreatePost: async (resolve, root, args, context, info) => {
      args.activityId = activityPub.generateStatusId(context.user.slug)
      args.objectId = activityPub.generateStatusId(context.user.slug)

      const post = await resolve(root, args, context, info)

      const { user: author } = context
      const actorId = author.actorId
      debug(`actorId = ${actorId}`)
      const createActivity = await new Promise((resolve, reject) => {
        as.create()
          .id(`${actorId}/status/${args.activityId}`)
          .actor(`${actorId}`)
          .object(
            as
              .article()
              .id(`${actorId}/status/${post.id}`)
              .content(post.content)
              .to('https://www.w3.org/ns/activitystreams#Public')
              .publishedNow()
              .attributedTo(`${actorId}`),
          )
          .prettyWrite((err, doc) => {
            if (err) {
              reject(err)
            } else {
              debug(doc)
              const parsedDoc = JSON.parse(doc)
              parsedDoc.send = true
              resolve(JSON.stringify(parsedDoc))
            }
          })
      })
      try {
        await activityPub.sendActivity(createActivity)
      } catch (e) {
        debug(`error sending post activity\n${e}`)
      }
      return post
    },
    CreateUser: initialize,
    signup: initialize,
    invite: initialize,
  },
}
