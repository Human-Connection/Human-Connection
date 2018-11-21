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
  if (process.env.PERMISSIONS !== 'disabled') {
    middleware.push(permissionsMiddleware.generate(schema))
  }
  return middleware
}
