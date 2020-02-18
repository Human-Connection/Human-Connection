import encode from './encode'
import jwt from 'jsonwebtoken'
import CONFIG from './../config'

describe('encode', () => {
  let payload
  beforeEach(() => {
    payload = {
      name: 'Some body',
      slug: 'some-body',
      id: 'some-id',
    }
  })

  it('encodes a valided JWT bearer token', () => {
    const token = encode(payload)
    expect(token.split('.')).toHaveLength(3)
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET)
    expect(decoded).toEqual({
      name: 'Some body',
      slug: 'some-body',
      id: 'some-id',
      sub: 'some-id',
      aud: expect.any(String),
      iss: expect.any(String),
      iat: expect.any(Number),
      exp: expect.any(Number),
    })
  })

  describe('given sensitive data', () => {
    beforeEach(() => {
      payload = {
        ...payload,
        email: 'none-of-your-business@example.org',
        password: 'topsecret',
      }
    })

    it('does not encode sensitive data', () => {
      const token = encode(payload)
      expect(payload).toEqual({
        email: 'none-of-your-business@example.org',
        password: 'topsecret',
        name: 'Some body',
        slug: 'some-body',
        id: 'some-id',
      })
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET)
      expect(decoded).toEqual({
        name: 'Some body',
        slug: 'some-body',
        id: 'some-id',
        sub: 'some-id',
        aud: expect.any(String),
        iss: expect.any(String),
        iat: expect.any(Number),
        exp: expect.any(Number),
      })
    })
  })
})
