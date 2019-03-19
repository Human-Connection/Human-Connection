import { createSignature, verifySignature } from '.'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'
import { GraphQLClient } from 'graphql-request'
import crypto from 'crypto'
import { expect } from 'chai'
const factory = Factory()

describe('Signature creation and verification', () => {
  let user = null
  let client = null
  const headers = {
    'Date': '2019-03-08T14:35:45.759Z',
    'Host': 'democracy-app.de',
    'Content-Type': 'application/json'
  }

  beforeEach(async () => {
    await factory.create('User', {
      'slug': 'test-user',
      'name': 'Test User',
      'email': 'user@example.org',
      'password': 'swordfish'
    })
    const headers = await login({ email: 'user@example.org', password: 'swordfish' })
    client = new GraphQLClient(host, { headers })
    const result = await client.request(`query {
      User(slug: "test-user") {
        privateKey
        publicKey
      }
    }`)
    user = result.User[0]
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('Signature creation', () => {
    let signatureB64 = ''
    beforeEach(() => {
      const signer = crypto.createSign('rsa-sha256')
      signer.update('(request-target): post /activitypub/users/max/inbox\ndate: 2019-03-08T14:35:45.759Z\nhost: democracy-app.de\ncontent-type: application/json')
      signatureB64 = signer.sign({ key: user.privateKey, passphrase: 'a7dsf78sadg87ad87sfagsadg78' }, 'base64')
    })
    it('creates a Signature with given privateKey, keyId, url and headers (default algorithm: "rsa-sha256")', () => {
      const httpSignature = createSignature(user.privateKey, 'https://human-connection.org/activitypub/users/lea#main-key', 'https://democracy-app.de/activitypub/users/max/inbox', headers)

      expect(httpSignature).to.contain('keyId="https://human-connection.org/activitypub/users/lea#main-key"')
      expect(httpSignature).to.contain('algorithm="rsa-sha256"')
      expect(httpSignature).to.contain('headers="(request-target) date host content-type"')
      expect(httpSignature).to.contain('signature="' + signatureB64 + '"')
    })
  })

  describe('Signature verification', () => {
    let httpSignature = ''
    beforeEach(() => {
      httpSignature = createSignature(user.privateKey, 'http://localhost:4001/activitypub/users/test-user#main-key', 'https://democracy-app.de/activitypub/users/max/inbox', headers)
    })

    it('verifies a Signature correct', async () => {
      headers['Signature'] = httpSignature
      const isVerified = await verifySignature('https://democracy-app.de/activitypub/users/max/inbox', headers)
      expect(isVerified).to.equal(true)
    })
  })
})
