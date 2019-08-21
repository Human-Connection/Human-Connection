import isEmpty from 'lodash/isEmpty'
import { VERSION } from '~/pages/terms-and-conditions'

export default async ({ store, env, route, redirect }) => {
  let publicPages = env.publicPages
  // only affect non public pages
  if (publicPages.indexOf(route.name) >= 0) {
    return true
  }

  // await store.dispatch('auth/refreshJWT', 'authenticated middleware')
  const isAuthenticated = await store.dispatch('auth/check')

  // TODO: find a better solution to **reliably** get the user
  // having the encrypted JWT does not mean we have access to the user object
  const user = await store.getters['auth/user']

  const upToDate = user.termsAndConditionsAgreedVersion === VERSION

  if (isAuthenticated && upToDate) {
    return true // all good
  }

  // try to logout user
  // await store.dispatch('auth/logout', null, { root: true })

  // set the redirect path for after the login
  let params = {}
  if (!isEmpty(route.path) && route.path !== '/') {
    params.path = route.path
  }

  if (!upToDate) {
    return redirect('/terms-and-conditions-confirm', params)
  } else {
    return redirect('/login', params)
  }
}
