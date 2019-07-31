import { neode } from '../../../bootstrap/neo4j'

export const undefinedToNullResolver = list => {
  const resolvers = {}
  list.forEach(key => {
    resolvers[key] = async (parent, params, context, resolveInfo) => {
      return typeof parent[key] === 'undefined' ? null : parent[key]
    }
  })
  return resolvers
}

export default function Resolver(type, options = {}) {
  const instance = neode()
  const {
    idAttribute = 'id',
    undefinedToNull = [],
    count = {},
    hasOne = {},
    hasMany = {},
  } = options
  const _hasResolver = (resolvers, { key, connection }, { returnType }) => {
    return async (parent, params, context, resolveInfo) => {
      if (typeof parent[key] !== 'undefined') return parent[key]
      const id = parent[idAttribute]
      const statement = `MATCH(:${type} {${idAttribute}: {id}})${connection} RETURN related`
      const result = await instance.cypher(statement, { id })
      let response = result.records.map(r => r.get('related').properties)
      if (returnType === 'object') response = response[0] || null
      return response
    }
  }

  const countResolver = obj => {
    const resolvers = {}
    for (const [key, connection] of Object.entries(obj)) {
      resolvers[key] = async (parent, params, context, resolveInfo) => {
        if (typeof parent[key] !== 'undefined') return parent[key]
        const id = parent[idAttribute]
        const statement = `
          MATCH(u:${type} {${idAttribute}: {id}})${connection}
          WHERE NOT related.deleted = true AND NOT related.disabled = true
          RETURN COUNT(DISTINCT(related)) as count
        `
        const result = await instance.cypher(statement, { id })
        const [response] = result.records.map(r => r.get('count').toNumber())
        return response
      }
    }
    return resolvers
  }

  const hasManyResolver = obj => {
    const resolvers = {}
    for (const [key, connection] of Object.entries(obj)) {
      resolvers[key] = _hasResolver(resolvers, { key, connection }, { returnType: 'iterable' })
    }
    return resolvers
  }

  const hasOneResolver = obj => {
    const resolvers = {}
    for (const [key, connection] of Object.entries(obj)) {
      resolvers[key] = _hasResolver(resolvers, { key, connection }, { returnType: 'object' })
    }
    return resolvers
  }
  const result = {
    ...undefinedToNullResolver(undefinedToNull),
    ...countResolver(count),
    ...hasOneResolver(hasOne),
    ...hasManyResolver(hasMany),
  }
  return result
}
