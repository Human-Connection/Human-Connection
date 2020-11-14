import slugify from 'slug'
export default async function uniqueSlug(string, isUnique) {
  const slug = slugify(string || 'anonymous', {
    lower: true,
    charmap: {
      Ä: 'ae',
      ä: 'ae',
      Ö: 'oe',
      ö: 'oe',
      Ü: 'ue',
      ü: 'ue',
    },
  })
  if (await isUnique(slug)) return slug

  let count = 0
  let uniqueSlug
  do {
    count += 1
    uniqueSlug = `${slug}-${count}`
  } while (!(await isUnique(uniqueSlug)))
  return uniqueSlug
}
