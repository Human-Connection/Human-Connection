CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL}") YIELD value as follow
MATCH (u1:User {id: follow.userId}), (u2:User {id: follow.foreignId})
MERGE (u1)-[:FOLLOWS]->(u2)
;
