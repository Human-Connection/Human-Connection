const fs = require('fs')
const path = require('path')

const { gql } = require('apollo-server')

module.exports = gql(fs
  .readFileSync(path.join(__dirname, 'schema.graphql'))
  .toString('utf-8'))
