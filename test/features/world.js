// features/support/world.js
import { setWorldConstructor } from 'cucumber'
import request from 'request'
const debug = require('debug')('ea:test:world')

class CustomWorld {
  constructor () {
    // webfinger.feature
    this.lastResponses = []
    this.lastContentType = null
    this.lastInboxUrl = null
    this.lastActivity = null
    // object-article.feature
    this.statusCode = null
  }
  get (pathname) {
    return new Promise((resolve, reject) => {
      request(`http://localhost:4123/${this.replaceSlashes(pathname)}`, {
        headers: {
          'Accept': 'application/activity+json'
        }}, function (error, response, body) {
        if (!error) {
          debug(`get response = ${response.headers['content-type']}`)
          debug(`body = ${body}`)
          resolve({ lastResponse: body, lastContentType: response.headers['content-type'], statusCode: response.statusCode })
        } else {
          reject(error)
        }
      })
    })
  }

  replaceSlashes (pathname) {
    return pathname.replace(/^\/+/, '')
  }

  post (pathname, activity) {
    return new Promise((resolve, reject) => {
      request({
        url: `http://localhost:4123/${this.replaceSlashes(pathname)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/activity+json'
        },
        body: activity
      }, function (error, response, body) {
        if (!error) {
          debug(`post response = ${response.headers['content-type']}`)
          resolve({ lastResponse: body, lastContentType: response.headers['content-type'], statusCode: response.statusCode })
        } else {
          reject(error)
        }
      })
    })
  }
}

setWorldConstructor(CustomWorld)
