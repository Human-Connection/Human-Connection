import { exec, build } from 'xregexp/xregexp-all.js'

export default async ({ store, env, route, redirect }) => {
  let publicPages = env.publicPages
  // only affect non public pages
  if (publicPages.indexOf(route.name) >= 0) {
    return true
  }

  const regX = build('^/search/hashtag/((\\pL+[\\pL0-9]*)|([0-9]+\\pL+[\\pL0-9]*))$')
  const matchHashtag = route.fullPath ? exec(decodeURI(route.fullPath), regX) : null

  if (!matchHashtag) return true

  return redirect(`/?hashtag=${encodeURI(matchHashtag[1])}`)
}
