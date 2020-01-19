import { getDriver, getNeode } from '../../db/neo4j'

class Store {
  async init(fn) {
    const neode = getNeode()
    await getNeode().schema.install()
    // eslint-disable-next-line no-console
    console.log('Successfully created database indices and constraints!')
    neode.driver.close()
  }

  async load(fn) {
    const driver = getDriver()
    const session = driver.session()
    const readTxResultPromise = session.readTransaction(async txc => {
      const result = await txc.run(
        'MATCH (migration:Migration) RETURN migration {.*} ORDER BY migration.timestamp DESC',
      )
      return result.records.map(r => r.get('migration'))
    })
    try {
      const migrations = await readTxResultPromise
      if (migrations.length <= 0) {
        // eslint-disable-next-line no-console
        console.log(
          "No migrations found in database. If it's the first time you run migrations, then this is normal.",
        )
        return fn(null, {})
      }
      const [{ title: lastRun }] = migrations
      fn(null, { lastRun, migrations })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    } finally {
      session.close()
    }
  }

  async save(set, fn) {
    const driver = getDriver()
    const session = driver.session()
    const { migrations } = set
    const writeTxResultPromise = session.writeTransaction(txc => {
      return Promise.all(
        migrations.map(migration => {
          const { title, description, timestamp } = migration
          const properties = { title, description, timestamp }
          return txc.run('CREATE (migration:Migration) SET migration += $properties', {
            properties,
          })
        }),
      )
    })
    try {
      await writeTxResultPromise
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    } finally {
      session.close()
      fn()
    }
  }
}

module.exports = Store
