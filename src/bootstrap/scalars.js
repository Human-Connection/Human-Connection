import {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} from 'graphql-iso-date'

export default function applyScalars(augmentedSchema) {
  augmentedSchema._typeMap.Date = GraphQLDate
  augmentedSchema._typeMap.Time = GraphQLTime
  augmentedSchema._typeMap.DateTime = GraphQLDateTime

  return augmentedSchema
}
