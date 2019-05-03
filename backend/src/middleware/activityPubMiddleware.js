import { generateRsaKeyPair } from '../activitypub/security'
import { activityPub } from '../activitypub/ActivityPub'
import as from 'activitystrea.ms'

export default {
  Mutation: {
    CreatePost: async (resolve, root, args, context, info) => {
      args.activityId = args.activityId || activityPub.generateStatusId(context.user.slug)
      args.objectId = args.objectId || activityPub.generateStatusId(context.user.slug)

      const post = await resolve(root, args, context, info)

      const { user: author } = context
      const actorId = author.actorId

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
              const parsedDoc = JSON.parse(doc)
              resolve(JSON.stringify(parsedDoc))
            }
          })
      })
      try {
        await activityPub.sendActivity(createActivity)
      } catch (e) {

      }
      return post
    },
    CreateUser: async (resolve, root, args, context, info) => {
      const keys = generateRsaKeyPair()
      Object.assign(args, keys)
      return resolve(root, args, context, info)
    }
  }
}
