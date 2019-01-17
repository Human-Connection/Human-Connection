const { spawn } = require('child_process')
const waitOn = require('wait-on')

let server
let seeder

const setup = async function () {
  server = spawn('babel-node', ['src/index'], {
    env: Object.assign({}, process.env, {
      GRAPHQL_URI: 'http://localhost:4123',
      GRAPHQL_PORT: '4123'
    })
  })

  seeder = spawn('babel-node', ['src/index'], {
    env: Object.assign({}, process.env, {
      GRAPHQL_URI: 'http://localhost:4001',
      GRAPHQL_PORT: '4001',
      PERMISSIONS: 'disabled'
    })
  })

  server.stdout.on('data', data => console.log(`server stdout:\n${data}`))
  server.stderr.on('data', data => console.log(`server stderr:\n${data}`))
  seeder.stdout.on('data', data => console.log(`seeder stdout:\n${data}`))
  seeder.stderr.on('data', data => console.log(`seeder stderr:\n${data}`))

  try {
    await waitOn({
      resources: ['http://localhost:4123', 'http://localhost:4001']
    })
  } catch (err) {
    console.log(err)
  }
}

const teardown = async function () {
  server.kill()
  seeder.kill()
}

module.exports = {
  setup,
  teardown
}
