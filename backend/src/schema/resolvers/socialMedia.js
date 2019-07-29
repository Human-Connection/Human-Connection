import { neode } from '../../bootstrap/neo4j'

const instance = neode()

export default {
  Mutation: {
    CreateSocialMedia: async (object, params, context, resolveInfo) => {
      const [user, socialMedia] = await Promise.all([
        instance.find('User', context.user.id),
        instance.create('SocialMedia', params),
      ])
      await socialMedia.relateTo(user, 'ownedBy')
      const response = await socialMedia.toJson()

      return response
    },
    DeleteSocialMedia: async (object, params, context, resolveInfo) => {
      const socialMedia = await instance.find('SocialMedia', params.id)
      const response = await socialMedia.toJson()
      await socialMedia.delete()

      return response
    },
    UpdateSocialMedia: async (object, params, context, resolveInfo) => {
      const socialMedia = await instance.find('SocialMedia', params.id)
      await socialMedia.update({ url: params.url })
      const response = await socialMedia.toJson()

      return response
    },
  },
}
