import { cleanDatabase } from './factories'
import dotenv from 'dotenv'

dotenv.config()

if (process.env.NODE_ENV === 'production') {
  throw new Error(`YOU CAN'T CLEAN THE DATABASE WITH NODE_ENV=${process.env.NODE_ENV}`)
}

(async function () {
  try {
    await cleanDatabase()
    console.log('Successfully deleted all nodes and relations!')
    process.exit(0)
  } catch (err) {
    console.log(`Error occurred deleting the nodes and relations (reset the db)\n\n${err}`)
    process.exit(1)
  }
})()
