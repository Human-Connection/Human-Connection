import { setWorldConstructor } from 'cucumber'
import axios from 'axios'

// import request from 'request'

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
      axios(`http://localhost:4000/${this.replaceSlashes(pathname)}`, {
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

  post (pathname, activity) {
    return new Promise((resolve, reject) => {
      axios({
        url: `http://localhost:4000/${this.replaceSlashes(pathname)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.parse(activity),
      })
      .then(response => {
        console.log('response', response)
        resolve({
          lastResponse: response.data,
          lastContentType: response.headers['content-type'],
          statusCode: response.status
        })
      })
      .catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log('data'. error.response.data);
          console.log('status', error.response.status);
          console.log('headers', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log('request', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log('config', error.config);
      })
    }) 
  }
}

setWorldConstructor(CustomWorld)
