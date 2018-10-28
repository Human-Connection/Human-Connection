import {
  GraphQLLowerCaseDirective,
  GraphQLTrimDirective,
  GraphQLDefaultToDirective
} from 'graphql-custom-directives'

export default function applyDirectives(augmentedSchema) {
  const directives = [
    GraphQLLowerCaseDirective,
    GraphQLTrimDirective,
    GraphQLDefaultToDirective
  ]
  augmentedSchema._directives.push.apply(augmentedSchema._directives, directives)

  return augmentedSchema
}
