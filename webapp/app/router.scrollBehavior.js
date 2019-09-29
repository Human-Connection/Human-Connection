export default function(to, from, savedPosition) {
  let position = { x: 0, y: 0 }
  if (savedPosition) {
    position = savedPosition
  }
  return position
}
