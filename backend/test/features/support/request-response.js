import { Then, When } from 'cucumber'
import { expect } from 'chai'

When('I send a GET request to {string}', async function (pathname) {
  const response = await this.get(pathname)
  this.lastContentType = response.lastContentType
  this.lastResponses.push(response.lastResponse)
  this.statusCode = response.statusCode
})

When('I send a POST request with the following activity to {string}:', async function (inboxUrl, activity) {
  this.lastInboxUrl = inboxUrl
  this.lastActivity = activity
  const response = await this.post(inboxUrl, activity)

  this.lastResponse = response.lastResponse
  this.statusCode = response.statusCode
})

Then('I receive the following json:', function (docString) {
  const parsedDocString = JSON.parse(docString)
  let parsedLastResponse = null
  if (this.lastResponses.length > 0) {
    parsedLastResponse = JSON.parse(this.lastResponses.shift())
  } else {
    parsedLastResponse = JSON.parse(this.lastResponse)
  }

  if (Array.isArray(parsedDocString.orderedItems)) {
    parsedDocString.orderedItems.forEach((el) => {
      delete el.id
      if (el.object) delete el.object.published
    })
    parsedLastResponse.orderedItems.forEach((el) => {
      delete el.id
      if (el.object) delete el.object.published
    })
  }
  if (parsedDocString.publicKey && parsedDocString.publicKey.publicKeyPem) {
    delete parsedDocString.publicKey.publicKeyPem
    delete parsedLastResponse.publicKey.publicKeyPem
  }
  if (parsedLastResponse.orderedItems) {
    parsedLastResponse.orderedItems.map((item) => {
      if (item.type === 'Update') {
        if ('updated' in item.object) {
          delete item.object.updated
          delete item.object.updated
        } else {
          expect(true).to.equal(false)
        }
      }
    })
  }
  expect(parsedLastResponse).to.eql(parsedDocString)
})
