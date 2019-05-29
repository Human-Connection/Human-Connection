import fs from 'fs'
import path from 'path'
import { mergeTypes } from 'merge-graphql-schemas'

const findGqlFiles = dir => {
  var results = []
  var list = fs.readdirSync(dir)
  list.forEach(file => {
    file = path.join(dir, file).toString('utf-8')
    var stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      // Recurse into a subdirectory
      results = results.concat(findGqlFiles(file))
    } else {
      if (file.split('.').pop() === 'gql') {
        // Is a gql file
        results.push(file)
      }
    }
  })
  return results
}

let typeDefs = []

findGqlFiles(__dirname).forEach(file => {
  typeDefs.push(fs.readFileSync(file).toString('utf-8'))
})

export default mergeTypes(typeDefs, { all: true })
