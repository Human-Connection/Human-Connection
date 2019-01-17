const { spawn } = require('child_process')
const waitOn = require('wait-on')

let server
let seeder

const setup = async function () {
  server = spawn('node', ['dist/'], {
    env: Object.assign({}, process.env, {
      GRAPHQL_URI: 'http://localhost:4123',
      GRAPHQL_PORT: '4123'
    })
  })

  seeder = spawn('node', ['dist/'], {
    env: Object.assign({}, process.env, {
      GRAPHQL_URI: 'http://localhost:4001',
      GRAPHQL_PORT: '4001',
      PERMISSIONS: 'disabled'
    })
  })

  try {
    await waitOn({
      resources: ['http://localhost:4123', 'http://localhost:4001']
    })
  } catch (err) {
    console.log(err)
  }
}

const teardown = async function () {
  [server, seeder].forEach(app => app.kill())
}

module.exports = {
  setup,
  teardown
}
