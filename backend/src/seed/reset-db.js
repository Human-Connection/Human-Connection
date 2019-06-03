import { cleanDatabase } from './factories'
import dotenv from 'dotenv'
import CONFIG from './config'

dotenv.config()

if (!CONFIG.DEBUG) {
  throw new Error(`YOU CAN'T CLEAN THE DATABASE WITH DEBUG=${CONFIG.DEBUG}`)
}

;(async function() {
  try {
    await cleanDatabase()
    console.log('Successfully deleted all nodes and relations!') // eslint-disable-line no-console
    process.exit(0)
  } catch (err) {
    console.log(`Error occurred deleting the nodes and relations (reset the db)\n\n${err}`) // eslint-disable-line no-console
    process.exit(1)
  }
})()
