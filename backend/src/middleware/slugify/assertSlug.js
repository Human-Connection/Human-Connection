import { UserInputError } from 'apollo-server'

export const SLUG_PATTERN = /^[a-z0-9_-]+$/

export const SLUG_FORMAT_ERROR =
  'Allowed characters are only lowercase letters, numbers, underscores and hyphens.'

export const isUniqueFor = (context, type, { exceptId } = {}) => {
  return async (slug) => {
    const session = context.driver.session()
    try {
      const existingSlug = await session.readTransaction((transaction) => {
        const query = exceptId
          ? `
            MATCH (p:${type} {slug: $slug})
            WHERE p.id <> $exceptId
            RETURN p.slug
          `
          : `
            MATCH (p:${type} {slug: $slug})
            RETURN p.slug
          `
        return transaction.run(query, { slug, exceptId })
      })
      return existingSlug.records.length === 0
    } finally {
      session.close()
    }
  }
}

export function normalizeClientSlug(slug) {
  if (typeof slug !== 'string' || slug.length === 0) return slug
  const normalized = slug.normalize('NFC').toLowerCase()
  if (!SLUG_PATTERN.test(normalized)) {
    throw new UserInputError(SLUG_FORMAT_ERROR)
  }
  return normalized
}

export async function assertClientSlug(args, context, type, { exceptId } = {}) {
  if (typeof args.slug !== 'string' || args.slug.length === 0) return
  args.slug = normalizeClientSlug(args.slug)
  if (!(await isUniqueFor(context, type, { exceptId })(args.slug))) {
    throw new UserInputError(`${type} with this slug already exists!`)
  }
}
