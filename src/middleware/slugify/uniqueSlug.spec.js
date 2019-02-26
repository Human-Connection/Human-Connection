import uniqueSlug from './uniqueSlug'

describe('uniqueSlug', () => {
  it('slugifies given string', () => {
    const string = 'Hello World'
    const isUnique = jest.fn()
      .mockResolvedValue(true)
    expect(uniqueSlug(string, isUnique)).resolves.toEqual('hello-world')
  })

  it('increments slugified string until unique', () => {
    const string = 'Hello World'
    const isUnique = jest.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
    expect(uniqueSlug(string, isUnique)).resolves.toEqual('hello-world-1')
  })
})
