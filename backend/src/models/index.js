import fs from 'fs'
import path from 'path'

const models = {}
fs.readdirSync(__dirname).forEach(file => {
  file = path.join(__dirname, file).toString('utf-8')
  const name = path.basename(file, '.js')
  if (!/\.spec/.test(name) && path.extname(file) === '.js') {
    // Is a gql file
    models[name] = require(file)
  }
})
export default models
