import { fixImageURLs } from './fixImageUrlsMiddleware'

describe('fixImageURLs', () => {
  describe('image url of legacy alpha', () => {
    it('removes domain', () => {
      const url = 'https://api-alpha.human-connection.org/uploads/4bfaf9172c4ba03d7645108bbbd16f0a696a37d01eacd025fb131e5da61b15d9.png'
      expect(fixImageURLs(url)).toEqual('/uploads/4bfaf9172c4ba03d7645108bbbd16f0a696a37d01eacd025fb131e5da61b15d9.png')
    })
  })

  describe('image url of legacy staging', () => {
    it('removes domain', () => {
      const url = 'https://staging-api.human-connection.org/uploads/1b3c39a24f27e2fb62b69074b2f71363b63b263f0c4574047d279967124c026e.jpeg'
      expect(fixImageURLs(url)).toEqual('/uploads/1b3c39a24f27e2fb62b69074b2f71363b63b263f0c4574047d279967124c026e.jpeg')
    })
  })

  describe('object', () => {
    it('returns untouched', () => {
      const object = { some: 'thing' }
      expect(fixImageURLs(object)).toEqual(object)
    })
  })

  describe('some string', () => {
    it('returns untouched', () => {})
    const string = 'Yeah I\'m a String'
    expect(fixImageURLs(string)).toEqual(string)
  })
})
