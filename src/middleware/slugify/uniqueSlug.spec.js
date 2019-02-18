import uniqueSlug from './uniqueSlug'

describe('uniqueSlug', () => {
  it('slugifies given string', () => {
    const string = 'Hello World'
    const isUnique = () => true
    expect(uniqueSlug(string, isUnique)).toEqual('hello-world')
  })

  it('increments slugified string until unique', () => {
    const string = 'Hello World'
    const isUnique = jest.fn()
    isUnique
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
    expect(uniqueSlug(string, isUnique)).toEqual('hello-world-1')
  })
})
