const svgFileList = require.context('./svgs', true, /\.svg/)
const icons = {}

svgFileList.keys().forEach(fileName => {
  const svgCode = svgFileList(fileName)
  const iconName = fileName.replace('./', '').replace('.svg', '')
  icons[iconName] = svgCode
})

export default icons
