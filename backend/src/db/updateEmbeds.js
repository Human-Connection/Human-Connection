import { build, replace } from 'xregexp'

const transformMatch = (content, match) => {
  let { before, embed, after } = match
  const wholeMatch = match.toString()
  const matchIsContentStart = content.indexOf(wholeMatch) === 0
  const matchIsContentEnd = content.indexOf(wholeMatch) === content.length - wholeMatch.length

  if (!matchIsContentStart && (before === '<p>' || (before.length > 3 && before.endsWith('<p>')))) {
    before = before.slice(0, before.length - 3)
  } else {
    before = `${before}</p>`
  }

  // add space for cursor between embeds
  embed = embed.replace('</a><a', '</a><p></p><a')

  if (after === '</p>' && !matchIsContentEnd) {
    after = ''
  } else {
    after = `<p>${after}`
  }

  return `${before}${embed}${after}`
}

export const transform = (content) => {
  const embedExpr = build(
    '({{before}})({{embed}})+({{after}})',
    {
      before: /^<p[^>]*?>[^>]*?$/,
      embed: /(<a[^>]*?class="embed".*?>(?:.*?)??<\/a>)+/,
      after: /.*?<\/p>/,
    },
    'gis',
  )

  let target = `${content}`
  let matches = embedExpr.test(target)
  const loopLimit = 10
  let loopCount = 0

  while (matches) {
    target = replace(target, embedExpr, transformMatch.bind(null, content))

    if (++loopCount === loopLimit) {
      const err = new Error(`[updateEmbed] Breaking loop after ${loopLimit} rounds`)
      err.job = {
        content,
        target,
        embedExpr,
      }
      throw err
    }

    matches = embedExpr.test(target)
  }

  return target
}
