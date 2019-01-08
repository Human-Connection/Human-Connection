const createServer = require('../../dist/server.js').default
let app

const setup = async function () {
  const server = createServer()
  app = await server.start({ port: 3123 })
}

const teardown = async function () {
  await app.close()
}

module.exports = {
  setup,
  teardown
}
