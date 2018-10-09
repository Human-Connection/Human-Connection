// Get icons
const context = require.context('./svg', true, /\.svg/)

const iconNames = []
const icons = {}

context.keys().forEach(key => {
  const svg = context(key)
  const name = key.replace('./', '').replace('.svg', '')
  icons[name] = svg
  iconNames.push(name)
})

export { iconNames }

export default icons
