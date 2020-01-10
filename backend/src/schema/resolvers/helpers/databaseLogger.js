import Debug from 'debug'
const debugCypher = Debug('human-connection:neo4j:cypher')
const debugStats = Debug('human-connection:neo4j:stats')

export default function log(response) {
  const { counters, resultConsumedAfter, resultAvailableAfter, query } = response.summary
  const { text, parameters } = query
  debugCypher('%s', text)
  debugCypher('%o', parameters)
  debugStats('%o', counters)
  debugStats('%o', {
    resultConsumedAfter: resultConsumedAfter.toNumber(),
    resultAvailableAfter: resultAvailableAfter.toNumber(),
  })
}
