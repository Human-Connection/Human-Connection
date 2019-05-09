CALL apoc.load.json('file:/tmp/mongo-export/splits/current-chunk.json') YIELD value as follow
MATCH (u1:User {id: follow.userId}), (u2:User {id: follow.foreignId})
MERGE (u1)-[:FOLLOWS]->(u2)
;
