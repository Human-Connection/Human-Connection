import { UserInputError } from 'apollo-server'
import {
  SLUG_FORMAT_ERROR,
  SLUG_PATTERN,
  assertClientSlug,
  isUniqueFor,
  normalizeClientSlug,
} from './assertSlug'
import validation from '../validation/validationMiddleware'
import uniqueSlug from './uniqueSlug'

let lastQuery
let lastParams

const contextWithRecords = (records = []) => ({
  driver: {
    session: () => ({
      readTransaction: async (work) =>
        work({
          run: async (query, params) => {
            lastQuery = query
            lastParams = params
            return { records }
          },
        }),
      close: () => {},
    }),
  },
})

// Simulates a DB where `ownerId` already owns the requested slug. A query that
// excludes that id (self-collision guard) returns no rows; any other query
// reports a collision. This fails if UpdateUser forgets exceptId.
const contextWhereSlugOwnedBy = (ownerId) => ({
  driver: {
    session: () => ({
      readTransaction: async (work) =>
        work({
          run: async (query, params) => {
            lastQuery = query
            lastParams = params
            const excludesOwner = /exceptId/.test(query) && params.exceptId === ownerId
            return { records: excludesOwner ? [] : [{}] }
          },
        }),
      close: () => {},
    }),
  },
})

const resolve = jest.fn(async (_root, args) => args)

beforeEach(() => {
  lastQuery = undefined
  lastParams = undefined
  resolve.mockClear()
})

describe('SLUG_PATTERN', () => {
  it.each(['sandra-maertens', 'john_doe', 'user-1', 'a', 'abc-def_ghi'])(
    'accepts %s',
    (slug) => {
      expect(SLUG_PATTERN.test(slug)).toBe(true)
    },
  )

  it.each(['mätt', 'Hello World', 'Hello-World', 'sandra.maertens', 'foo/bar', ''])(
    'rejects %s',
    (slug) => {
      expect(SLUG_PATTERN.test(slug)).toBe(false)
    },
  )
})

describe('normalizeClientSlug', () => {
  it('leaves empty and non-string values unchanged so generation can run', () => {
    expect(normalizeClientSlug('')).toEqual('')
    expect(normalizeClientSlug(undefined)).toEqual(undefined)
    expect(normalizeClientSlug(null)).toEqual(null)
  })

  it('normalizes to NFC and lowercase', () => {
    expect(normalizeClientSlug('Sandra-Maertens')).toEqual('sandra-maertens')
  })

  it('treats decomposed (NFD) input like composed (NFC) input', () => {
    const composed = 'sandra-maertens'
    const decomposed = composed.normalize('NFD')
    expect(normalizeClientSlug(decomposed)).toEqual(normalizeClientSlug(composed))
  })

  it('rejects umlauts instead of transliterating them', () => {
    const nfc = 'mätt'.normalize('NFC')
    const nfd = 'mätt'.normalize('NFD')
    expect(() => normalizeClientSlug(nfc)).toThrow(SLUG_FORMAT_ERROR)
    expect(() => normalizeClientSlug(nfd)).toThrow(SLUG_FORMAT_ERROR)
  })

  it('rejects spaces, dots and mixed case after lowercasing still invalid characters', () => {
    expect(() => normalizeClientSlug('hello world')).toThrow(UserInputError)
    expect(() => normalizeClientSlug('hello.world')).toThrow(SLUG_FORMAT_ERROR)
  })
})

describe('isUniqueFor', () => {
  it('is unique when no node matches', async () => {
    await expect(isUniqueFor(contextWithRecords([]), 'User')('new-slug')).resolves.toBe(true)
    expect(lastParams).toEqual({ slug: 'new-slug', exceptId: undefined })
  })

  it('is not unique when a node matches', async () => {
    await expect(isUniqueFor(contextWithRecords([{}]), 'Post')('taken')).resolves.toBe(false)
  })

  it('excludes the current record when exceptId is set', async () => {
    await isUniqueFor(contextWithRecords([]), 'User', { exceptId: 'user-1' })('my-slug')
    expect(lastQuery).toMatch(/WHERE p\.id <> \$exceptId/)
    expect(lastParams).toEqual({ slug: 'my-slug', exceptId: 'user-1' })
  })
})

describe('assertClientSlug', () => {
  it('does nothing when slug is omitted, empty or not a string', async () => {
    const omitted = { name: 'Sandra Märtens' }
    await assertClientSlug(omitted, contextWithRecords([]), 'User')
    expect(omitted.slug).toBeUndefined()

    const empty = { slug: '' }
    await assertClientSlug(empty, contextWithRecords([]), 'User')
    expect(empty.slug).toEqual('')

    const numeric = { slug: 123 }
    await assertClientSlug(numeric, contextWithRecords([]), 'User')
    expect(numeric.slug).toEqual(123)
  })

  it('writes NFC-lowercased slug back onto args', async () => {
    const args = { slug: 'Sandra-Maertens' }
    await assertClientSlug(args, contextWithRecords([]), 'User')
    expect(args.slug).toEqual('sandra-maertens')
  })

  it('uses the resource type in the uniqueness error', async () => {
    await expect(
      assertClientSlug({ slug: 'taken' }, contextWithRecords([{}]), 'User'),
    ).rejects.toThrow('User with this slug already exists!')
    await expect(
      assertClientSlug({ slug: 'taken' }, contextWithRecords([{}]), 'Post'),
    ).rejects.toThrow('Post with this slug already exists!')
  })
})

describe('validationMiddleware slug hooks', () => {
  const call = (mutation, args, records = []) =>
    validation.Mutation[mutation](resolve, {}, args, contextWithRecords(records), {})

  describe('SignupVerification', () => {
    it('allows omitting slug so uniqueSlug can generate one', async () => {
      const args = { name: 'Sandra Märtens' }
      await call('SignupVerification', args)
      expect(args.slug).toBeUndefined()
      expect(resolve).toHaveBeenCalled()
    })

    it('rejects an invalid client slug', async () => {
      await expect(call('SignupVerification', { slug: 'mätt' })).rejects.toThrow(SLUG_FORMAT_ERROR)
      expect(resolve).not.toHaveBeenCalled()
    })

    it('normalizes a valid client slug', async () => {
      const args = { slug: 'Sandra-Maertens' }
      await call('SignupVerification', args)
      expect(args.slug).toEqual('sandra-maertens')
    })

    it('rejects a duplicate client slug', async () => {
      await expect(call('SignupVerification', { slug: 'taken' }, [{}])).rejects.toThrow(
        'User with this slug already exists!',
      )
    })
  })

  describe('CreatePost', () => {
    const validPost = { title: 'Hello', content: 'body', categoryIds: ['cat9'] }

    it('rejects an invalid client slug', async () => {
      await expect(call('CreatePost', { ...validPost, slug: 'Hello World' })).rejects.toThrow(
        SLUG_FORMAT_ERROR,
      )
    })

    it('rejects a duplicate client slug', async () => {
      await expect(call('CreatePost', { ...validPost, slug: 'taken' }, [{}])).rejects.toThrow(
        'Post with this slug already exists!',
      )
    })

    it('accepts a unique canonical slug', async () => {
      const args = { ...validPost, slug: 'hello-world' }
      await call('CreatePost', args)
      expect(args.slug).toEqual('hello-world')
      expect(resolve).toHaveBeenCalled()
    })
  })

  describe('UpdatePost', () => {
    it('excludes the current post from uniqueness', async () => {
      const args = { id: 'post-1', slug: 'my-post', title: 'My post', content: 'body' }
      await call('UpdatePost', args)
      expect(lastQuery).toMatch(/WHERE p\.id <> \$exceptId/)
      expect(lastParams.exceptId).toEqual('post-1')
    })

    it('rejects a slug taken by another post', async () => {
      await expect(
        call('UpdatePost', { id: 'post-1', slug: 'taken' }, [{}]),
      ).rejects.toThrow('Post with this slug already exists!')
    })
  })

  describe('UpdateUser', () => {
    it('still enforces the name minimum length', async () => {
      await expect(call('UpdateUser', { id: 'user-1', name: '  ' })).rejects.toThrow(
        'Username must be at least 3 character long!',
      )
    })

    it('excludes the current user from uniqueness', async () => {
      const args = { id: 'user-1', slug: 'john-doe' }
      await call('UpdateUser', args)
      expect(lastParams).toEqual({ slug: 'john-doe', exceptId: 'user-1' })
    })

    it('allows a user to resubmit their own unchanged slug', async () => {
      const args = { id: 'user-mueller', slug: 'mueller', name: 'Müller' }
      await validation.Mutation.UpdateUser(
        resolve,
        {},
        args,
        contextWhereSlugOwnedBy('user-mueller'),
        {},
      )
      expect(resolve).toHaveBeenCalled()
    })

    it('still rejects a slug that belongs to a different user', async () => {
      await expect(
        validation.Mutation.UpdateUser(
          resolve,
          {},
          { id: 'user-other', slug: 'mueller', name: 'Someone Else' },
          contextWhereSlugOwnedBy('user-mueller'),
          {},
        ),
      ).rejects.toThrow('User with this slug already exists!')
    })

    it('rejects umlauts in a client-supplied slug', async () => {
      await expect(call('UpdateUser', { id: 'user-1', slug: 'mätt' })).rejects.toThrow(
        SLUG_FORMAT_ERROR,
      )
    })
  })
})

describe('generated slugs still expand umlauts', () => {
  const isUnique = jest.fn().mockResolvedValue(true)

  it('turns a German name into a canonical unique slug', async () => {
    await expect(uniqueSlug('Sandra Märtens', isUnique)).resolves.toEqual('sandra-maertens')
    expect(SLUG_PATTERN.test('sandra-maertens')).toBe(true)
  })

  it('expands decomposed umlauts the same way', async () => {
    await expect(uniqueSlug('Sandra Märtens'.normalize('NFD'), isUnique)).resolves.toEqual(
      'sandra-maertens',
    )
  })
})
