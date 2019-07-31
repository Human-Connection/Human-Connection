import { neode } from '../../bootstrap/neo4j'
import Resolver from './helpers/Resolver'

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
    UpdateSocialMedia: async (object, params, context, resolveInfo) => {
      const socialMedia = await instance.find('SocialMedia', params.id)
      await socialMedia.update({ url: params.url })
      const response = await socialMedia.toJson()

      return response
    },
    DeleteSocialMedia: async (object, { id }, context, resolveInfo) => {
      const socialMedia = await instance.find('SocialMedia', id)
      if (!socialMedia) return null
      await socialMedia.delete()
      return socialMedia.toJson()
    },
  },
  SocialMedia: Resolver('SocialMedia', {
    idAttribute: 'url',
    hasOne: {
      ownedBy: '<-[:OWNED_BY]-(related:User)',
    },
  }),
}
