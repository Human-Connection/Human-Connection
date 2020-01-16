import { getBlockedUsers, getBlockedByUsers } from '../users.js'
import { mergeWith, isArray } from 'lodash'

export const filterForBlockedUsers = async (params, context) => {
  if (!context.user) return params
  const [blockedUsers, blockedByUsers] = await Promise.all([
    getBlockedUsers(context),
    getBlockedByUsers(context),
  ])
  const blockedUsersIds = [...blockedByUsers.map(b => b.id), ...blockedUsers.map(b => b.id)]
  if (!blockedUsersIds.length) return params

  params.filter = mergeWith(
    params.filter,
    {
      author_not: { id_in: blockedUsersIds },
    },
    (objValue, srcValue) => {
      if (isArray(objValue)) {
        return objValue.concat(srcValue)
      }
    },
  )
  return params
}
