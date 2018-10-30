import passwordMiddleware from './passwordMiddleware'
import softDeleteMiddleware from './softDeleteMiddleware'
import sluggifyMiddleware from './sluggifyMiddleware'
import fixImageUrlsMiddleware from './fixImageUrlsMiddleware'
import excerptMiddleware from './excerptMiddleware'
import dateTimeMiddleware from './dateTimeMiddleware';
import xssMiddleware from './xssMiddleware';
import permissionsMiddleware from './permissionsMiddleware';

export default schema => [
  permissionsMiddleware.generate(schema),
  passwordMiddleware,
  dateTimeMiddleware,
  sluggifyMiddleware,
  excerptMiddleware,
  xssMiddleware,
  fixImageUrlsMiddleware,
  softDeleteMiddleware
]
