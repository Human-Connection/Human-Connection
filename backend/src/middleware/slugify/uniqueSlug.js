import slugify from 'slug'
export default async function uniqueSlug (string, isUnique) {
  let slug = slugify(string, {
    lower: true
  })
  if (await isUnique(slug)) return slug

  let count = 0
  let uniqueSlug
  do {
    count += 1
    uniqueSlug = `${slug}-${count}`
  } while (!await isUnique(uniqueSlug))
  return uniqueSlug
}

export function isUniqueFor(context, type) {
  return async slug => {
    const session = context.driver.session()
    const response = await session.run(
      `MATCH(p:${type} {slug: $slug }) return p.slug`,
      {
        slug
      }
    )
    session.close()
    return response.records.length === 0
  }
}
