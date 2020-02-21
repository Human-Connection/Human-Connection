import crypto from 'crypto'
import request from 'request'
import { verifySignature } from '.'
import { pair, httpSignature } from '../../../constants/activitypub'
jest.mock('request')

let privateKey
let publicKey
let headers
const passphrase = 'a7dsf78sadg87ad87sfagsadg78'

describe('activityPub/security', () => {
  beforeEach(() => {
    privateKey = pair.privateKey
    publicKey = pair.publicKey
    headers = {
      Date: '2019-03-08T14:35:45.759Z',
      Host: 'democracy-app.de',
      'Content-Type': 'application/json',
    }
  })

  describe('createSignature', () => {
    describe('returned http signature', () => {
      let signatureB64
      beforeEach(() => {
        const signer = crypto.createSign('rsa-sha256')
        signer.update(
          '(request-target): post /activitypub/users/max/inbox\ndate: 2019-03-08T14:35:45.759Z\nhost: democracy-app.de\ncontent-type: application/json',
        )
        signatureB64 = signer.sign({ key: privateKey, passphrase }, 'base64')
      })

      it('contains keyId', () => {
        expect(httpSignature).toContain(
          'keyId="https://human-connection.org/activitypub/users/lea#main-key"',
        )
      })

      it('contains default algorithm "rsa-sha256"', () => {
        expect(httpSignature).toContain('algorithm="rsa-sha256"')
      })

      it('contains headers', () => {
        expect(httpSignature).toContain('headers="(request-target) date host content-type"')
      })

      it('contains signature', () => {
        expect(httpSignature).toContain('signature="' + signatureB64 + '"')
      })
    })
  })

  describe('verifySignature', () => {
    beforeEach(() => {
      const body = {
        publicKey: {
          id: 'https://localhost:4001/activitypub/users/test-user#main-key',
          owner: 'https://localhost:4001/activitypub/users/test-user',
          publicKeyPem: publicKey,
        },
      }

      const mockedRequest = jest.fn((_, callback) => callback(null, null, JSON.stringify(body)))
      request.mockImplementation(mockedRequest)
    })

    it('resolves false', async () => {
      await expect(
        verifySignature('https://democracy-app.de/activitypub/users/max/inbox', headers),
      ).resolves.toEqual(false)
    })

    describe('valid signature', () => {
      beforeEach(() => {
        headers.Signature = httpSignature
      })

      it('resolves true', async () => {
        await expect(
          verifySignature('https://democracy-app.de/activitypub/users/max/inbox', headers),
        ).resolves.toEqual(true)
      })
    })
  })
})
