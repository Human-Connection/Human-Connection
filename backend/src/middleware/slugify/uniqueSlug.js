import slugify from 'slug'

const germanUmlauts = {
  Ä: 'Ae',
  ä: 'ae',
  Ö: 'Oe',
  ö: 'oe',
  Ü: 'Ue',
  ü: 'ue',
}

// `slug` replaces its default charmap with the one passed in instead of merging
// the two, so the defaults have to be spread in to keep every other
// transliteration (cyrillic, vietnamese, currency symbols, …) working.
const charmap = { ...slugify.charmap, ...germanUmlauts }

export default async function uniqueSlug(string, isUnique) {
  // Clients may submit umlauts decomposed (ä as "a" + U+0308, which macOS
  // produces). Those combining marks match no charmap entry and get stripped as
  // disallowed characters, so compose them first.
  const normalized = String(string || 'anonymous').normalize('NFC')
  const slug = slugify(normalized, {
    lower: true,
    charmap,
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
