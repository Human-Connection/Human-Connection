import { getMutedUsers } from '../users.js'
import { mergeWith, isArray } from 'lodash'

export const filterForMutedUsers = async (params, context) => {
  if (!context.user) return params
  const [mutedUsers] = await Promise.all([getMutedUsers(context)])
  const mutedUsersIds = [...mutedUsers.map((user) => user.id)]
  if (!mutedUsersIds.length) return params

  params.filter = mergeWith(
    params.filter,
    {
      author_not: { id_in: mutedUsersIds },
    },
    (objValue, srcValue) => {
      if (isArray(objValue)) {
        return objValue.concat(srcValue)
      }
    },
  )
  return params
}
