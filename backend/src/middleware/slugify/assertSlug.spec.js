import { UserInputError } from 'apollo-server'
import { assertClientSlug, normalizeClientSlug, SLUG_FORMAT_ERROR } from './assertSlug'

const contextWithRecords = (records) => ({
  driver: {
    session: () => ({
      readTransaction: async (work) =>
        work({
          run: async () => ({ records }),
        }),
      close: () => {},
    }),
  },
})

describe('normalizeClientSlug', () => {
  it('returns empty or non-string values unchanged', () => {
    expect(normalizeClientSlug('')).toEqual('')
    expect(normalizeClientSlug(undefined)).toEqual(undefined)
    expect(normalizeClientSlug(null)).toEqual(null)
  })

  it('composes to NFC and lowercases', () => {
    expect(normalizeClientSlug('Sandra-Maertens')).toEqual('sandra-maertens')
    const decomposed = 'sandra-maertens'.normalize('NFD')
    expect(normalizeClientSlug(decomposed)).toEqual('sandra-maertens')
  })

  it('rejects characters outside the slug pattern', () => {
    expect(() => normalizeClientSlug('mätt')).toThrow(UserInputError)
    expect(() => normalizeClientSlug('mätt')).toThrow(SLUG_FORMAT_ERROR)
    expect(() => normalizeClientSlug('hello world')).toThrow(SLUG_FORMAT_ERROR)
  })
})

describe('assertClientSlug', () => {
  it('does nothing when slug is omitted', async () => {
    const args = { name: 'Sandra Märtens' }
    await assertClientSlug(args, contextWithRecords([]), 'User')
    expect(args.slug).toBeUndefined()
  })

  it('writes the normalized slug back onto args', async () => {
    const args = { slug: 'Sandra-Maertens' }
    await assertClientSlug(args, contextWithRecords([]), 'User')
    expect(args.slug).toEqual('sandra-maertens')
  })

  it('rejects a slug that is already taken', async () => {
    const args = { slug: 'taken-slug' }
    await expect(
      assertClientSlug(args, contextWithRecords([{}]), 'User'),
    ).rejects.toThrow('User with this slug already exists!')
  })
})
