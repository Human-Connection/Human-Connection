import slugify from 'slug'
export default function uniqueSlug (string, isUnique) {
  let slug = slugify(string, {
    lower: true
  })
  if (isUnique(slug)) return slug

  let count = 0
  let uniqueSlug
  do {
    count += 1
    uniqueSlug = `${slug}-${count}`
  } while (!isUnique(uniqueSlug))
  return uniqueSlug
}
