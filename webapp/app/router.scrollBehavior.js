export default function (to, from, savedPosition) {
  if (savedPosition) return savedPosition

  // Edge case: If you click on a notification from a comment and then on the
  // post page you click on 'comments', we avoid a "jumping" scroll behavior,
  // ie. jump to the top and scroll back from there
  if (to.path === from.path && to.hash !== from.hash) return false

  return { x: 0, y: 0 }
}
