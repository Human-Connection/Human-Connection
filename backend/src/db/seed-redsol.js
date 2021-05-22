import faker from 'faker'
import sample from 'lodash/sample'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../server'
import Factory from '../db/factories'
import { getNeode, getDriver } from '../db/neo4j'
import { gql } from '../helpers/jest'

const languages = ['de', 'en', 'es', 'fr', 'it', 'pt', 'pl']

/* eslint-disable no-multi-spaces */
;(async function () {
  let authenticatedUser = null
  const driver = getDriver()
  const neode = getNeode()

  try {
    const { server } = createServer({
      context: () => {
        return {
          driver,
          neode,
          user: authenticatedUser,
        }
      },
    })
    const { mutate } = createTestClient(server)

    await Promise.all([
        Factory.build('location', {
            id: 'address.YY-VENEZUEL-2009051550-151',
            type: 'address',
            name: 'Ecuador',
            lng: -1.831239,
            lat: -7.818340599999990,
          })
    ])
  

} catch (err) {
    /* eslint-disable-next-line no-console */
    console.error(err)
    process.exit(1)
  }
})()
/* eslint-enable no-multi-spaces */