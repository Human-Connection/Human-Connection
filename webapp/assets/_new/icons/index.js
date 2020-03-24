const svgFileList = require.context('./svgs', true, /\.svg/)
const icons = {}
const iconNames = []

svgFileList.keys().forEach((fileName) => {
  const svgCode = svgFileList(fileName)
  const iconName = fileName.replace('./', '').replace('.svg', '')
  icons[iconName] = svgCode
  iconNames.push(iconName)
})

export { iconNames }
export default icons
