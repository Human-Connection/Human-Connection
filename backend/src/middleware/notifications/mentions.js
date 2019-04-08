const MENTION_REGEX = /\s@(\S+)/g

export function extractSlugs(content) {
  let slugs = []
  let match
  while ((match = MENTION_REGEX.exec(content)) != null) {
    slugs.push(match[1])
  }
  return slugs
}
