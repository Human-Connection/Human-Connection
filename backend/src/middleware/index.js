import CONFIG from './../config'
import activityPub from './activityPubMiddleware'
import password from './passwordMiddleware'
import softDelete from './softDeleteMiddleware'
import sluggify from './sluggifyMiddleware'
import fixImageUrls from './fixImageUrlsMiddleware'
import excerpt from './excerptMiddleware'
import dateTime from './dateTimeMiddleware'
import xss from './xssMiddleware'
import permissions from './permissionsMiddleware'
import user from './userMiddleware'
import includedFields from './includedFieldsMiddleware'
import orderBy from './orderByMiddleware'
import validation from './validation'
import notifications from './notifications'

export default schema => {
  const middlewares = {
    permissions: permissions,
    activityPub: activityPub,
    password: password,
    dateTime: dateTime,
    validation: validation,
    sluggify: sluggify,
    excerpt: excerpt,
    notifications: notifications,
    xss: xss,
    fixImageUrls: fixImageUrls,
    softDelete: softDelete,
    user: user,
    includedFields: includedFields,
    orderBy: orderBy,
  }

  let order = [
    'permissions',
    'activityPub',
    'password',
    'dateTime',
    'validation',
    'sluggify',
    'excerpt',
    'notifications',
    'xss',
    'fixImageUrls',
    'softDelete',
    'user',
    'includedFields',
    'orderBy',
  ]

  // Disable Middlewares only in Development Mode
  if (CONFIG.IS_DEVELOPMENT) {
    order = order.filter(key => {
      if (CONFIG.DISABLED_MIDDLEWARES.includes(key)) {
        console.log(`Warning: "${key}" middleware have been disabled.`) // eslint-disable-line no-console
        return false
      }
      return true
    })
  }

  return order.map(key => middlewares[key])
}
