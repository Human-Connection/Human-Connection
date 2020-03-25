import { applyMiddleware } from 'graphql-middleware'
import CONFIG from './../config'

import activityPub from './activityPubMiddleware'
import softDelete from './softDelete/softDeleteMiddleware'
import sluggify from './sluggifyMiddleware'
import excerpt from './excerptMiddleware'
import xss from './xssMiddleware'
import permissions from './permissionsMiddleware'
import includedFields from './includedFieldsMiddleware'
import orderBy from './orderByMiddleware'
import validation from './validation/validationMiddleware'
import notifications from './notifications/notificationsMiddleware'
import hashtags from './hashtags/hashtagsMiddleware'
import email from './email/emailMiddleware'
import sentry from './sentryMiddleware'

export default (schema) => {
  const middlewares = {
    sentry,
    permissions,
    xss,
    activityPub,
    validation,
    sluggify,
    excerpt,
    email,
    notifications,
    hashtags,
    softDelete,
    includedFields,
    orderBy,
  }

  let order = [
    'sentry',
    'permissions',
    'xss',
    // 'activityPub', disabled temporarily
    'validation',
    'sluggify',
    'excerpt',
    'email',
    'notifications',
    'hashtags',
    'softDelete',
    'includedFields',
    'orderBy',
  ]

  // add permisions middleware at the first position (unless we're seeding)
  if (CONFIG.DISABLED_MIDDLEWARES) {
    const disabledMiddlewares = CONFIG.DISABLED_MIDDLEWARES.split(',')
    order = order.filter((key) => {
      if (disabledMiddlewares.includes(key)) {
        /* eslint-disable-next-line no-console */
        console.log(`Warning: Disabled "${disabledMiddlewares}" middleware.`)
      }
      return !disabledMiddlewares.includes(key)
    })
  }

  const appliedMiddlewares = order.map((key) => middlewares[key])
  return applyMiddleware(schema, ...appliedMiddlewares)
}
