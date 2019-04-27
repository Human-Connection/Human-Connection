import activityPubMiddleware from './activityPubMiddleware'
import passwordMiddleware from './passwordMiddleware'
import softDeleteMiddleware from './softDeleteMiddleware'
import sluggifyMiddleware from './sluggifyMiddleware'
import fixImageUrlsMiddleware from './fixImageUrlsMiddleware'
import excerptMiddleware from './excerptMiddleware'
import dateTimeMiddleware from './dateTimeMiddleware'
import xssMiddleware from './xssMiddleware'
import permissionsMiddleware from './permissionsMiddleware'
import userMiddleware from './userMiddleware'
import includedFieldsMiddleware from './includedFieldsMiddleware'
import orderByMiddleware from './orderByMiddleware'
import validUrlMiddleware from './validUrlMiddleware'
import notificationsMiddleware from './notifications'
import rocketChatMiddleware from './rocketChat'

export default schema => {
  let middleware = [
    passwordMiddleware,
    dateTimeMiddleware,
    validUrlMiddleware,
    sluggifyMiddleware,
    excerptMiddleware,
    notificationsMiddleware,
    xssMiddleware,
    fixImageUrlsMiddleware,
    softDeleteMiddleware,
    userMiddleware,
    includedFieldsMiddleware,
    orderByMiddleware,
    rocketChatMiddleware
  ]

  // add permisions middleware at the first position (unless we're seeding)
  // NOTE: DO NOT SET THE PERMISSION FLAT YOUR SELF
  if (process.env.NODE_ENV !== 'production') {
    const DISABLED_MIDDLEWARES = process.env.DISABLED_MIDDLEWARES || ''
    const disabled = DISABLED_MIDDLEWARES.split(',')
    if (!disabled.includes('activityPub')) middleware.unshift(activityPubMiddleware)
    if (!disabled.includes('permissions')) middleware.unshift(permissionsMiddleware.generate(schema))
  }
  return middleware
}
