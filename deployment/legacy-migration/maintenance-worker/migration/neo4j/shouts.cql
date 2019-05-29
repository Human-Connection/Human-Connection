CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL}") YIELD value as shout
MATCH (u:User {id: shout.userId}), (p:Post {id: shout.foreignId})
MERGE (u)-[:SHOUTED]->(p)
;
