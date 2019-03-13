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

export default schema => {
  let middleware = [
    passwordMiddleware,
    dateTimeMiddleware,
    sluggifyMiddleware,
    excerptMiddleware,
    xssMiddleware,
    fixImageUrlsMiddleware,
    softDeleteMiddleware,
    userMiddleware,
    includedFieldsMiddleware
  ]

  // add permisions middleware at the first position (unless we're seeding)
  // NOTE: DO NOT SET THE PERMISSION FLAT YOUR SELF
  if (process.env.PERMISSIONS !== 'disabled' && process.env.NODE_ENV !== 'production') {
    middleware.unshift(permissionsMiddleware.generate(schema))
  }
  return middleware
}
