import passwordMiddleware from './passwordMiddleware'
import softDeleteMiddleware from './softDeleteMiddleware'
import sluggifyMiddleware from './sluggifyMiddleware'
import fixImageUrlsMiddleware from './fixImageUrlsMiddleware'
import excerptMiddleware from './excerptMiddleware'
import dateTimeMiddleware from './dateTimeMiddleware';
import xssMiddleware from './xssMiddleware';
import permissionsMiddleware from './permissionsMiddleware';

export default schema => {
  let middleware = [
    passwordMiddleware,
    dateTimeMiddleware,
    sluggifyMiddleware,
    excerptMiddleware,
    xssMiddleware,
    fixImageUrlsMiddleware,
    softDeleteMiddleware
  ]

  // add permisions middleware if we are not seeding to the first position
  // NOTE: DO NOT SET THE PERMISSION FLAT YOUR SELF
  if (process.env.PERMISSIONS !== 'disabled' && process.env.NODE_ENV !== 'production') {
    middleware.unshift(permissionsMiddleware.generate(schema))
  }
  return middleware
}
