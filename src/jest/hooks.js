const createServer = require('../../dist/server.js').default
let app
let permissionlessApp

const setup = async function () {
  const server = createServer()
  app = await server.start({ port: 4123 })

  const permissionless = createServer()
  permissionlessApp = await server.start({ port: 4001 })
}

const teardown = async function () {
  await app.close()
  await permissionlessApp.close()
}

module.exports = {
  setup,
  teardown
}
