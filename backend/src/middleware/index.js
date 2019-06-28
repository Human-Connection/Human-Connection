import CONFIG from './../config'
import activityPub from './activityPubMiddleware'
import password from './passwordMiddleware'
import softDelete from './softDeleteMiddleware'
import sluggify from './sluggifyMiddleware'
import excerpt from './excerptMiddleware'
import dateTime from './dateTimeMiddleware'
import xss from './xssMiddleware'
import permissions from './permissionsMiddleware'
import user from './userMiddleware'
import includedFields from './includedFieldsMiddleware'
import orderBy from './orderByMiddleware'
import validation from './validation'
import handleContentData from './handleHtmlContent/handleContentData'

export default schema => {
  const middlewares = {
    permissions: permissions,
    activityPub: activityPub,
    password: password,
    dateTime: dateTime,
    validation: validation,
    sluggify: sluggify,
    excerpt: excerpt,
    handleContentData: handleContentData,
    xss: xss,
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
    'handleContentData',
    'xss',
    'softDelete',
    'user',
    'includedFields',
    'orderBy',
  ]

  // add permisions middleware at the first position (unless we're seeding)
  if (CONFIG.DISABLED_MIDDLEWARES) {
    const disabledMiddlewares = CONFIG.DISABLED_MIDDLEWARES.split(',')
    order = order.filter(key => {
      return !disabledMiddlewares.includes(key)
    })
    /* eslint-disable-next-line no-console */
    console.log(`Warning: "${disabledMiddlewares}" middlewares have been disabled.`)
  }

  return order.map(key => middlewares[key])
}