import { isEmpty } from 'lodash'

export default async ({ store, env, route, redirect }) => {
  let publicPages = env.publicPages
  // only affect non public pages
  if (publicPages.indexOf(route.name) >= 0) {
    return true
  }

  // await store.dispatch('auth/refreshJWT', 'authenticated middleware')
  const isAuthenticated = await store.dispatch('auth/check')
  if (isAuthenticated === true) {
    return true
  }

  // try to logout user
  // await store.dispatch('auth/logout', null, { root: true })

  // set the redirect path for after the login
  let params = {}
  if (!isEmpty(route.path) && route.path !== '/') {
    params.path = route.path
  }

  return redirect('/login', params)
}
