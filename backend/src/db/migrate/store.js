import { getDriver, getNeode } from '../../db/neo4j'

class Store {
  async init(next) {
    const neode = getNeode()
    const { driver } = neode
    const session = driver.session()
    // eslint-disable-next-line no-console
    const writeTxResultPromise = session.writeTransaction(async (txc) => {
      await txc.run('CALL apoc.schema.assert({},{},true)') // drop all indices
      return Promise.all(
        [
          'CALL db.index.fulltext.createNodeIndex("post_fulltext_search",["Post"],["title", "content"])',
          'CALL db.index.fulltext.createNodeIndex("user_fulltext_search",["User"],["name", "slug"])',
          'CALL db.index.fulltext.createNodeIndex("tag_fulltext_search",["Tag"],["id"])',
        ].map((statement) => txc.run(statement)),
      )
    })
    try {
      await writeTxResultPromise
      await getNeode().schema.install()
      // eslint-disable-next-line no-console
      console.log('Successfully created database indices and constraints!')
      next()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      next(error, null)
    } finally {
      session.close()
      driver.close()
    }
  }

  async load(next) {
    const driver = getDriver()
    const session = driver.session()
    const readTxResultPromise = session.readTransaction(async (txc) => {
      const result = await txc.run(
        'MATCH (migration:Migration) RETURN migration {.*} ORDER BY migration.timestamp DESC',
      )
      return result.records.map((r) => r.get('migration'))
    })
    try {
      const migrations = await readTxResultPromise
      if (migrations.length <= 0) {
        // eslint-disable-next-line no-console
        console.log(
          "No migrations found in database. If it's the first time you run migrations, then this is normal.",
        )
        return next(null, {})
      }
      const [{ title: lastRun }] = migrations
      next(null, { lastRun, migrations })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      next(error)
    } finally {
      session.close()
    }
  }

  async save(set, next) {
    const driver = getDriver()
    const session = driver.session()
    const { migrations } = set
    const writeTxResultPromise = session.writeTransaction((txc) => {
      return Promise.all(
        migrations.map(async (migration) => {
          const { title, description, timestamp } = migration
          const properties = { title, description, timestamp }
          const migrationResult = await txc.run(
            `
              MERGE (migration:Migration { title: $properties.title })
              ON MATCH SET
              migration += $properties
              ON CREATE SET
              migration += $properties,
              migration.migratedAt = toString(datetime())
            `,
            { properties },
          )
          return migrationResult
        }),
      )
    })
    try {
      await writeTxResultPromise
      next()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      next(error)
    } finally {
      session.close()
    }
  }
}

module.exports = Store
