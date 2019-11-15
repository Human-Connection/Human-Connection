# neo4j-graphql.js

We use an npm package called `neo4j-graphql-js` as a cypher query builder. This
library also generates resolvers for graphql queries, unless we implement them
ourselves.


## Debugging

As you can see in their [documentation](https://github.com/neo4j-graphql/neo4j-graphql-js)
it is possible to log out the generated cypher statements. To do so, run the
backend like this:

```sh
DEBUG=neo4j-graphql-js yarn run dev
```
