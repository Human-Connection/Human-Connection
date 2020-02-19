import express from 'express'
import cors from 'cors'

const debug = require('debug')('ea:inbox')

export async function handler(req, res) {
  debug(`Content-Type = ${req.get('Content-Type')}`)
  debug(`body = ${JSON.stringify(req.body, null, 2)}`)
  debug(`Request headers = ${JSON.stringify(req.headers, null, 2)}`)
  // switch (req.body.type) {
  //   case 'Delete':
  //     await handleDeleteActivity(activity) {
  //       debug('inside delete')
  //       switch (activity.object.type) {
  //         case 'Article':
  //         case 'Note':
  //           return this.dataSource.deletePost(activity)
  //         default:
  //       }
  //     }
  //     break
  // }
  res.status(200).end()
}

export default function() {
  const router = express.Router()
  router.use('/inbox', cors(), express.urlencoded({ extended: true }), handler)
  return router
}
