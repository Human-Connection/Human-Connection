import isEmpty from 'lodash/isEmpty'

export default async ({ store, env, route, redirect }) => {
  let publicPages = env.publicPages
  // only affect non public pages
  if (publicPages.indexOf(route.name) >= 0) {
    return true
  }
  if (route.name === 'terms-and-conditions-confirm') return true // avoid endless loop

  if (store.getters['auth/termsAndConditionsAgreed']) return true

  let params = {}
  if (!isEmpty(route.path) && route.path !== '/') {
    params.path = route.path
  }

  return redirect('/terms-and-conditions-confirm', params)
}
