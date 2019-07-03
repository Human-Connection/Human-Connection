import { cleanDatabase } from './factories'

if (process.env.NODE_ENV === 'production') {
  throw new Error(`You cannot clean the database in production environment!`)
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
