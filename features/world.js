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
          signature: 'keyId="https://aronda.org/marvin-the-martian#main-key",algorithm="rsa-sha256",headers="(request-target) date host content-type",signature="UaGNLhfyCVewd35Wg8/hhpk1qtjiBAPhHo0o/xWNUVsv5XuCisT5fYEetHWGGCnYufUbtY5/4nFY1i+3cHiDMU0DuBTYtz4ByIKhXcoewXlZPrnEIUBZ2yOjml4efFDonPt3Nsjrjy19D6CspyiOJPcgh0BGSitRg3p2qVLAUHnit0Zy+IzJBpvTfzzMWXlM61cF7OZrSpsy58jHJN6Qy5zKLhyJKfAZttRYtsfTuB4v445lLAsfiq7N5bbigx9nNrmxME2yZ+2EHZ0fkAWkuEmTMxeqJEAQrHlW3bY9+T2/NCchTP/tzdgq4yEXyBs/UVHGz75DdOzk48vQRObikmMl3LAu1s/7TdUztm6oDYWrFXSmCqtYedZF2VhneYXy6gn5m+q16VZovXXIARWbGIVnvXii0GrCGhSNUbZ5Ah2E/Id5FeLxJ/LyBAs3emWe60ERF7d5bTRrPNaxsfmlrSXnT2o3J6Fr97EbeQ+R0JGYC//Q0sOoqtCIUg5lOaEFW3b91ynDdFETDafDPmTPnntSWcUIc/7Ju0DR8Pvb06v/rRkeehBS0/MNzHThrmAB5UiaG8gR/P2GtcRzOHvZ4dBTFX5LTNNkpIDRqYsXuJxN3/XK8yHIBtHMb232EECn14CHoDASKmPWv3pzdqDumrcFSVLKHAONCobwkJbmlEA="'
        },
        data: JSON.parse(activity),
      })
      .then(response => {
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
