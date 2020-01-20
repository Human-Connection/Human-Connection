import { getDriver, getNeode } from '../../db/neo4j'

class Store {
  async init(fn) {
    const neode = getNeode()
    const { driver } = neode
    const session = driver.session()
    // eslint-disable-next-line no-console
    const writeTxResultPromise = session.writeTransaction(async txc => {
      await txc.run('CALL apoc.schema.assert({},{},true)') // drop all indices
      return Promise.all([
        'CALL db.index.fulltext.createNodeIndex("post_fulltext_search",["Post"],["title", "content"])',
        'CALL db.index.fulltext.createNodeIndex("user_fulltext_search",["User"],["name", "slug"])'
      ].map(statement => txc.run(statement)))
    })
    try {
      await writeTxResultPromise
      await getNeode().schema.install()
      console.log('Successfully created database indices and constraints!')
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    } finally {
      session.close()
      driver.close()
      fn()
    }
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
