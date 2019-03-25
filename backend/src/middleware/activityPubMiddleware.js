import { generateRsaKeyPair } from '../activitypub/security'
import { activityPub } from '../activitypub/ActivityPub'
import as from 'activitystrea.ms'
import dotenv from 'dotenv'

const debug = require('debug')('backend:schema')
dotenv.config()

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
            as.article()
              .id(`${actorId}/status/${post.id}`)
              .content(post.content)
              .to('https://www.w3.org/ns/activitystreams#Public')
              .publishedNow()
              .attributedTo(`${actorId}`)
          ).prettyWrite((err, doc) => {
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
    CreateUser: async (resolve, root, args, context, info) => {
      const keys = generateRsaKeyPair()
      Object.assign(args, keys)
      args.actorId = `${activityPub.host}/activitypub/users/${args.slug}`
      return resolve(root, args, context, info)
    }
  }
}
