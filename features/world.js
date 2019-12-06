import { setWorldConstructor } from 'cucumber'
import request from 'request'

class CustomWorld {
  constructor () {
    // webFinger.feature
    this.lastResponses = []
    this.lastContentType = null
    this.lastInboxUrl = null
    this.lastActivity = null
    // object-article.feature
    this.statusCode = null
  }
  get (pathname) {
    return new Promise((resolve, reject) => {
      request(`http://localhost:4000/${this.replaceSlashes(pathname)}`, {
        headers: {
          'Accept': 'application/activity+json'
        }}, (error, response, body) => {
        if (!error) {
          resolve({
            lastResponse: body,
            lastContentType: response.headers['content-type'],
            statusCode: response.statusCode
          })
        } else {
          reject(error)
        }
      })
    })
  }

  replaceSlashes (pathname) {
    return pathname.replace(/^\/+/, '')
  }
}

setWorldConstructor(CustomWorld)
