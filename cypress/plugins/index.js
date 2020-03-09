// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)


const cucumber = require('cypress-cucumber-preprocessor').default
const dotenv = require('dotenv')

module.exports = (on, config) => {
  // (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const { parsed } = dotenv.config({ path: require.resolve('../../backend/.env') })
  config.env.NEO4J_URI = parsed.NEO4J_URI
  config.env.NEO4J_USERNAME = parsed.NEO4J_USERNAME
  config.env.NEO4J_PASSWORD = parsed.NEO4J_PASSWORD
  config.env.JWT_SECRET = parsed.JWT_SECRET
  on('file:preprocessor', cucumber())
  return config
}
